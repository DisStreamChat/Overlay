import React, { useState, useCallback, useEffect, useContext} from "react";
import DOMPurify from "dompurify";
import marked from "marked"
import Avatar from "@material-ui/core/Avatar";
import HighlightOffTwoToneIcon from '@material-ui/icons/HighlightOffTwoTone';
import {CSSTransition} from "react-transition-group"
import "./Message.css"
import Tooltip from '@material-ui/core/Tooltip';
import {AppContext} from "../contexts/AppContext"

let renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
    let link = marked.Renderer.prototype.link.apply(this, arguments);
    return link.replace("<a", "<a target='_blank' rel='noopener noreferrer'" );
};

marked.setOptions({
    renderer: renderer
});

const discordLogo = "https://i.imgur.com/ZOKp8LH.png"
const twitchLogo = "https://cdn.vox-cdn.com/thumbor/hSP3rKWFHC7hbbtpCp_DIKiRSDI=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/2937002/twitch.0.jpg"

const seconds = millis => millis*1000

const Message = props => {
    const [active, setActive] = useState(true)

    const [displayPlatform, setDisplayPlatform] = useState(true)
    const { streamerInfo } = useContext(AppContext)

    useEffect(() => {
        setDisplayPlatform(streamerInfo?.displayPlatform)
    }, [streamerInfo])

    useEffect(() => {
        setActive(!props.msg.deleted)
    }, [props])

    return (
        <CSSTransition unmountOnExit in={active} timeout={700} classNames="my-node">
            <div className={`message ${displayPlatform === "full" && `${props.msg.platform}-message`} ${props.msg.messageId} ${!active && "fade-out"}`}>
                <div className="name name-header">
                    <span className="name">
                        <div className="profile">
                            <Avatar className="profile-pic" src={props.msg.avatar} alt=""/>
                            {props.msg.badges.subscriber &&
                                <Tooltip arrow title={props.msg.badges.subscriber.title} placement="top"><img className="sub-badge" src={props.msg.badges.subscriber.image} alt=""></img></Tooltip>
                            }
                            {Object.entries(props.msg.badges).map((badge, i) => {
                                return badge[0] !== "subscriber" ? <Tooltip arrow title={badge[1].title} placement="top"><img src={badge[1].image} alt="" className={`chat-badge badge-${i}`}></img></Tooltip> : <></>
                            })}
                        </div>
                        <span>
                            {props.msg.displayName}
                        </span>
                        {displayPlatform === "medium" && <Tooltip title={props.msg.platform} placement="top" arrow><img width="20" src={props.msg.platform === "discord" ? discordLogo : twitchLogo} alt="platform" className={"chat-badge " + props.msg.platform} /></Tooltip>}
                    </span>
                </div>
                <div className="msg-body" dangerouslySetInnerHTML={{
                    __html: marked(DOMPurify.sanitize(props.msg.body,{
                        FORBID_ATTR: [
                          "style",
                          "onerror",
                          "onload",
                          "width",
                          "height",
                        ],
                        FORBID_TAGS: [
                          "table",
                          "script",
                          "audio",
                          "video",
                          "style",
                          "iframe",
                          "textarea",
                          "input",
                          "form",
                        ],
                    }
                    ))}}>
                </div>
            </div>
        </CSSTransition>
    );
}

export default Message;