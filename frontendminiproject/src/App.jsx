import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// All imports below use lowercase "components" to match your file structure
import Login from "./components2/Login";
import Register from "./components2/Register";
import Dashboard from "./components2/Dashboard";
import ImagePredict from "./components2/ImagePredict";
import History from "./components2/History";
import Profile from "./components2/Profile";
import PatientsSegment from "./components2/PatientsSegment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard/Feature Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/image" element={<ImagePredict />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/segments" element={<PatientsSegment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;