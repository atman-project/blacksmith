use keyring::{Entry, Error};

const SERVICE: &str = "ink.blacksmith.app";

fn entry(key_id: &str) -> Result<Entry, String> {
    let account = format!("api-key-{}", key_id);
    Entry::new(SERVICE, &account).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_api_key(key_id: String) -> Result<Option<String>, String> {
    match entry(&key_id)?.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn set_api_key(key_id: String, key: String) -> Result<(), String> {
    entry(&key_id)?.set_password(&key).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_api_key(key_id: String) -> Result<(), String> {
    match entry(&key_id)?.delete_credential() {
        Ok(()) | Err(Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
