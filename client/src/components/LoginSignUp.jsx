import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/LoginSignup.css";
import { Atom } from "react-loading-indicators";
import Loader from "../components/Loader";


const LoginPage = () => {
  const [isActive, setIsActive] = useState(false); // Switch between Sign Up / Sign In
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // New field for password confirmation
    phoneNumber: "", // New field for phone number
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signInError, setSignInError] = useState("");
  const navigate = useNavigate();

  // Redirect already-authenticated users away from login page
  useEffect(() => {
    axios
      .get("http://localhost:5000/auth/verify", { withCredentials: true })
      .then((res) => {
        if (res.data.authenticated) {
          const role = res.data.user?.role;
          navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
        }
      })
      .catch(() => {}); // not logged in — stay on page
  }, []);

  // Switch to Register form
  const handleRegisterClick = () => {
    setIsActive(true);
  };

  // Switch to Login form
  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Switch panels and clear errors
  const handleRegisterClickWithReset = () => {
    setError("");
    setSignInError("");
    handleRegisterClick();
  };

  const handleLoginClickWithReset = () => {
    setError("");
    setSignInError("");
    handleLoginClick();
  };

  // Function for handling Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!formData.password) {
      setError("Password is required.");
      return;
    }
    if (!formData.confirmPassword) {
      setError("Please confirm your password.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/renter/register",
        formData
      ); // POST request for Sign Up

      if (response.status === 200) {
        alert("Success: " + response.data.message);
        navigate("/login"); // Navigate to the login page after successful signup
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Error: " +
          (error.response ? error.response.data.message : error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function for handling Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.email.trim()) {
      setSignInError("Email is required.");
      return;
    }
    if (!formData.password) {
      setSignInError("Password is required.");
      return;
    }

    setSignInError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/renter/login",
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const role = response.data.renter?.role;
        navigate(role === "admin" ? "/admin" : "/dashboard", { state: formData });
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Error: " +
          (error.response ? error.response.data.message : error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
    };
  }, []);

  return (
    <div className="login-page-wrapper">
    <div
      className={`login-signup-container ${isActive ? "active" : ""}`}
      id="container"
    >
      {/* Sign Up Form */}
      <div className="form-container sign-up">
        <form onSubmit={handleSignUp}>
          <h1>Create Account</h1>
          <span>or use your email for registration</span>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Sign Up"}
          </button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className="form-container sign-in">
        <form onSubmit={handleSignIn}>
          <h1>Sign In</h1>
          <span>or use your email password</span>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <a href="#">Forget Your Password?</a>
          {signInError && <p className="error">{signInError}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* Toggle Panels */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of site features</p>
            <button className="hidden" id="login" onClick={handleLoginClickWithReset}>
              Sign In
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h3> Welcome to Sharma House !</h3>
            <h1>Hello, Renter !</h1>
            <p>
              Register with your personal details to use all of site features
            </p>
            <button
              className="hidden"
              id="register"
              onClick={handleRegisterClickWithReset}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default LoginPage;
