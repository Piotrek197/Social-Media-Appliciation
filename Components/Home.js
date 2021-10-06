import React, { useContext, useEffect } from "react";
import Container from "./Container";
import StateContext from "../StateContext";
import { useImmer } from "use-immer";
import LoadingDots from "./LoadingDots";
import Axios from "axios";
import { Link } from "react-router-dom";
import Post from "./Post";

function Home(props) {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    isLoading: true,
    feed: []
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.post("/getHomeFeed", {
          token: appState.user.token
        });
        setState(draft => {
          draft.isLoading = false;
          draft.feed = response.data;
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, []);

  if (state.isLoading) {
    return <LoadingDots />;
  }
  return (
    <Container title="Your Feed">
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center mb-4">
            Latest posts from your subcrip tions
          </h2>
          <div className="list-group">
            {state.feed.map(post => {
              return <Post post={post} key={post._id} />;
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If
            you dont have any friends to follow thats okay; you can use the
            Search feature in the top menu bar to find content written by people
            with similar interests and then follow them.
          </p>
        </>
      )}
    </Container>
  );
}

export default Home;
