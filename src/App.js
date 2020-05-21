import React, { useEffect, useState } from "react";
import firebase from "./firebase";
import "./App.css";

import openSocket from "socket.io-client";
import Message from "./components/Message";

import { AppContext } from "./contexts/AppContext";
import { useInterval } from 'react-use';

// URLSearchParams
function App() {
	const [userId, setUserId] = useState("");
	const [error, setError] = useState("");
	const [streamerInfo, setStreamerInfo] = useState();
	const [socket, setSocket] = useState();
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.href);
		if (urlParams.has("id")) {
			setUserId(urlParams.get("id"));
		} else {
			setError({
				code: "404",
				message: "missing user id",
			});
		}
	}, []);

	useEffect(() => {
		setSocket(openSocket("http://localhost:3200"));
	}, []);

    useEffect(() => {
        if (socket) {
            socket.on("chatmessage", msg => {
                setMessages((m) => [...m.slice(m.length - 100, m.length), { ...msg, deleted: false }])
            })
        }
    }, [socket])

	useEffect(() => {
		if (userId?.length > 0) {
			(async () => {
				const db = firebase.firestore();
				const unsubscribe = db
					.collection("Streamers")
					.doc(userId)
					.onSnapshot(snapshot => {
						setStreamerInfo(snapshot.data());
					});
				return () => unsubscribe();
			})();
		}
	}, [userId]);

	useEffect(() => {
		if (streamerInfo) {
			// send infoString to backend with sockets, to get proper socket connection
			if (socket) {
				socket.emit("addme", streamerInfo);
			}
		}
	}, [streamerInfo, socket]);

    const removeMessage = id => {
        const copy = [...messages]
        const index = copy.findIndex(msg => msg.uuid === id)
        copy[index].deleted = true
        setMessages(copy)
    }

	return (
		<AppContext.Provider
			value={{
				userId,
				setUserId,
				streamerInfo,
				setStreamerInfo,
			}}
		>
			<div className="App">
				<div className="overlay-container">
					<div className="overlay">
						{messages.map((msg) => (
                            <Message delete={removeMessage} key={msg.uuid} msg={msg} />
						))}
					</div>
				</div>
			</div>
		</AppContext.Provider>
	);
}

export default App;
