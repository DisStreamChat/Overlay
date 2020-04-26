import React, {useEffect, useState} from 'react';
import firebase from "./firebase"
import './App.css';

import openSocket from 'socket.io-client';

//URLSearchParams


function App() {
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [streamerInfo, setStreamerInfo] = useState()
  const [socket, setSocket] = useState()
  const [messages, setMessages] = useState([])
  

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
      socket.on("discordmessage", msg => {
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
      console.log(streamerInfo);

      // send infoString to backend with sockets, to get proper socket connection
      if(socket){
        socket.emit("addme", streamerInfo)
      }
    }
  }, [streamerInfo, socket])
  

  return (
    <div className="App">
      <h1>Overlay</h1>
      {messages.map(msg => (
        <pre>{JSON.stringify(msg, null, 4)}</pre>
      ))}
    </div>
  );
}

export default App;
