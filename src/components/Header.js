import React, { useCallback } from 'react';
import "./Header.css"


const Header = props => {

    const clearChat = useCallback(() => {
        props.setMessages([])
    }, [props])

    const clearTwitch = useCallback(() => {
        props.setMessages(messages => messages.filter(message => message.platform === "discord"))
    }, [props])

    const clearDiscord = useCallback(() => {
        props.setMessages(messages => messages.filter(message => message.platform === "twitch"))
    }, [props])

    return (
        <header>
            <div className="icon-container"><img className="icon" src={process.env.PUBLIC_URL + '/logo.svg'} alt=""/></div>
            <nav>
                <button onClick={clearChat}>Clear Chat</button>
                <button onClick={clearTwitch}>Clear Twitch Chat</button>
                <button onClick={clearDiscord}>Clear Discord Chat</button>
            </nav>
        </header>
    );
}

export default Header;
