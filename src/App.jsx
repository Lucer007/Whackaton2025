import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import SplitCalendarPage from "./pages/SplitCalendarPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<SplitCalendarPage />} />
            </Routes>
        </Router>
    );
}

export default App;
