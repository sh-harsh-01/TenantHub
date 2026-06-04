import { useEffect, useState } from "react";
import {
  FaUsers, FaBolt, FaHome, FaCog, FaTimes,
  FaLightbulb, FaRegLightbulb, FaEye, FaPlus, FaSignOutAlt,
  FaKey,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "https://tenanthub-ka34.onrender.com";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("renters");
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allRenters, setAllRenters] = useState([]);
  const [pendingRoomBill, setPendingRoomBill] = useState([]);
  const [pendingElectricityBill, setPendingElectricityBill] = useState([]);
  const [paidRoomBill, setPaidRoomBill] = useState([]);
  const [paidElectricityBill, setPaidElectricityBill] = useState([]);
  const [totalRoomBill, setTotalRoomBill] = useState(0);
  const [totalElectricityBill, setTotalElectricityBill] = useState(0);
  const [billModal, setBillModal] = useState(false);
  const [billMonth, setBillMonth] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [allBills, setAllBills] = useState([]);
  const [billFilter, setBillFilter] = useState("all");
  const [renterSearch, setRenterSearch] = useState("");
  // Settings state
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwMsg, setPwMsg] = useState(null);
  const [rentDueDay, setRentDueDay] = useState(1);
  const [dueDayMsg, setDueDayMsg] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (_) {}
    navigate("/login");
  };

  const theme = {
    bg:       darkMode ? "#0f0c29"  : "#f0f2f8",
    cardBg:   darkMode ? "#1a1535"  : "#ffffff",
    border:   darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:     darkMode ? "#e2e8f0"  : "#1e293b",
    muted:    darkMode ? "#94a3b8"  : "#64748b",
    tableRow: darkMode ? "#1e1a40"  : "#ffffff",
    shadow:   darkMode ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.08)",
  };

  const sidebarBg = darkMode
    ? "linear-gradient(180deg, #0f0c29 0%, #1e1a40 100%)"
    : "linear-gradient(180deg, #1e3a5f 0%, #1e40af 100%)";
  const divider = "rgba(255,255,255,0.08)";

  useEffect(() => {
    axios.get(`${API_URL}/admin/renters-info`, { withCredentials: true })
      .then((r) => setAllRenters(r.data.renterDetails || []))
      .catch((e) => console.error(e));
    axios.get(`${API_URL}/admin/all-bills`, { withCredentials: true })
      .then((r) => setAllBills(r.data.bills || []))
      .catch((e) => console.error(e));
    axios.get(`${API_URL}/admin/config`, { withCredentials: true })
      .then((r) => setRentDueDay(r.data.rentDueDay || 1))
      .catch((e) => console.error(e));
  }, []);

  const handleViewClick = async (renter) => {
    try {
      const r = await axios.get(`${API_URL}/admin/get-renter-bill-by-admin`, {
        params: { email: renter.email },
        withCredentials: true,
      });
      setPaidRoomBill(r.data.paidRoomBill || []);
      setPaidElectricityBill(r.data.paidElectricityBill || []);
      setPendingRoomBill(r.data.pendingRoomBill || []);
      setPendingElectricityBill(r.data.pendingElectricityBill || []);
      setTotalRoomBill(r.data.totalRent || 0);
      setTotalElectricityBill(r.data.totalElectricity || 0);
    } catch (e) { console.error(e); }
    setSelectedRenter(renter);
    setShowModal(true);
  };

  const openBillModal = (renter) => {
    setSelectedRenter(renter);
    setBillMonth(""); setBillAmount("");
    setBillModal(true);
  };

  const handleBillSubmit = async () => {
    if (!selectedRenter || !billAmount || !billMonth) return;
    try {
      await axios.post(`${API_URL}/admin/add-electricity-bill`, {
        email: selectedRenter.email,
        amountDue: Number(billAmount),
        dueDate: billMonth,
        billingMonth: new Date(billMonth).toLocaleString("default", { month: "long", year: "numeric" }),
      }, { withCredentials: true });
      alert("Bill added successfully");
      setBillModal(false); setBillAmount(""); setBillMonth("");
      // Refresh all bills
      const r = await axios.get(`${API_URL}/admin/all-bills`, { withCredentials: true });
      setAllBills(r.data.bills || []);
    } catch (err) { alert("Error adding bill"); }
  };

  const initials = (name) => name ? name.charAt(0).toUpperCase() : "?";

  const NAV = [
    { key: "renters", icon: <FaUsers size={15} />, label: "Renters" },
    { key: "allBills", icon: <FaEye size={15} />, label: "All Bills" },
    { key: "addBill", icon: <FaBolt size={15} />, label: "Add Electricity Bill" },
    { key: "settings", icon: <FaCog size={15} />, label: "Settings" },
  ];

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: `1px solid ${theme.border}`,
    background: darkMode ? "rgba(255,255,255,0.06)" : "#f8fafc",
    color: theme.text, fontSize: "14px", outline: "none",
    boxSizing: "border-box", marginTop: "6px",
  };

  const modalOverlay = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
    zIndex: 10000, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "16px",
  };

  const modalBox = {
    background: darkMode ? "linear-gradient(145deg, #12101f, #1a1535)" : "#ffffff",
    border: `1px solid ${theme.border}`, borderRadius: "20px",
    padding: "28px", width: "100%",
    boxShadow: darkMode ? "0 8px 48px rgba(0,0,0,0.7)" : "0 8px 32px rgba(0,0,0,0.14)",
    position: "relative", maxHeight: "90vh", overflowY: "auto",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, color: theme.text, transition: "background 0.4s, color 0.4s" }}>

      {/* Sidebar */}
      <aside style={{
        width: "230px", flexShrink: 0,
        background: sidebarBg,
        display: "flex", flexDirection: "column",
        borderRight: `1px solid ${divider}`,
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
      }}>
        {/* Brand */}
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${divider}` }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "10px", boxShadow: "0 4px 14px rgba(108,99,255,0.4)",
          }}>
            <FaHome size={20} color="#fff" />
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#fff" }}>Admin Panel</p>
          <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Sharma House</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 10px" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>Menu</p>
          {NAV.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500,
                marginBottom: "4px", transition: "background 0.2s",
                background: activeSection === key
                  ? "rgba(108,99,255,0.25)"
                  : "transparent",
                color: activeSection === key ? "#a78bfa" : "rgba(255,255,255,0.75)",
                borderLeft: activeSection === key ? "3px solid #a78bfa" : "3px solid transparent",
              }}
            >
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        {/* Dark mode toggle */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${divider}` }}>
          <button
            onClick={() => setDarkMode((p) => !p)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%", padding: "10px 14px", borderRadius: "10px",
              border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500,
              background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)",
              transition: "background 0.2s",
            }}
          >
            {darkMode ? <FaLightbulb size={15} color="#facc15" /> : <FaRegLightbulb size={15} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%", padding: "10px 14px", borderRadius: "10px",
              border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500,
              background: "rgba(239,68,68,0.12)", color: "#f87171",
              marginTop: "6px", transition: "background 0.2s",
            }}
          >
            <FaSignOutAlt size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          background: darkMode ? "linear-gradient(90deg, #0f0c29, #302b63)" : "linear-gradient(90deg, #1e3a5f, #2563eb)",
          padding: "0 28px", height: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        }}>
          <h1 style={{
            margin: 0, fontSize: "1.2rem", fontWeight: 700,
            background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Admin Dashboard
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
              borderRadius: "50%", width: "36px", height: "36px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "14px",
            }}>A</div>
            <button
              onClick={handleSignOut}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 16px", borderRadius: "8px", border: "none",
                background: "rgba(239,68,68,0.15)", color: "#f87171",
                cursor: "pointer", fontSize: "13px", fontWeight: 600,
              }}
            >
              <FaSignOutAlt size={13} /> Logout
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { label: "Total Renters", value: allRenters.length, color: "#a78bfa", bg: "rgba(108,99,255,0.15)" },
              { label: "Pending Rent Bills", value: allBills.filter(b => b.type === "Room Rent" && b.status === "pending").length, color: "#fb923c", bg: "rgba(251,146,60,0.15)" },
              { label: "Pending Electricity", value: allBills.filter(b => b.type === "Electricity" && b.status === "pending").length, color: "#facc15", bg: "rgba(250,204,21,0.15)" },
              { label: "Paid Bills", value: allBills.filter(b => b.status === "paid").length, color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
            ].map((s) => (
              <div key={s.label} style={{
                flex: "1 1 160px",
                background: theme.cardBg, borderRadius: "14px",
                padding: "16px 20px", border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
              }}>
                <p style={{ margin: 0, fontSize: "11px", color: theme.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{s.label}</p>
                <p style={{ margin: "6px 0 0", fontSize: "1.6rem", fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Renters Section ── */}
          {activeSection === "renters" && (
            <div style={{ background: theme.cardBg, borderRadius: "16px", padding: "20px", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <h2 style={{ color: theme.text, fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>👥 All Renters</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", fontSize: "13.5px" }}>
                  <thead>
                    <tr style={{ background: darkMode ? "rgba(108,99,255,0.2)" : "#e8eaf6" }}>
                      {["Renter", "Email", "Phone", "Action"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", color: theme.muted, fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allRenters.map((r) => (
                      <tr key={r._id} style={{ background: theme.tableRow }}>
                        <td style={{ padding: "10px 14px", borderRadius: "8px 0 0 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "34px", height: "34px", borderRadius: "50%",
                              background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontWeight: 700, fontSize: "14px", flexShrink: 0,
                            }}>{initials(r.fullName)}</div>
                            <span style={{ color: theme.text, fontWeight: 600 }}>{r.fullName}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", color: theme.muted }}>{r.email}</td>
                        <td style={{ padding: "10px 14px", color: theme.muted }}>{r.phone}</td>
                        <td style={{ padding: "10px 14px", borderRadius: "0 8px 8px 0" }}>
                          <button
                            onClick={() => handleViewClick(r)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
                              border: "none", borderRadius: "20px", padding: "6px 16px",
                              color: "#fff", fontWeight: 600, fontSize: "12px",
                              cursor: "pointer", boxShadow: "0 3px 10px rgba(108,99,255,0.4)",
                            }}
                          ><FaEye size={12} /> View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── All Bills Section ── */}
          {activeSection === "allBills" && (() => {
            const filtered = allBills.filter((b) => {
              const matchFilter =
                billFilter === "pending" ? b.status === "pending" :
                billFilter === "paid" ? b.status === "paid" :
                billFilter === "Room Rent" ? b.type === "Room Rent" :
                billFilter === "Electricity" ? b.type === "Electricity" : true;
              const matchSearch = renterSearch === "" || b.renterName === renterSearch;
              return matchFilter && matchSearch;
            });
            const filterBtns = [
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "paid", label: "Paid" },
              { key: "Room Rent", label: "Room Rent" },
              { key: "Electricity", label: "Electricity" },
            ];
            // Unique renter names from allBills
            const renterNames = [...new Set(allBills.map(b => b.renterName).filter(Boolean))].sort();
            return (
              <div style={{ background: theme.cardBg, borderRadius: "16px", padding: "20px", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                  <h2 style={{ color: theme.text, fontSize: "1rem", fontWeight: 700, margin: 0 }}>&#128203; All Bills ({filtered.length})</h2>
                  {/* Renter name dropdown */}
                  <select
                    value={renterSearch}
                    onChange={(e) => setRenterSearch(e.target.value)}
                    style={{
                      padding: "7px 14px", borderRadius: "10px",
                      border: `1px solid ${theme.border}`,
                      background: darkMode ? "rgba(255,255,255,0.06)" : "#f8fafc",
                      color: renterSearch ? theme.text : theme.muted,
                      fontSize: "13px", fontWeight: 500, outline: "none", cursor: "pointer",
                    }}
                  >
                    <option value="">All Renters</option>
                    {renterNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                {/* Status / Type filter pills */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {filterBtns.map(({ key, label }) => (
                    <button key={key} onClick={() => setBillFilter(key)} style={{
                      padding: "5px 14px", borderRadius: "20px", border: "none", cursor: "pointer",
                      fontSize: "12px", fontWeight: 600,
                      background: billFilter === key ? "linear-gradient(135deg,#6c63ff,#3b82f6)" : darkMode ? "rgba(255,255,255,0.07)" : "#f1f5f9",
                      color: billFilter === key ? "#fff" : theme.muted,
                      boxShadow: billFilter === key ? "0 2px 8px rgba(108,99,255,0.35)" : "none",
                    }}>{label}</button>
                  ))}
                  {(billFilter !== "all" || renterSearch) && (
                    <button onClick={() => { setBillFilter("all"); setRenterSearch(""); }} style={{
                      padding: "5px 14px", borderRadius: "20px", border: `1px solid ${theme.border}`,
                      cursor: "pointer", fontSize: "12px", fontWeight: 600,
                      background: "transparent", color: "#f87171",
                    }}>&#10005; Clear</button>
                  )}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: darkMode ? "rgba(108,99,255,0.2)" : "#e8eaf6" }}>
                        {["Renter", "Type", "Amount", "Due Date", "Paid On", "Txn ID", "Status"].map((h) => (
                          <th key={h} style={{ padding: "10px 12px", color: theme.muted, fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr><td colSpan={7} style={{ padding: "24px", textAlign: "center", color: theme.muted }}>No bills found</td></tr>
                      )}
                      {filtered.map((b, i) => (
                        <tr key={i} style={{ background: theme.tableRow }}>
                          <td style={{ padding: "10px 12px", borderRadius: "8px 0 0 8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>{initials(b.renterName)}</div>
                              <div>
                                <p style={{ margin: 0, color: theme.text, fontWeight: 600, fontSize: "13px" }}>{b.renterName}</p>
                                <p style={{ margin: 0, color: theme.muted, fontSize: "11px" }}>{b.renterEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px", color: b.type === "Room Rent" ? "#a78bfa" : "#facc15", fontWeight: 600, whiteSpace: "nowrap" }}>{b.type}</td>
                          <td style={{ padding: "10px 12px", color: theme.text, fontWeight: 700 }}>&#8377;{b.amountDue}</td>
                          <td style={{ padding: "10px 12px", color: theme.muted, whiteSpace: "nowrap" }}>{b.dueDate ? b.dueDate.substring(0, 10) : "—"}</td>
                          <td style={{ padding: "10px 12px", color: theme.muted, whiteSpace: "nowrap" }}>{b.paymentDate ? b.paymentDate.substring(0, 10) : "—"}</td>
                          <td style={{ padding: "10px 12px", color: "#475569", fontSize: "11px", fontFamily: "monospace" }}>{b.transactionId ? b.transactionId.substring(0, 16) + "…" : "—"}</td>
                          <td style={{ padding: "10px 12px", borderRadius: "0 8px 8px 0" }}>
                            <span style={{
                              background: b.status === "pending" ? "rgba(251,146,60,0.15)" : b.status === "paid" ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.15)",
                              color: b.status === "pending" ? "#fb923c" : b.status === "paid" ? "#22c55e" : theme.muted,
                              borderRadius: "20px", padding: "3px 10px", fontWeight: 700, fontSize: "11px",
                            }}>{b.status?.toUpperCase()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ── Settings Section ── */}
          {activeSection === "settings" && (
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "stretch", flexWrap: "wrap" }}>

              {/* Change Password */}
              <div style={{ flex: "1 1 0", minWidth: "260px", display: "flex", flexDirection: "column", background: theme.cardBg, borderRadius: "16px", padding: "24px", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <FaKey size={15} color="#a78bfa" />
                  <h2 style={{ margin: 0, color: theme.text, fontSize: "1rem", fontWeight: 700 }}>Change Password</h2>
                </div>
                {[{ label: "Current Password", val: pwCurrent, set: setPwCurrent }, { label: "New Password", val: pwNew, set: setPwNew }].map(({ label, val, set }) => (
                  <div key={label} style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{label}</label>
                    <input type="password" value={val} onChange={(e) => set(e.target.value)} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="••••••••" />
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto", paddingTop: "6px" }}>
                  <button
                    onClick={async () => {
                      setPwMsg(null);
                      try {
                        await axios.post(`${API_URL}/admin/change-password`, { currentPassword: pwCurrent, newPassword: pwNew }, { withCredentials: true });
                        setPwMsg({ ok: true, text: "Password updated successfully!" });
                        setPwCurrent(""); setPwNew("");
                      } catch (e) { setPwMsg({ ok: false, text: e.response?.data?.message || "Error" }); }
                    }}
                    style={{ padding: "9px 22px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#6c63ff,#3b82f6)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                  >Update Password</button>
                  {pwMsg && <p style={{ margin: 0, color: pwMsg.ok ? "#22c55e" : "#f87171", fontSize: "13px" }}>{pwMsg.text}</p>}
                </div>
              </div>

              {/* Rent Due Day */}
              <div style={{ flex: "1 1 0", minWidth: "260px", display: "flex", flexDirection: "column", background: theme.cardBg, borderRadius: "16px", padding: "24px", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                  <FaBolt size={15} color="#facc15" />
                  <h2 style={{ margin: 0, color: theme.text, fontSize: "1rem", fontWeight: 700 }}>Rent Due Day</h2>
                </div>
                <p style={{ margin: "0 0 16px", color: theme.muted, fontSize: "13px", lineHeight: "1.6" }}>Set the day of the month when rent bills are automatically generated for all renters (between 1 and 28).</p>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Due Day</label>
                  <input
                    type="number" min={1} max={28}
                    value={rentDueDay}
                    onChange={(e) => setRentDueDay(Number(e.target.value))}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto", paddingTop: "6px" }}>
                  <button
                    onClick={async () => {
                      setDueDayMsg(null);
                      try {
                        await axios.post(`${API_URL}/admin/config`, { rentDueDay }, { withCredentials: true });
                        setDueDayMsg({ ok: true, text: `Saved — bills generate on day ${rentDueDay} each month.` });
                      } catch (e) { setDueDayMsg({ ok: false, text: e.response?.data?.message || "Error" }); }
                    }}
                    style={{ padding: "9px 22px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#f59e0b,#facc15)", color: "#1a1a2e", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                  >Save</button>
                  {dueDayMsg && <p style={{ margin: 0, color: dueDayMsg.ok ? "#22c55e" : "#f87171", fontSize: "13px" }}>{dueDayMsg.text}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Add Bill Section ── */}
          {activeSection === "addBill" && (
            <div>
              <h2 style={{ color: theme.text, fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>⚡ Add Electricity Bill</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {allRenters.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => openBillModal(r)}
                    style={{
                      width: "200px", background: theme.cardBg,
                      borderRadius: "16px", padding: "20px 16px",
                      border: `1px solid ${theme.border}`,
                      boxShadow: theme.shadow, textAlign: "center",
                      cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(108,99,255,0.3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = theme.shadow; }}
                  >
                    <div style={{
                      width: "60px", height: "60px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #f59e0b, #facc15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px", fontSize: "22px", fontWeight: 700, color: "#1a1a2e",
                      boxShadow: "0 4px 16px rgba(250,204,21,0.35)",
                    }}>{initials(r.fullName)}</div>
                    <p style={{ margin: 0, fontWeight: 700, color: theme.text, fontSize: "14px" }}>{r.fullName}</p>
                    <p style={{ margin: "4px 0 12px", fontSize: "12px", color: theme.muted }}>{r.email}</p>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      background: "rgba(250,204,21,0.15)", color: "#facc15",
                      borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: 600,
                    }}><FaPlus size={10} /> Add Bill</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Renter Detail Modal ── */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={modalOverlay}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...modalBox,
              maxWidth: "600px",
              maxHeight: "85vh",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Sticky header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px", borderBottom: `1px solid ${theme.border}`,
              flexShrink: 0,
            }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: theme.text }}>
                {selectedRenter?.fullName} — Bill Details
              </p>
              <button onClick={() => setShowModal(false)} style={{
                background: darkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9",
                border: "none", color: theme.muted, borderRadius: "50%",
                width: "30px", height: "30px", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", flexShrink: 0,
              }}><FaTimes size={12} /></button>
            </div>

            {/* Fixed: profile + badges — no scroll */}
            {selectedRenter && (
              <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
                {/* Profile strip */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{
                    width: "60px", height: "60px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "22px", flexShrink: 0,
                    boxShadow: "0 4px 16px rgba(108,99,255,0.45)",
                  }}>{initials(selectedRenter.fullName)}</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: theme.text }}>{selectedRenter.fullName}</p>
                    <p style={{ margin: 0, fontSize: "13px", color: theme.muted }}>{selectedRenter.email} &middot; {selectedRenter.phone}</p>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "11px", color: theme.muted, textTransform: "uppercase" }}>Total Due</p>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "1.3rem", color: "#a78bfa" }}>&#8377;{totalRoomBill + totalElectricityBill}</p>
                  </div>
                </div>

                {/* Summary badges */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", borderRadius: "10px", padding: "8px 16px", fontSize: "12px", fontWeight: 600 }}>
                    Pending Rent: &#8377;{totalRoomBill}
                  </div>
                  <div style={{ background: "rgba(250,204,21,0.15)", color: "#facc15", borderRadius: "10px", padding: "8px 16px", fontSize: "12px", fontWeight: 600 }}>
                    Pending Electricity: &#8377;{totalElectricityBill}
                  </div>
                </div>

                <h3 style={{ color: theme.text, fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" }}>Bill History</h3>
              </div>
            )}

            {/* Scrollable: only the table */}
            <div style={{ overflowY: "auto", overflowX: "auto", flex: 1, padding: "0 24px 20px" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 5px", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: darkMode ? "rgba(108,99,255,0.2)" : "#e8eaf6" }}>
                    {["Due Date", "Amount", "Type", "Status"].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", color: theme.muted, fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...pendingRoomBill.map((x) => ({ ...x, _type: "Room" })), ...pendingElectricityBill.map((x) => ({ ...x, _type: "Electricity" }))].map((item, i) => (
                    <tr key={`p-${i}`} style={{ background: theme.tableRow }}>
                      <td style={{ padding: "8px 12px", color: theme.muted, borderRadius: "6px 0 0 6px" }}>{item.dueDate?.substring(0, 10)}</td>
                      <td style={{ padding: "8px 12px", color: theme.text, fontWeight: 600 }}>&#8377;{item.amountDue}</td>
                      <td style={{ padding: "8px 12px", color: theme.muted }}>{item._type}</td>
                      <td style={{ padding: "8px 12px", borderRadius: "0 6px 6px 0" }}>
                        <span style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", borderRadius: "20px", padding: "3px 10px", fontWeight: 600, fontSize: "11px" }}>PENDING</span>
                      </td>
                    </tr>
                  ))}
                  {[...paidRoomBill.map((x) => ({ ...x, _type: "Room" })), ...paidElectricityBill.map((x) => ({ ...x, _type: "Electricity" }))].map((item, i) => (
                    <tr key={`d-${i}`} style={{ background: theme.tableRow }}>
                      <td style={{ padding: "8px 12px", color: theme.muted, borderRadius: "6px 0 0 6px" }}>{item.dueDate?.substring(0, 10)}</td>
                      <td style={{ padding: "8px 12px", color: theme.text, fontWeight: 600 }}>&#8377;{item.amountDue}</td>
                      <td style={{ padding: "8px 12px", color: theme.muted }}>{item._type}</td>
                      <td style={{ padding: "8px 12px", borderRadius: "0 6px 6px 0" }}>
                        <span style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: "20px", padding: "3px 10px", fontWeight: 600, fontSize: "11px" }}>PAID</span>
                      </td>
                    </tr>
                  ))}
                  {pendingRoomBill.length === 0 && pendingElectricityBill.length === 0 && paidRoomBill.length === 0 && paidElectricityBill.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center", color: theme.muted }}>No bills found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Bill Modal ── */}
      {billModal && (
        <div onClick={() => setBillModal(false)} style={modalOverlay}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...modalBox, maxWidth: "400px" }}>
            <button onClick={() => setBillModal(false)} style={{
              position: "absolute", top: "14px", right: "14px",
              background: darkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9",
              border: "none", color: theme.muted, borderRadius: "50%",
              width: "30px", height: "30px", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}><FaTimes size={12} /></button>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "22px" }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #facc15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#1a1a2e", fontWeight: 700, fontSize: "22px",
                boxShadow: "0 4px 16px rgba(250,204,21,0.4)", marginBottom: "12px",
              }}><FaBolt /></div>
              <h3 style={{ margin: 0, color: theme.text, fontWeight: 700 }}>Add Electricity Bill</h3>
              <p style={{ margin: "4px 0 0", color: theme.muted, fontSize: "13px" }}>{selectedRenter?.fullName}</p>
            </div>

            {[
              { label: "Due Date", type: "date", val: billMonth, set: setBillMonth },
              { label: "Amount (₹)", type: "number", val: billAmount, set: setBillAmount, placeholder: "e.g. 850" },
            ].map(({ label, type, val, set, placeholder }) => (
              <div key={label} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</label>
                <input
                  type={type}
                  value={val}
                  placeholder={placeholder}
                  onChange={(e) => set(e.target.value)}
                  onFocus={(e) => { e.target.style.border = "1.5px solid #facc15"; e.target.style.boxShadow = "0 0 0 3px rgba(250,204,21,0.15)"; }}
                  onBlur={(e)  => { e.target.style.border = `1px solid ${theme.border}`; e.target.style.boxShadow = "none"; }}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={() => setBillModal(false)}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: `1px solid ${theme.border}`, background: "transparent", color: theme.muted, fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
              >Cancel</button>
              <button
                onClick={handleBillSubmit}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #f59e0b, #facc15)", color: "#1a1a2e", fontWeight: 700, fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 14px rgba(250,204,21,0.4)" }}
              >Submit Bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
