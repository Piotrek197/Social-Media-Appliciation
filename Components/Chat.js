import React, { useContext, useEffect, useRef } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

const socket = io("http://localhost:8080");

function Chat() {
  const chatInput = useRef(null);
  const chatLog = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    inputValue: "",
    chatMsgs: []
  });

  useEffect(() => {
    if (appState.isChatOpen) {
      chatInput.current.focus();
      appDispatch({ type: "clearUnreadMsgNumber" });
    }
  }, [appState.isChatOpen]);

  useEffect(() => {
    socket.on("chatFromServer", msg => {
      setState(draft => {
        draft.chatMsgs.push(msg);
      });
    });
  }, []);

  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMsgs.length && !appState.isChatOpen)
      appDispatch({ type: "incMessageNumber" });
  }, [state.chatMsgs]);

  const handleInputChange = e => {
    const value = e.target.value;
    setState(draft => {
      draft.inputValue = value;
    });
  };

  function handleSubmit(e) {
    e.preventDefault();
    //Send msg to chat server
    socket.emit("chatFromBrowser", {
      message: state.inputValue,
      token: appState.user.token
    });
    setState(draft => {
      //add msg
      draft.chatMsgs.push({
        message: draft.inputValue,
        username: appState.user.username,
        avatar: appState.user.avatar
      });
      draft.inputValue = "";
    });
  }
  return (
    <div
      id="chat-wrapper"
      className={
        "chat-wrapper shadow border-top border-left border-right " +
        (appState.isChatOpen ? "chat-wrapper--is-visible" : "")
      }
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => appDispatch({ type: "closeChat" })}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div ref={chatLog} id="chat" className="chat-log">
        {state.chatMsgs.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          }
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        id="chatForm"
        className="chat-form border-top"
      >
        <input
          value={state.inputValue}
          onChange={handleInputChange}
          ref={chatInput}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
        />
      </form>
    </div>
  );
}

export default Chat;
