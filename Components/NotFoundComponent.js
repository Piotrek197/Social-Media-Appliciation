import React from "react";
import Container from "./Container";
import { Link } from "react-router-dom";

function NotFoundComponent() {
  return (
    <Container title="Not Found">
      <div className="text-center">
        <h2>Whoops, we cannot find this page</h2>
        <p className="lead text-muted">
          Come back to <Link to="/">main page</Link> and begin again :)
        </p>
      </div>
    </Container>
  );
}

export default NotFoundComponent;
