import React, { useState} from "react";
import DOMPurify from "dompurify";
import marked from "marked"
import Avatar from "@material-ui/core/Avatar";
import HighlightOffTwoToneIcon from '@material-ui/icons/HighlightOffTwoTone';
import {CSSTransition} from "react-transition-group"
import "./Message.css"

const Message = props => {
    const [active, setActive] = useState(true)
    
    return (
        <CSSTransition unmountOnExit in={active} timeout={700} classNames="my-node">
            <div className={`message ${props.msg.platform}-message ${!active && "fade-out"}`}>
                <div className="name name-header">
                    <span className="name">
                        <div className="profile">
                            <Avatar className="profile-pic" src={props.msg.avatar} alt={props.msg.displayName + " avatar"}/>
                        </div>
                        {props.msg.displayName}
                    </span>
                    <HighlightOffTwoToneIcon onClick={() => {setActive(false)}} className="exit-button" />
                </div>
                <div className="msg-body" dangerouslySetInnerHTML={{
                    __html: marked(DOMPurify.sanitize(props.msg.body,{
                        FORBID_ATTR: [
                          "style",
                          "onerror",
                          "onload",
                          "width",
                          "height"
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