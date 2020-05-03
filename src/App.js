import React, {useEffect, useState} from 'react';
import firebase from "./firebase"
import './App.css';

import openSocket from 'socket.io-client';
import Message from './components/Message';
import Header from './components/Header';

// URLSearchParams
function App() {
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [streamerInfo, setStreamerInfo] = useState()
  const [socket, setSocket] = useState()
  const [messages, setMessages] = useState([])
  const [loaded, setLoaded] = useState(false) 

  useEffect(() => {
    if(loaded){
      console.log("hi");
      
      localStorage.setItem("messages", JSON.stringify(messages))
    }
  }, [messages, loaded])

  useEffect(() => {
    (async () => {
      await setMessages(JSON.parse(localStorage.getItem("messages")))
      setLoaded(true)
    })()
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href)
    if(urlParams.has("id")){
      setUserId(urlParams.get("id"))
    }else{
      setError({
        code: "404",
        message: "missing user id"
      })
    }
  }, [])

  useEffect(() => {
    setSocket(openSocket('http://localhost:3200'))
  },[])

  useEffect(() => {
    if(socket){
      socket.on("chatmessage", msg => {
        setMessages(m => [...m, msg])
      })
    }
  }, [socket])

  useEffect(() => {
    if(userId?.length > 0){
      (async () => {
        const db = firebase.firestore()
        const streamerInfo = await db.collection("Streamers").doc(userId).get()

       setStreamerInfo(streamerInfo.data());
      })();
    }
  }, [userId])

  useEffect(() => {
    if(streamerInfo){
      // send infoString to backend with sockets, to get proper socket connection
      if(socket){
        socket.emit("addme", streamerInfo)
      }
    }
  }, [streamerInfo, socket])

  const removeMessage = id => {
    setTimeout(() => {
      const copy = [...messages].filter(m => m.uuid !== id)
      console.log(copy)
      setMessages(copy)
    }, 800)
  }  

  console.log(messages);
  

  return (
    <div className="App">
      <Header setMessages={setMessages}/>
      <div className="overlay-container">
        <div className="overlay">
          {messages.map(msg => (
            <Message delete={removeMessage} key={msg.uuid} msg={msg} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
