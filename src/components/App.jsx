import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "./Dashboard/Dashboard";
import Matchmaking from "./Matchmaking/Matchmaking";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
      </Routes>
    </Router>
  );
};

export default App;