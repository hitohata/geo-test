use tauri::Emitter;
use tauri_plugin_geolocation::GeolocationExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct Position {
    latitude: f64,
    longitude: f64,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_geolocation::init())
        .setup(|app| {
            let location = std::sync::Arc::new(app.handle().clone());
            let loc = location.clone();
            println!("setup started");
            std::thread::spawn(move || loop {
                let location = loc
                    .geolocation()
                    .get_current_position(None)
                    .unwrap_or_else(|e| panic!("{:?}", e));
                println!("{:?}, {:?}", location.coords.latitude, location.coords.longitude);
                loc.emit(
                    "location",
                    Position {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    },
                )
                .unwrap_or_else(|e| panic!("{:?}", e));
                std::thread::sleep(std::time::Duration::from_millis(1000));
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
