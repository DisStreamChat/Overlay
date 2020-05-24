import React, { useEffect, useState, useCallback } from "react";
import firebase from "./firebase";
import "./App.css";

import openSocket from "socket.io-client";
import Message from "./components/Message";

import { AppContext } from "./contexts/AppContext";

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

    const removeMessage = useCallback(id => {
        const copy = [...messages]
        const index = copy.findIndex(msg => {
            console.log(msg.id)
            return msg.id === id
        })
        if (index === -1) return
        copy[index].deleted = true
        setMessages(copy)
    }, [setMessages, messages])

	useEffect(() => {
		setSocket(openSocket("http://localhost:3200"));
	}, []);

    useEffect(() => {
        if (socket) {
            socket.removeListener('chatmessage');
            socket.on("chatmessage", msg => {
                setMessages((m) => [...m.slice(m.length - 100, m.length), { ...msg, deleted: false }])
            })
            return () => socket.removeListener('chatmessage');
        }

    }, [socket])

    useEffect(() => {
        if (socket) {
            socket.removeListener('deletemessage');
            socket.on("deletemessage", removeMessage)
            return () => socket.removeListener("deletemessage")
        }
    }, [socket, removeMessage])

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
