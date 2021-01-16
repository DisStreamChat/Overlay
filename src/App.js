import React, { useEffect, useState, useCallback } from "react";
import firebase from "./firebase";
import "chatbits/dist/index.css";
import openSocket from "socket.io-client";

import { Message } from "chatbits";
import sha1 from "sha1";

import "./App.css";
import { TransitionGroup } from "react-transition-group";

function App() {
  const [channelName, setChannelName] = useState();
  const [channelId, setChannelId] = useState();
  const [streamerInfo, setStreamerInfo] = useState();
  const [socket, setSocket] = useState();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("channel")) {
      firebase
        .auth()
        .signInAnonymously()
        .then(async () => {
          const name = urlParams.get("channel");
          const ApiUrl = `https://api.disstreamchat.com/resolveuser/?user=${name}&platform=twitch`;
          const res = await fetch(ApiUrl);
          const json = await res.json();
          setChannelId(sha1(json.id));
          setChannelName(name);
        });
    }
  }, []);

  const removeMessage = useCallback(
    (id) => {
      const copy = [...messages];
      const index = copy.findIndex((msg) => {
        console.log(msg.id);
        return msg.id === id;
      });
      if (index === -1) return;
      copy[index].deleted = true;
      setMessages(copy);
    },
    [setMessages, messages]
  );

  useEffect(() => {
    setSocket(openSocket("https://api.distwitchchat.com"));
  }, []);

  useEffect(() => {
    if (socket) {
      socket.removeListener("chatmessage");
      socket.on("chatmessage", (msg) => {
        setMessages((m) => [
          ...m.slice(m.length - 100, m.length),
          { ...msg, deleted: false },
        ]);
      });
      return () => socket.removeListener("chatmessage");
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.removeListener("deletemessage");
      socket.on("deletemessage", removeMessage);
      return () => socket.removeListener("deletemessage");
    }
  }, [socket, removeMessage]);

  useEffect(() => {
    if (channelId?.length > 0) {
      (async () => {
        const db = firebase.firestore();
        const unsubscribe = db
          .collection("Streamers")
          .doc(channelId)
          .onSnapshot((snapshot) => {
            setStreamerInfo(snapshot.data());
          });
        return () => unsubscribe();
      })();
    }
  }, [channelId]);

  useEffect(() => {
    if (streamerInfo) {
      // send infoString to backend with sockets, to get proper socket connection
      if (socket) {
        socket.emit("addme", streamerInfo);
      }
    }
  }, [streamerInfo, socket]);

  console.log(streamerInfo)

  return (
    <div className="App">
      <div className="overlay-container">
        <div className="overlay">
          <TransitionGroup>
            {messages.map((msg) => (
              <Message
                isOverlay
                streamerInfo={streamerInfo.appSettings}
                delete={removeMessage}
                key={msg.uuid}
                msg={msg}
              />
            ))}
          </TransitionGroup>
        </div>
      </div>
    </div>
  );
}

export default App;
