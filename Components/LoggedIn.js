import React, { useContext } from "react";
import { Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import ReactTooltip from "react-tooltip";

function LoggedIn(props) {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  return (
    <div className="flex-row my-3 my-md-0">
      <a
        data-tip="Search"
        data-for="search" //match to id in ReactTooltip component
        onClick={e => {
          e.preventDefault();
          appDispatch({ type: "openSearchBar" });
        }}
        href="#"
        className="text-white mr-2 header-search-icon"
      >
        <i className="fas fa-search"></i>
      </a>{" "}
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />
      <span
        onClick={() => appDispatch({ type: "toggleChat" })}
        data-tip="Chat"
        data-for="chat"
        className={
          "mr-2 header-chat-icon " +
          (appState.unreadMsgNumber ? " text-danger" : " text-white")
        }
      >
        <i className="fas fa-comment"></i>
        {appState.unreadMsgNumber ? (
          <span className="chat-count-badge text-white">
            {appState.unreadMsgNumber < 10 ? appState.unreadMsgNumber : "9+"}{" "}
          </span>
        ) : (
          ""
        )}
      </span>{" "}
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />
      <Link
        data-tip="Profile"
        data-for="profile"
        to={`/profile/${appState.user.username}`}
        className="mr-2"
      >
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>{" "}
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />
      <Link to="/create-post" className="btn btn-sm btn-success mr-2">
        Create Post
      </Link>{" "}
      <button
        className="btn btn-sm btn-secondary"
        onClick={() => {
          appDispatch({ type: "logout" });
          appDispatch({
            type: "message",
            value: "You logged out."
          });
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default LoggedIn;
