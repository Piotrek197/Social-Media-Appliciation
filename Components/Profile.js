import React, { useEffect, useContext } from "react";
import Container from "./Container";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePostsComponent from "./ProfilePostsComponent";
import { useImmer } from "use-immer";
import ProfileFollowersComponent from "./ProfileFollowersComponent";
import ProfileFollowingComponent from "./ProfileFollowingComponent";

function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowRequestCount: 0,
    stopFollowRequestCount: 0,
    profileDetails: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=125",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    }
  });
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, {
          token: appState.user.token
        });
        setState(draft => {
          draft.profileDetails = response.data;
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [username]);

  useEffect(() => {
    if (state.startFollowRequestCount) {
      setState(draft => {
        draft.followActionLoading = true;
      });
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileDetails.profileUsername}`,
            {
              token: appState.user.token
            }
          );
          setState(draft => {
            draft.profileDetails.isFollowing = true;
            draft.profileDetails.counts.followerCount++;
            draft.followActionLoading = false;
          });
        } catch (err) {
          console.log(err);
        }
      }
      fetchData();
    }
  }, [state.startFollowRequestCount]);

  useEffect(() => {
    if (state.stopFollowRequestCount) {
      setState(draft => {
        draft.followActionLoading = true;
      });
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileDetails.profileUsername}`,
            {
              token: appState.user.token
            }
          );
          setState(draft => {
            draft.profileDetails.isFollowing = false;
            draft.profileDetails.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (err) {
          console.log(err);
        }
      }
      fetchData();
    }
  }, [state.stopFollowRequestCount]);

  function startFollow() {
    setState(draft => {
      draft.startFollowRequestCount++;
    });
  }
  function stopFollow() {
    setState(draft => {
      draft.stopFollowRequestCount++;
    });
  }
  return (
    <Container title={`${appState.user.username} Profile`}>
      <h2>
        <img
          className="avatar-small"
          src={state.profileDetails.profileAvatar}
        />
        {state.profileDetails.profileUsername}
        {appState.loggedIn &&
          !state.profileDetails.isFollowing &&
          appState.user.username != state.profileDetails.profileUsername &&
          state.profileDetails.profileUsername != "..." && (
            <button
              onClick={startFollow}
              disabled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileDetails.isFollowing &&
          appState.user.username != state.profileDetails.profileUsername &&
          state.profileDetails.profileUsername != "..." && (
            <button
              onClick={stopFollow}
              disabled={state.followActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Stop Follow <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink
          exact
          to={`/profile/${state.profileDetails.profileUsername}`}
          className="nav-item nav-link"
        >
          Posts: {state.profileDetails.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileDetails.profileUsername}/followers`}
          className="nav-item nav-link"
        >
          Followers: {state.profileDetails.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileDetails.profileUsername}/following`}
          className="nav-item nav-link"
        >
          Following: {state.profileDetails.counts.followingCount}
        </NavLink>
      </div>

      {/* <ProfilePostsComponent /> */}
      {/* <ProfileFollowersComponent /> */}
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePostsComponent />
        </Route>
        <Route path="/profile/:username/:followers">
          <ProfileFollowersComponent />
        </Route>
        <Route path="/profile/:username/:following">
          <ProfileFollowingComponent />
        </Route>
      </Switch>
    </Container>
  );
}

export default Profile;
