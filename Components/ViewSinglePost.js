import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, withRouter } from "react-router-dom";
import Container from "./Container";
import Axios from "axios";
import LoadingDots from "./LoadingDots";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFoundComponent from "./NotFoundComponent";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
  const appState = useContext(StateContext);
  const globalDispatch = useContext(DispatchContext);
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const { id } = useParams();

  useEffect(() => {
    const request = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: request.token
        });
        console.log(response.data);
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    fetchPost();
    return () => {
      request.cancel();
    };
  }, [id]);

  if (!isLoading && !post) {
    return <NotFoundComponent />;
  }
  if (isLoading)
    return (
      <Container title="...">
        <LoadingDots />
      </Container>
    );

  const date = new Date(post.createdDate);
  const dateFormated = `${date.getDate()}. ${
    date.getMonth() + 1
  }.${date.getFullYear()}`;

  function isAuthor() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  }

  async function deleteHandler() {
    const confirm = window.confirm("Czy naprawdę usunąć posta?");
    if (confirm) {
      try {
        const res = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token }
        });

        if (res.data == "Success") {
          globalDispatch({ type: "message", value: "Post został usunięty" });
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  return (
    <Container title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isAuthor() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tip="Edit"
              data-for="edit"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{" "}
            <Link
              onClick={deleteHandler}
              data-tip="Delete"
              data-for="delete"
              className="delete-post-button text-danger"
            >
              <i className="fas fa-trash"></i>
            </Link>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{" "}
        w {dateFormated}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} />
      </div>
    </Container>
  );
}

export default withRouter(ViewSinglePost);
