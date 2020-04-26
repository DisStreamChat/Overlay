import React from 'react';
import "./Message.css"
import MDReactComponent from 'markdown-react-js';
import renderHTML from 'react-render-html';
import DOMPurify from 'dompurify';

const Message = props => {
    return (
        <div className={`message ${props.msg.platform}-message`}>
            <div className="name"><img className="profile-pic" src={props.msg.avatar} alt={props.msg.displayName + " avatar"} onError={() => {}}/>{props.msg.displayName}</div>
            <div className="msg-body">
                {renderHTML(DOMPurify.sanitize(props.msg.body,{FORBID_ATTR: [
            'style',
            'onerror',
            'onload',
            "width",
            "height"
          ],
          FORBID_TAGS: [
            'table',
            'script',
            'audio',
            'video',
            'style',
            'iframe',
            'textarea',
          ],
        }))}
            </div>
        </div>
    );
}

export default Message;