import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import {
	checkPermissions,
	requestPermissions,
	watchPosition,
} from "@tauri-apps/plugin-geolocation";
import {listen} from "@tauri-apps/api/event";

type LocationType = {
	longitude: number;
	latitude: number;
}

function App() {
	const [greetMsg, setGreetMsg] = useState("");
	const [name, setName] = useState("");
	const [location, setLocation] = useState<LocationType>({longitude: 0, latitude: 0})
	const [permission, setPermission] = useState<boolean>(false);

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		setGreetMsg(await invoke("greet", { name }));
	}

	useEffect(() => {
		console.log("effect");
		(async () => {
			await getPermission();
		})();
	}, []);

	useEffect(() => {
		const unlisten = listen<{latitude: number, longitude: number}>('location', (event) => {
			console.log(event.payload);
			setLocation({latitude: event.payload.latitude, longitude: event.payload.longitude})
    	});

		return () => {
		  unlisten.then(f => f());
		};
	}, []);

	async function getPermission() {
		let permissions = await checkPermissions();
		console.log(permissions);
		if (
			permissions.location === "prompt" ||
			permissions.location === "prompt-with-rationale"
		) {
			console.log("location", permissions.location);
			permissions = await requestPermissions(["location"]);
			console.log("location", permissions.location);
			setPermission(permissions.location === "granted");
		}

		if (permissions.location === "granted") {
			await watchPosition(
				{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
				(pos) => {
					console.log(pos);
				},
			);
		}
	}

	return (
		<main className="container">
			<h1>Welcome to Tauri + React</h1>

			<div className="row">
				<a href="https://vitejs.dev" target="_blank" rel="noreferrer">
					<img src="/vite.svg" className="logo vite" alt="Vite logo" />
				</a>
				<a href="https://tauri.app" target="_blank" rel="noreferrer">
					<img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
				</a>
				<a href="https://reactjs.org" target="_blank" rel="noreferrer">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<p>Click on the Tauri, Vite, and React logos to learn more.</p>

			<form
				className="row"
				onSubmit={(e) => {
					e.preventDefault();
					greet();
				}}
			>
				<input
					id="greet-input"
					onChange={(e) => setName(e.currentTarget.value)}
					placeholder="Enter a name..."
				/>
				<button type="submit">Greet</button>
				{/*<button type="button" onClick={getPermission}>Greet</button>*/}
			</form>
			<p>{greetMsg}</p>
			<p>Permission: {permission ? "granted" : "denied"}</p>
			<p>Longitude: {location.longitude}</p>
			<p>Latitude: {location.latitude}</p>
		</main>
	);
}

export default App;
