import React, { useState, useEffect, useContext } from "react";
import Container from "./Container";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

function GuestComponent() {
  const appDispatch = useContext(DispatchContext);
  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      msg: "",
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      msg: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      msg: ""
    },
    submitCount: 0
  };

  function reducer(draft, action) {
    switch (action.type) {
      case "submitForm":
        if (
          !draft.username.hasErrors &&
          draft.username.isUnique &&
          !draft.email.hasErrors &&
          draft.email.isUnique &&
          !draft.password.hasErrors
        ) {
          draft.submitCount++;
        } else {
          console.log("usernameNoErorrs", !draft.username.hasErrors);
          console.log("emailNoErorrs", !draft.email.hasErrors);
          console.log("passwordNoErorrs", !draft.password.hasErrors);
          console.log("usernameIsUnique", draft.username.isUnique);
          console.log("emailIsUnique", draft.email.isUnique);
        }
        break;
      case "usernameImmediately":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true;
          draft.username.msg = "Username cannot exceed 30 characters";
        }
        if (
          draft.username.value &&
          !/^([a-zA-z0-9]+)$/.test(draft.username.value)
        ) {
          draft.username.hasErrors = true;
          draft.username.msg = "Username can only contain letters and numbers";
        }
        break;
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.msg = "Username must have min. 3 characters.";
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++;
          // console.log(draft.username.checkCount);
        }
        break;
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.msg = "User already exists";
        } else {
          draft.username.isUnique = true;
        }
        break;
      case "emailImmediately":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        break;
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.msg = "You have to provide valid email";
        }
        if (!draft.hasErrors && !action.noRequest) {
          draft.email.checkCount++;
        }
        break;
      case "emailUniqueResults":
        if (action.value) {
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.msg = "This email is used.";
        } else {
          draft.email.isUnique = true;
        }
        break;
      case "passwordImmediately":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.msg =
            "Password cannot exceed more than 50 characters.";
        }
        break;
      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true;
          draft.password.msg = "Password must have min. 12 characters";
        }
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(
        () => dispatch({ type: "usernameAfterDelay" }),
        700
      );
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(
        () => dispatch({ type: "emailAfterDelay" }),
        700
      );
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(
        () => dispatch({ type: "passwordAfterDelay" }),
        700
      );
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  useEffect(() => {
    if (state.username.checkCount) {
      const reToken = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/doesUsernameExist",
            { username: state.username.value },
            { cancelToken: reToken.token }
          );
          dispatch({ type: "usernameUniqueResults", value: response.data });
        } catch (e) {
          console.log(e);
        }
      }
      fetchResults();
    }
  }, [state.username.checkCount]);

  useEffect(() => {
    if (state.email.checkCount) {
      const reToken = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/doesemailExist",
            { email: state.email.value },
            { cancelToken: reToken.token }
          );
          dispatch({ type: "emailUniqueResults", value: response.data });
        } catch (e) {
          console.log(e);
        }
      }
      fetchResults();
    }
  }, [state.email.checkCount]);

  useEffect(() => {
    if (state.submitCount) {
      const reToken = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/register",
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value
            },
            { cancelToken: reToken.token }
          );
          appDispatch({ type: "login", data: response.data });
          appDispatch({ type: "message", value: "Welcome!" });
        } catch (e) {
          console.log(e);
        }
      }
      fetchResults();
    }
  }, [state.submitCount]);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({
      type: "usernameImmediately",
      value: state.username.value
    });
    dispatch({
      type: "usernameAfterDelay",
      value: state.username.value,
      noRequest: false
    });
    dispatch({
      type: "emailImmediately",
      value: state.email.value
    });
    dispatch({
      type: "emailAfterDelay",
      value: state.email.value,
      noRequest: false
    });
    dispatch({
      type: "passwordImmediately",
      value: state.password.value
    });
    dispatch({
      type: "passwordAfterDelay",
      value: state.password.value
    });
    dispatch({ type: "submitForm" });
  }
  return (
    <Container wide={true} title="Home">
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">
            Are you sick of short tweets and impersonal &ldquo;shared&rdquo;
            posts that are reminiscent of the late 90&rsquo;s email forwards? We
            believe getting back to actually writing is the key to enjoying the
            internet again.
          </p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input
                onChange={e =>
                  dispatch({
                    type: "usernameImmediately",
                    value: e.target.value
                  })
                }
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
              />
              <CSSTransition
                in={state.username.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.username.msg}
                </div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input
                onChange={e =>
                  dispatch({
                    type: "emailImmediately",
                    value: e.target.value
                  })
                }
                id="email-register"
                name="email"
                className="form-control"
                type="text"
                placeholder="you@example.com"
                autoComplete="off"
              />
              <CSSTransition
                in={state.email.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.email.msg}
                </div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input
                onChange={e =>
                  dispatch({
                    type: "passwordImmediately",
                    value: e.target.value
                  })
                }
                id="password-register"
                name="password"
                className="form-control"
                type="password"
                placeholder="Create a password"
              />
              <CSSTransition
                in={state.password.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.password.msg}
                </div>
              </CSSTransition>
            </div>
            <button
              type="submit"
              className="py-3 mt-4 btn btn-lg btn-success btn-block"
            >
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}

export default GuestComponent;
