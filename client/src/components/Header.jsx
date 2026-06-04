// components/Header.jsx
import React from "react";
import { FaLightbulb, FaRegLightbulb } from "react-icons/fa";

const Header = ({ userData, profileImage, userInitials, handleProfileClick, darkMode, toggleDarkMode }) => {
  const bg = darkMode
    ? "linear-gradient(90deg, #0f0c29, #302b63)"
    : "linear-gradient(90deg, #1e3a5f, #2563eb)";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: "68px",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.35)",
        transition: "background 0.4s",
      }}
    >
      {/* Title */}
      <h1
        style={{
          margin: 0,
          fontSize: "1.3rem",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.5px",
          background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        🏠 Renter Dashboard
      </h1>

      {/* Right controls */}
      <div
        style={{
          position: "absolute",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Dark / Light mode bulb toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: darkMode
              ? "rgba(250, 204, 21, 0.15)"
              : "rgba(255,255,255,0.15)",
            border: darkMode
              ? "1.5px solid rgba(250,204,21,0.6)"
              : "1.5px solid rgba(255,255,255,0.4)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s",
            boxShadow: darkMode
              ? "0 0 12px rgba(250,204,21,0.5)"
              : "0 0 8px rgba(255,255,255,0.2)",
          }}
        >
          {darkMode ? (
            <FaLightbulb size={18} color="#facc15" />
          ) : (
            <FaRegLightbulb size={18} color="#fff" />
          )}
        </button>

        {/* Profile */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={handleProfileClick}
        >
          <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: "14px" }}>
            Hello 👋, {userData?.fullName?.split(" ")[0].trim()}
          </span>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "16px",
              boxShadow: "0 2px 8px rgba(108,99,255,0.4)",
            }}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            ) : (
              userInitials
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
