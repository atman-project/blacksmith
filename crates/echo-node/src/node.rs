use anyhow::Result;
use async_channel::Sender;
use iroh::{
    Endpoint, EndpointId,
    endpoint::Connection,
    protocol::{AcceptError, ProtocolHandler, Router},
};

pub use iroh::EndpointId as PeerId;
use n0_future::{Stream, StreamExt, boxed::BoxStream, task};
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;
use tokio_stream::wrappers::BroadcastStream;
use tracing::info;

#[derive(Debug, Clone)]
pub struct EchoNode {
    router: Router,
    accept_events: broadcast::Sender<AcceptEvent>,
}

impl EchoNode {
    pub async fn spawn() -> Result<Self> {
        let endpoint = iroh::Endpoint::builder(iroh::endpoint::presets::N0)
            .alpns(vec![Echo::ALPN.to_vec()])
            .bind()
            .await?;
        let (event_sender, _event_receiver) = broadcast::channel(128);
        let echo = Echo::new(event_sender.clone());
        let router = Router::builder(endpoint).accept(Echo::ALPN, echo).spawn();
        Ok(Self {
            router,
            accept_events: event_sender,
        })
    }

    pub fn endpoint(&self) -> &Endpoint {
        self.router.endpoint()
    }

    pub fn accept_events(&self) -> BoxStream<AcceptEvent> {
        let receiver = self.accept_events.subscribe();
        Box::pin(BroadcastStream::new(receiver).filter_map(|event| event.ok()))
    }

    pub fn connect(
        &self,
        endpoint_id: EndpointId,
        payload: String,
    ) -> impl Stream<Item = ConnectEvent> + Unpin + use<> {
        let (event_sender, event_receiver) = async_channel::bounded(16);
        let endpoint = self.router.endpoint().clone();
        task::spawn(async move {
            let res = connect(&endpoint, endpoint_id, payload, event_sender.clone()).await;
            let error = res.as_ref().err().map(|err| err.to_string());
            event_sender.send(ConnectEvent::Closed { error }).await.ok();
        });
        Box::pin(event_receiver)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ConnectEvent {
    Connected,
    Sent { bytes_sent: u64 },
    Received { bytes_received: u64 },
    Closed { error: Option<String> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum AcceptEvent {
    Accepted {
        endpoint_id: EndpointId,
    },
    Echoed {
        endpoint_id: EndpointId,
        bytes_sent: u64,
    },
    Closed {
        endpoint_id: EndpointId,
        error: Option<String>,
    },
}

#[derive(Debug, Clone)]
pub struct Echo {
    event_sender: broadcast::Sender<AcceptEvent>,
}

impl Echo {
    pub const ALPN: &[u8] = b"iroh/blacksmith-echo/0";
    pub fn new(event_sender: broadcast::Sender<AcceptEvent>) -> Self {
        Self { event_sender }
    }
}

impl Echo {
    async fn handle_connection(
        self,
        connection: Connection,
    ) -> std::result::Result<(), AcceptError> {
        let endpoint_id = connection.remote_id();
        self.event_sender
            .send(AcceptEvent::Accepted { endpoint_id })
            .ok();
        let res = self.handle_connection_0(&connection).await;
        let error = res.as_ref().err().map(|err| err.to_string());
        self.event_sender
            .send(AcceptEvent::Closed { endpoint_id, error })
            .ok();
        res
    }

    async fn handle_connection_0(
        &self,
        connection: &Connection,
    ) -> std::result::Result<(), AcceptError> {
        let endpoint_id = connection.remote_id();
        info!("Accepted connection from {endpoint_id}");

        let (mut send, mut recv) = connection.accept_bi().await?;
        let bytes_sent = tokio::io::copy(&mut recv, &mut send).await?;
        info!("Copied over {bytes_sent} byte(s)");
        self.event_sender
            .send(AcceptEvent::Echoed {
                endpoint_id,
                bytes_sent,
            })
            .ok();

        send.finish()?;
        connection.closed().await;
        Ok(())
    }
}

impl ProtocolHandler for Echo {
    async fn accept(&self, connection: Connection) -> std::result::Result<(), AcceptError> {
        self.clone().handle_connection(connection).await
    }
}

async fn connect(
    endpoint: &Endpoint,
    endpoint_id: EndpointId,
    payload: String,
    event_sender: Sender<ConnectEvent>,
) -> Result<()> {
    let connection = endpoint.connect(endpoint_id, Echo::ALPN).await?;
    event_sender.send(ConnectEvent::Connected).await?;
    let (mut send_stream, mut recv_stream) = connection.open_bi().await?;
    let send_task = task::spawn({
        let event_sender = event_sender.clone();
        async move {
            let bytes_sent = payload.len();
            send_stream.write_all(payload.as_bytes()).await?;
            event_sender
                .send(ConnectEvent::Sent {
                    bytes_sent: bytes_sent as u64,
                })
                .await?;
            anyhow::Ok(())
        }
    });
    let n = tokio::io::copy(&mut recv_stream, &mut tokio::io::sink()).await?;
    connection.close(1u8.into(), b"done");
    event_sender
        .send(ConnectEvent::Received {
            bytes_received: n as u64,
        })
        .await?;
    send_task.await??;
    Ok(())
}
