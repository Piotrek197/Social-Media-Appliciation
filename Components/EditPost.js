import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, withRouter } from "react-router-dom";
import Container from "./Container";
import Axios from "axios";
import LoadingDots from "./LoadingDots";
import { useImmerReducer } from "use-immer";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import NotFoundComponent from "./NotFoundComponent.js";

function EditSinglePost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  };

  function singlePostReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        break;
      case "titleChange":
        draft.title.value = action.value;
        draft.title.hasErrors = false;
        break;
      case "bodyChange":
        draft.body.value = action.value;
        draft.body.hasErrors = false;
        break;
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        break;
      case "saveRequestStarted":
        draft.isSaving = true;
        break;
      case "saveRequestFinished":
        draft.isSaving = false;
        break;
      case "titleValidate":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "YOu have to write a title";
        }
        break;
      case "bodyValidate":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "You have to write something here";
        }
        break;
      case "notFound":
        draft.notFound = true;
        break;
    }
  }
  const [state, dispatch] = useImmerReducer(singlePostReducer, originalState);

  function submitHandler(e) {
    e.preventDefault();
    dispatch({ type: "titleValidate", value: state.title.value });
    dispatch({ type: "bodyValidate", value: state.body.value });
    dispatch({ type: "submitRequest" });
  }
  useEffect(() => {
    const request = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: request.token
        });
        console.log(response.data);
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data });
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: "message",
              value: "You don't have rights to edit this post"
            });
            //redirect
            props.history.push("/");
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchPost();
    return () => {
      request.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" });
      const request = Axios.CancelToken.source();
      async function fetchPost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token
            },
            {
              cancelToken: request.token
            }
          );
          dispatch({ type: "saveRequestFinished" });
          appDispatch({ type: "message", value: "Post updated" });
          //   dispatch({ type: "fetchComplete", value: response.data });
        } catch (e) {
          console.log(e);
        }
      }
      fetchPost();
      return () => {
        request.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return <NotFoundComponent />;
  }
  if (state.isFetching)
    return (
      <Container title="...">
        <LoadingDots />
      </Container>
    );

  return (
    <Container title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post view
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onBlur={e =>
              dispatch({ type: "titleValidate", value: e.target.value })
            }
            onChange={e =>
              dispatch({ type: "titleChange", value: e.target.value })
            }
            value={state.title.value}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
          />
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            value={state.body.value}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            onChange={e =>
              dispatch({ type: "bodyChange", value: e.target.value })
            }
            onBlur={e =>
              dispatch({ type: "bodyValidate", value: e.target.value })
            }
          />
          {state.body.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {/* {state.isSaving ? "Saving..." : "Save Updates"} */}
          Save Updates
        </button>
      </form>
    </Container>
  );
}

export default withRouter(EditSinglePost);
