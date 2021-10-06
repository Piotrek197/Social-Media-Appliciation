import React, { useContext, useEffect } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";
import Post from "./Post";

function SearchBar() {
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    searchText: "",
    results: [],
    show: "dupa",
    requestCount: 0
  });

  useEffect(() => {
    document.addEventListener("keyup", searchBarKeyHandler);

    return () => document.removeEventListener("keyup", searchBarKeyHandler);
  }, []);

  useEffect(() => {
    if (state.searchText.trim()) {
      setState(draft => {
        draft.show = "loading";
      });
      const del = setTimeout(() => {
        setState(draft => {
          draft.requestCount++;
        });
        console.log(state.requestCount);
      }, 700);

      return () => clearTimeout(del);
    } else {
      setState(draft => {
        draft.show = "dupa";
      });
    }
  }, [state.searchText]);

  useEffect(() => {
    if (state.requestCount) {
      const reToken = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/search",
            { searchTerm: state.searchText },
            { cancelToken: reToken.token }
          );
          setState(draft => {
            draft.results = response.data;
            draft.show = "results";
          });
        } catch (e) {
          console.log(e);
        }
      }
      fetchResults();
    }
  }, [state.requestCount]);

  const searchBarKeyHandler = e => {
    if (e.key == "Escape") {
      appDispatch({ type: "closeSearchBar" });
    }
  };
  const handleInput = e => {
    const value = e.target.value;
    setState(draft => {
      draft.searchText = value;
    });
  };
  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label for="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            onChange={handleInput}
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
          />
          <span
            onClick={() => {
              appDispatch({ type: "closeSearchBar" });
            }}
            className="close-live-search"
          >
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              "circle-loader " +
              (state.show == "loading" ? "circle-loader--visible" : "")
            }
          ></div>
          <div
            className={
              "live-search-results" +
              (state.show == "results" ? "live-search-results--visible" : "")
            }
          >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length}{" "}
                  {state.results.length > 1 ? "items " : "item "}
                  found)
                </div>
                {state.results.map(post => {
                  return (
                    <Post
                      post={post}
                      key={post._id}
                      onClick={() => {
                        appDispatch({ type: "closeSearchBar" });
                      }}
                    />
                  );
                })}
              </div>
            )}
            {!Boolean(state.results.length) && (
              <p className="alert alert-danger text-center shadow-sm">
                We didn't find any results that matches your criteria :(
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
