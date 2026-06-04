import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginSignup from "./components/LoginSignUp";
import RenterDashboard from "./components/Dashboard";
import "./App.css"; // Make sure you have global CSS if needed
import AdminDashboard from "./components/AdminDashboard";
import PayNow from "./components/PayNow";
import PrivateRoute from "./components/PrivateRoute";
import Loader from "./components/Loader";
import Invoice from "./components/Invoice";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test" element={<Loader />} />
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<LoginSignup />} />
        {/* <Route path="/home" element={<Home></Home>} /> */}
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<RenterDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/pay" element={<PayNow />} />
          <Route path="/invoice" element={<Invoice />} />
        </Route>

        {/* Catch-all — redirect any unknown URL to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
