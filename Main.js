import React, { useState, useReducer, useEffect } from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Axios from "axios";
import { CSSTransition } from "react-transition-group";

Axios.defaults.baseURL = "http://localhost:8080";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

//Moje komponenty
import Header from "./komponenty/Header";
import GuestComponent from "./komponenty/GuestComponent";
import Footer from "./komponenty/Footer";
import About from "./komponenty/About";
import Terms from "./komponenty/Terms";
import Home from "./komponenty/Home";
import CreatePost from "./komponenty/CreatePost";
import ViewSinglePost from "./komponenty/ViewSinglePost";
import FlashMessages from "./komponenty/FlashMessagesComponent";
import Profile from "./komponenty/Profile";
import EditPost from "./komponenty/EditPost";
import NotFoundComponent from "./komponenty/NotFoundComponent";
import SearchBar from "./komponenty/SearchBar";
import Chat from "./komponenty/Chat";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexappToken"),
      username: localStorage.getItem("complexappUsername"),
      avatar: localStorage.getItem("complexappAvatar")
    },
    isSearchBarOpen: false,
    isChatOpen: false,
    unreadMsgNumber: 0
  };
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case "logout":
        draft.loggedIn = false;
        break;
      case "message":
        draft.flashMessages.push(action.value);
        break;
      case "openSearchBar":
        draft.isSearchBarOpen = true;
        break;
      case "closeSearchBar":
        draft.isSearchBarOpen = false;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        break;
      case "closeChat":
        draft.isChatOpen = false;
        break;
      case "incMessageNumber":
        draft.unreadMsgNumber++;
        break;
      case "clearUnreadMsgNumber":
        draft.unreadMsgNumber = 0;
        break;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexappToken", state.user.token);
      localStorage.setItem("complexappUsername", state.user.username);
      localStorage.setItem("complexappAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("complexappToken");
      localStorage.removeItem("complexappUsername");
      localStorage.removeItem("complexappAvatar ");
    }
  }, [state.loggedIn]);

  useEffect(() => {
    if (state.loggedIn) {
      const reToken = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/checkToken",
            { token: state.user.token },
            { cancelToken: reToken.token }
          );
          if (!response.data) {
            dispatch({ type: "logout" });
            appDispatch({
              type: "message",
              value: "Sesja zakończyła się."
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
      fetchResults();
    }
  }, []);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Switch>
            <Route path="/profile/:username">
              <Profile />
            </Route>
            <Route path="/" exact>
              {state.loggedIn ? <Home /> : <GuestComponent />}
            </Route>
            <Route path="/create-post">
              <CreatePost />
            </Route>
            <Route path="/post/:id" exact>
              <ViewSinglePost />
            </Route>
            <Route path="/post/:id/edit" exact>
              <EditPost />
            </Route>
            <Route path="/about-us">
              <About />
            </Route>
            <Route path="/terms">
              <Terms />
            </Route>
            <Route>
              <NotFoundComponent />
            </Route>
          </Switch>
          <CSSTransition
            timeout={330}
            in={state.isSearchBarOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <SearchBar />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
