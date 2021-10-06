import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import { Link } from "react-router-dom";
import LoadingDots from "./LoadingDots";
import Post from "./Post";

function ProfilePostsComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`);
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    fetchPosts();
  }, [username]);

  if (isLoading) return <LoadingDots />;
  return (
    <div className="list-group">
      {posts.map(post => {
        return <Post post={post} key={post._id} noAuthor={true} />;
      })}
    </div>
  );
}

export default ProfilePostsComponent;
