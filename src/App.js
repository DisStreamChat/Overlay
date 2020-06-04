import React, { useEffect, useState, useCallback } from "react";
import firebase from "./firebase";
import "./App.css";

import openSocket from "socket.io-client";
import {Message} from "distwitchchat-componentlib";
import "distwitchchat-componentlib/dist/index.css"

import { AppContext } from "./contexts/AppContext";

import "./Message.css"
// URLSearchParams
function App() {
	const [userId, setUserId] = useState("");
	const [streamerInfo, setStreamerInfo] = useState();
	const [socket, setSocket] = useState();
	const [messages, setMessages] = useState([]);


	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has("id")) {
            firebase.auth().signInAnonymously().then(() => {

                setUserId(urlParams.get("id"));
            })
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
		setSocket(openSocket("https://api.distwitchchat.com"));
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
                            <Message isOverlay streamerInfo={streamerInfo.overlaySettings} delete={removeMessage} key={msg.uuid} msg={msg} />
						))}
					</div>
				</div>
			</div>
		</AppContext.Provider>
	);
}

export default App;
