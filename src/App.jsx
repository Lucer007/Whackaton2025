import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import SplitCalendarPage from "src/pages/SplitCalendarPage.jsx";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendar" element={<SplitCalendarPage />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;