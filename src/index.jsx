import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard/Dashboard";
import Matchmaking from "./components/Matchmaking/Matchmaking";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);