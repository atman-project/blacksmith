use echo_node::node::EchoNode;
use n0_future::StreamExt;
use tauri::{AppHandle, Emitter, Manager, State};

pub fn init(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let node = tauri::async_runtime::block_on(EchoNode::spawn())
        .map_err(|e| std::io::Error::other(e.to_string()))?;

    let endpoint_id = node.endpoint().id().to_string();
    log::info!("[echo] iroh endpoint id: {endpoint_id}");
    log::info!("[echo] paste this into another instance's SYNC menu to receive payloads");

    let handle = app.handle().clone();
    let listener_node = node.clone();
    tauri::async_runtime::spawn(async move {
        let mut events = listener_node.accept_events();
        while let Some(event) = events.next().await {
            handle.emit("echo-accept", &event).ok();
        }
    });

    app.manage(node);
    Ok(())
}

#[tauri::command]
pub fn echo_endpoint_id(state: State<'_, EchoNode>) -> String {
    state.endpoint().id().to_string()
}

#[tauri::command]
pub async fn echo_connect(
    state: State<'_, EchoNode>,
    handle: AppHandle,
    peer: String,
    payload: String,
) -> Result<(), String> {
    let endpoint_id: echo_node::node::PeerId = peer
        .parse()
        .map_err(|e| format!("invalid endpoint id: {e}"))?;
    let mut events = state.connect(endpoint_id, payload);
    tauri::async_runtime::spawn(async move {
        while let Some(event) = events.next().await {
            handle.emit("echo-connect", &event).ok();
        }
    });
    Ok(())
}
