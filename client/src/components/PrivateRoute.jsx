// src/components/PrivateRoute.js
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";

const PrivateRoute = () => {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "denied"
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/verify", { withCredentials: true })
      .then((res) => {
        setRole(res.data?.user?.role || "renter");
        setStatus("ok");
      })
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "checking") return null;
  if (status === "denied") return <Navigate to="/login" replace />;

  // Block non-admins from /admin
  if (location.pathname === "/admin" && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Block admins from renter-only pages
  if (role === "admin" && location.pathname !== "/admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
