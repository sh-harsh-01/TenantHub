// components/Sidebar.jsx
import React from "react";
import { FaHome, FaCreditCard, FaUser, FaSignOutAlt, FaTimes } from "react-icons/fa";

const NAV_ITEMS = [
  { icon: <FaHome size={16} />, label: "Dashboard", onClick: null },
  { icon: <FaCreditCard size={16} />, label: "Payments", onClick: null },
];

const Sidebar = ({
  showSidebar,
  setShowSidebar,
  userInitials,
  userData,
  handleEditProfileClick,
  handleSignOut,
  darkMode,
}) => {
  const bg        = darkMode ? "linear-gradient(180deg, #0f0c29 0%, #1e1a40 100%)" : "linear-gradient(180deg, #1e3a5f 0%, #1e40af 100%)";
  const divider   = darkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.2)";
  const mutedText = "rgba(255,255,255,0.55)";

  const navBtnStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "11px 16px",
    borderRadius: "12px",
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.85)",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    textAlign: "left",
    marginBottom: "4px",
  };

  const [hovered, setHovered] = React.useState(null);

  return (
    <>
      {/* Backdrop */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 9998,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: showSidebar ? 0 : "-270px",
          width: "260px",
          height: "100%",
          background: bg,
          color: "white",
          transition: "left 0.35s cubic-bezier(0.77,0,0.175,1)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          boxShadow: showSidebar ? "4px 0 32px rgba(0,0,0,0.5)" : "none",
          borderRight: `1px solid ${divider}`,
        }}
      >
        {/* Top close strip */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 16px 0" }}>
          <button
            onClick={() => setShowSidebar(false)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Profile section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 20px 24px", borderBottom: `1px solid ${divider}` }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: "26px",
            boxShadow: "0 4px 18px rgba(108,99,255,0.5)",
            marginBottom: "12px",
          }}>
            {userInitials}
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#fff" }}>
            {userData?.fullName || "User"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: mutedText }}>
            {userData?.email || ""}
          </p>
          {userData?.phone && (
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: mutedText }}>
              📞 {userData.phone}
            </p>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, color: mutedText, letterSpacing: "1px", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>
            Navigation
          </p>

          {NAV_ITEMS.map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              style={{
                ...navBtnStyle,
                background: hovered === i ? "rgba(255,255,255,0.12)" : "transparent",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span style={{ color: "#a78bfa" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ height: "1px", background: divider, margin: "12px 0" }} />

          <p style={{ fontSize: "10px", fontWeight: 600, color: mutedText, letterSpacing: "1px", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>
            Account
          </p>

          <button
            onClick={handleEditProfileClick}
            style={{
              ...navBtnStyle,
              background: hovered === "profile" ? "rgba(255,255,255,0.12)" : "transparent",
            }}
            onMouseEnter={() => setHovered("profile")}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ color: "#60a5fa" }}><FaUser size={16} /></span>
            Edit Profile
          </button>
        </nav>

        {/* Logout at bottom */}
        <div style={{ padding: "12px", borderTop: `1px solid ${divider}` }}>
          <button
            onClick={handleSignOut}
            style={{
              ...navBtnStyle,
              marginBottom: 0,
              background: hovered === "logout" ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.08)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)",
              justifyContent: "center",
            }}
            onMouseEnter={() => setHovered("logout")}
            onMouseLeave={() => setHovered(null)}
          >
            <FaSignOutAlt size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

