import React, { useState, useCallback} from "react";
import DOMPurify from "dompurify";
import marked from "marked"
import Avatar from "@material-ui/core/Avatar";
import HighlightOffTwoToneIcon from '@material-ui/icons/HighlightOffTwoTone';
import {CSSTransition} from "react-transition-group"
import "./Message.css"

let renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
    let link = marked.Renderer.prototype.link.apply(this, arguments);
    return link.replace("<a", "<a target='_blank' rel='noopener noreferrer'" );
};

marked.setOptions({
    renderer: renderer
});

const Message = props => {
    const [active, setActive] = useState(true)

    const deleteMe = useCallback(() => {
        props.delete(props.msg.uuid)
        setActive(false)
    }, [props])
    
    return (
        <CSSTransition unmountOnExit in={active} timeout={700} classNames="my-node">
            <div className={`message ${props.msg.platform}-message ${props.msg.messageId} ${!active && "fade-out"}`}>
                <div className="name name-header">
                    <span className="name">
                        <div className="profile">
                            <Avatar className="profile-pic" src={props.msg.avatar} alt={props.msg.displayName + " avatar"}/>
                        </div>
                        <span dangerouslySetInnerHTML={{
                            __html: marked(DOMPurify.sanitize(props.msg.displayName, {
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
                        </span>
                    </span>
                    <HighlightOffTwoToneIcon onClick={deleteMe} className="exit-button" />
                </div>
                <div className="msg-body" dangerouslySetInnerHTML={{
                    __html: marked(DOMPurify.sanitize(props.msg.body,{
                        FORBID_ATTR: [
                          "style",
                          "onerror",
                          "onload",
                          "width",
                          "height",
                          "class",
                          "id"
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