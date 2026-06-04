import { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaCreditCard,
  FaUser,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function RenterDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [roomBill, setRoomBill] = useState([]);
  const [electricityBill, setElectricityBill] = useState([]);
  const [roomBillHistory, setRoomBillHistory] = useState([]);
  const [electricityBillHistory, setElectricityBillHistory] = useState([]);
  const [totalRentBill, setTotalRentBill] = useState(null);
  const [totalElecticityBill, setTotalElectricityBill] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [showTxModal, setShowTxModal] = useState(false);
  const TX_PER_PAGE = 5;
  const fetchedData = useRef(false);
  const [showLoader, setShowLoader] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Theme tokens
  const theme = {
    bg:       darkMode ? "#0f0c29"  : "#f0f2f8",
    cardBg:   darkMode ? "#1a1535"  : "#ffffff",
    border:   darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:     darkMode ? "#e2e8f0"  : "#1e293b",
    muted:    darkMode ? "#94a3b8"  : "#64748b",
    tableBg:  darkMode ? "#16123a"  : "#f8fafc",
    tableRow: darkMode ? "#1e1a40"  : "#ffffff",
    shadow:   darkMode ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.08)",
  };

  const { state } = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (fetchedData.current) return;
      fetchedData.current = true;

      setShowLoader(true);
      const minLoaderTime = new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        // Get email from nav state OR fall back to the JWT cookie via /auth/verify
        let email = state?.email;
        if (!email) {
          const authRes = await axios.get("http://localhost:5000/auth/verify", {
            withCredentials: true,
          });
          email = authRes.data?.user?.email;
        }

        if (!email) throw new Error("No email available");

        const [response] = await Promise.all([
          axios.get("http://localhost:5000/renter/get-renter-data", {
            params: { email },
            withCredentials: true,
          }),
          minLoaderTime,
        ]);

        setUserData(response?.data?.renterDetails[0]);
        setRoomBill(response?.data?.roomBill);
        setElectricityBill(response?.data?.electricityBill);
        setRoomBillHistory(response?.data?.roomBillHistory || []);
        setElectricityBillHistory(response?.data?.electricityBillHistory || []);
        setTotalRentBill(response?.data?.totalRent);
        setTotalElectricityBill(response?.data?.totalElectricity);
      } catch (error) {
        console.error("Error fetching user data:", error.response || error);
        await minLoaderTime;
      } finally {
        setShowLoader(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileClick = () => setShowSidebar(!showSidebar);
  const handleEditProfileClick = () => { setShowSidebar(false); setShowModal(true); };
  const handleCloseModal = () => setShowModal(false);
  const handleSaveChanges = () => setShowModal(false);

  const profileImage = "";
  const userInitials = userData ? userData?.fullName.charAt(0) : "U";

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await axios.post("http://localhost:5000/auth/logout", {}, { withCredentials: true });
    } catch (_) {}
    navigate("/login");
  };

  const handlePaymentRedirect = (billType) => {
    navigate("/pay", {
      state: {
        ...userData,
        billType,           // "rent" | "electricity"
        totalRentBill,
        totalElecticityBill,
        roomBill,
        electricityBill,
      },
    });
  };

  return showLoader ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Loader />
    </div>
  ) : (
    <div className="d-flex flex-column" style={{ height: "100vh", overflow: "hidden", background: theme.bg, color: theme.text, transition: "background 0.4s, color 0.4s" }}>
      {/* Header */}
      <Header
        userData={userData}
        profileImage={profileImage}
        userInitials={userInitials}
        handleProfileClick={handleProfileClick}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className="d-flex" style={{ flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          userInitials={userInitials}
          userData={userData}
          handleEditProfileClick={handleEditProfileClick}
          handleSignOut={handleSignOut}
          darkMode={darkMode}
        />

        {/* Main Content */}
        <main className="flex-grow-1 p-4" style={{ background: theme.bg, transition: "background 0.4s", overflowY: "auto", height: "100%" }}>

          {/* Summary banner */}
          <div style={{
            background: darkMode
              ? "linear-gradient(135deg, #1e1a40, #2d1b69)"
              : "linear-gradient(135deg, #1e3a5f, #2563eb)",
            borderRadius: "16px",
            padding: "20px 28px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 24px rgba(108,99,255,0.25)",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>Welcome back,</p>
              <h2 style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: "1.4rem" }}>
                {userData?.fullName || "Renter"}
              </h2>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "10px 20px", textAlign: "center" }}>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Total Rent Due</p>
                <p style={{ margin: 0, color: "#a78bfa", fontWeight: 700, fontSize: "1.2rem" }}>₹{totalRentBill ?? "—"}</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "10px 20px", textAlign: "center" }}>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Electricity Due</p>
                <p style={{ margin: 0, color: "#facc15", fontWeight: 700, fontSize: "1.2rem" }}>₹{totalElecticityBill ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Rent & Electricity Bill Side by Side */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <div style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "16px",
                padding: "20px",
                boxShadow: theme.shadow,
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition: "background 0.4s",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "inline-block",
                    background: "rgba(108,99,255,0.15)",
                    color: "#a78bfa",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}>ROOM RENT</div>
                  <h2 style={{ color: theme.text, fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>Current Rent</h2>
                  <p style={{ color: theme.muted, margin: "2px 0", fontSize: "14px" }}>Amount: <strong style={{ color: "#a78bfa" }}>₹{totalRentBill}</strong></p>
                  <p style={{ color: theme.muted, margin: "2px 0 12px", fontSize: "13px" }}>Due: 5th March 2025</p>
                  <Button
                    onClick={() => handlePaymentRedirect("rent")}
                    style={{
                      background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
                      border: "none",
                      borderRadius: "50px",
                      padding: "7px 24px",
                      fontWeight: 600,
                      fontSize: "13px",
                      boxShadow: "0 4px 12px rgba(108,99,255,0.4)",
                    }}
                  >
                    Pay Now
                  </Button>
                </div>
                <img src="house.jpg" alt="Rent" style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "12px", opacity: 0.9 }} />
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: "16px",
                padding: "20px",
                boxShadow: theme.shadow,
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition: "background 0.4s",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "inline-block",
                    background: "rgba(250,204,21,0.15)",
                    color: "#facc15",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}>ELECTRICITY</div>
                  <h2 style={{ color: theme.text, fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>Electricity Bill</h2>
                  <p style={{ color: theme.muted, margin: "2px 0", fontSize: "14px" }}>Amount: <strong style={{ color: "#facc15" }}>₹{totalElecticityBill}</strong></p>
                  <p style={{ color: theme.muted, margin: "2px 0 12px", fontSize: "13px" }}>Due: 10th March 2025</p>
                  <Button
                    onClick={() => handlePaymentRedirect("electricity")}
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #facc15)",
                      border: "none",
                      borderRadius: "50px",
                      padding: "7px 24px",
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#1a1a2e",
                      boxShadow: "0 4px 12px rgba(250,204,21,0.35)",
                    }}
                  >
                    Pay Now
                  </Button>
                </div>
                <img src="bulb.png" alt="Electricity" style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "12px", opacity: 0.9 }} />
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: "16px",
            padding: "20px",
            boxShadow: theme.shadow,
            transition: "background 0.4s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ color: theme.text, fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>📋 Transaction History</h2>
              <button
                onClick={() => setShowTxModal(true)}
                title="Maximise"
                style={{
                  background: darkMode ? "rgba(108,99,255,0.15)" : "#ede9fe",
                  border: `1px solid ${theme.border}`,
                  borderRadius: "8px",
                  padding: "5px 12px",
                  color: "#a78bfa",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                Expand
              </button>
            </div>
            {/* Combined + sorted transactions */}
            {(() => {
              const allTx = [
                ...(roomBillHistory.length > 0 ? roomBillHistory : roomBill || []).map((tx) => ({ ...tx, type: "Room" })),
                ...(electricityBillHistory.length > 0 ? electricityBillHistory : electricityBill || []).map((tx) => ({ ...tx, type: "Electricity" })),
              ].sort((a, b) => {
                // pending first, then by dueDate desc
                if (a.status === "pending" && b.status !== "pending") return -1;
                if (a.status !== "pending" && b.status === "pending") return 1;
                return new Date(b.dueDate) - new Date(a.dueDate);
              });
              const totalPages = Math.max(1, Math.ceil(allTx.length / TX_PER_PAGE));
              const paginated = allTx.slice((txPage - 1) * TX_PER_PAGE, txPage * TX_PER_PAGE);

              return (
                <>
                  {/* Fixed-height scrollable table body */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", fontSize: "13.5px" }}>
                      <thead>
                        <tr style={{ background: darkMode ? "rgba(108,99,255,0.2)" : "#e8eaf6" }}>
                          {["Type", "Amount", "Due Date", "Status"].map((h) => (
                            <th key={h} style={{ padding: "10px 14px", color: theme.muted, fontWeight: 600, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px", textAlign: "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((tx, i) => (
                          <tr key={i} style={{ background: theme.tableRow }}>
                            <td style={{ padding: "10px 14px", color: theme.text, borderRadius: "8px 0 0 8px" }}>{tx.type}</td>
                            <td style={{ padding: "10px 14px", color: theme.text }}>₹{tx?.amountDue}</td>
                            <td style={{ padding: "10px 14px", color: theme.muted }}>
                              {tx?.dueDate ? tx.dueDate.split("T")[0] : "————"}
                            </td>
                            <td style={{ padding: "10px 14px", borderRadius: "0 8px 8px 0" }}>
                              <span style={{
                                background:
                                  tx?.status === "pending" ? "rgba(251,146,60,0.15)" :
                                  tx?.status === "paid"    ? "rgba(34,197,94,0.15)"   :
                                  "rgba(148,163,184,0.15)",
                                color:
                                  tx?.status === "pending" ? "#fb923c" :
                                  tx?.status === "paid"    ? "#22c55e"  :
                                  theme.muted,
                                borderRadius: "20px", padding: "3px 10px",
                                fontWeight: 600, fontSize: "12px",
                              }}>
                                {tx?.status?.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {paginated.length === 0 && (
                          <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center", color: theme.muted }}>No transactions found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controls */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", flexWrap: "wrap", gap: "8px" }}>
                    <p style={{ margin: 0, fontSize: "12px", color: theme.muted }}>
                      Showing {allTx.length === 0 ? 0 : (txPage - 1) * TX_PER_PAGE + 1}–{Math.min(txPage * TX_PER_PAGE, allTx.length)} of {allTx.length}
                    </p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                        disabled={txPage === 1}
                        style={{
                          padding: "6px 14px", borderRadius: "8px", border: `1px solid ${theme.border}`,
                          background: txPage === 1 ? "transparent" : darkMode ? "rgba(255,255,255,0.07)" : "#f1f5f9",
                          color: txPage === 1 ? theme.muted : theme.text,
                          cursor: txPage === 1 ? "not-allowed" : "pointer",
                          fontWeight: 600, fontSize: "12px",
                        }}
                      >← Prev</button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setTxPage(p)}
                          style={{
                            padding: "6px 12px", borderRadius: "8px", border: "none",
                            background: txPage === p
                              ? "linear-gradient(135deg, #6c63ff, #3b82f6)"
                              : darkMode ? "rgba(255,255,255,0.07)" : "#f1f5f9",
                            color: txPage === p ? "#fff" : theme.text,
                            fontWeight: 600, fontSize: "12px", cursor: "pointer",
                            boxShadow: txPage === p ? "0 2px 8px rgba(108,99,255,0.4)" : "none",
                          }}
                        >{p}</button>
                      ))}

                      <button
                        onClick={() => setTxPage((p) => Math.min(totalPages, p + 1))}
                        disabled={txPage === totalPages}
                        style={{
                          padding: "6px 14px", borderRadius: "8px", border: `1px solid ${theme.border}`,
                          background: txPage === totalPages ? "transparent" : darkMode ? "rgba(255,255,255,0.07)" : "#f1f5f9",
                          color: txPage === totalPages ? theme.muted : theme.text,
                          cursor: txPage === totalPages ? "not-allowed" : "pointer",
                          fontWeight: 600, fontSize: "12px",
                        }}
                      >Next →</button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </main>
      </div>

      {/* Transaction History Modal */}
      {showTxModal && (() => {
        const allTx = [
          ...(roomBillHistory.length > 0 ? roomBillHistory : roomBill || []).map((tx) => ({ ...tx, type: "Room" })),
          ...(electricityBillHistory.length > 0 ? electricityBillHistory : electricityBill || []).map((tx) => ({ ...tx, type: "Electricity" })),
        ].sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (a.status !== "pending" && b.status === "pending") return 1;
          return new Date(b.dueDate) - new Date(a.dueDate);
        });
        return (
          <div
            onClick={() => setShowTxModal(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              zIndex: 10001,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "24px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: darkMode ? "linear-gradient(145deg,#12101f,#1a1535)" : "#ffffff",
                border: `1px solid ${theme.border}`,
                borderRadius: "20px",
                width: "100%", maxWidth: "780px",
                maxHeight: "85vh",
                display: "flex", flexDirection: "column",
                boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
                overflow: "hidden",
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                <div>
                  <h2 style={{ margin: 0, color: theme.text, fontSize: "1.1rem", fontWeight: 700 }}>📋 All Transactions</h2>
                  <p style={{ margin: "2px 0 0", color: theme.muted, fontSize: "12px" }}>{allTx.length} record{allTx.length !== 1 ? "s" : ""} total</p>
                </div>
                <button
                  onClick={() => setShowTxModal(false)}
                  style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", width: "32px", height: "32px", color: theme.muted, cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >✕</button>
              </div>

              {/* Scrollable List */}
              <div style={{ overflowY: "auto", flex: 1, padding: "16px 24px" }}>
                {allTx.length === 0 ? (
                  <p style={{ textAlign: "center", color: theme.muted, padding: "40px 0" }}>No transactions found</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {allTx.map((tx, i) => (
                      <div key={i} style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        alignItems: "center",
                        gap: "16px",
                        background: darkMode ? "rgba(255,255,255,0.04)" : "#f8fafc",
                        border: `1px solid ${theme.border}`,
                        borderRadius: "12px",
                        padding: "14px 18px",
                      }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: theme.text, fontSize: "14px" }}>
                            {tx.type === "Room" ? "🏠" : "⚡"} {tx.type} {tx.type === "Room" ? "Rent" : "Bill"}
                          </p>
                          <p style={{ margin: "3px 0 0", color: theme.muted, fontSize: "12px" }}>
                            Due: {tx?.dueDate ? tx.dueDate.split("T")[0] : "—"}
                            {tx?.paymentDate ? ` · Paid: ${tx.paymentDate.split("T")[0]}` : ""}
                          </p>
                          {tx?.transactionId && (
                            <p style={{ margin: "2px 0 0", color: "#475569", fontSize: "11px", fontFamily: "monospace" }}>TXN: {tx.transactionId}</p>
                          )}
                        </div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: tx.type === "Room" ? "#a78bfa" : "#facc15" }}>&#8377;{tx?.amountDue}</p>
                        <span style={{
                          background: tx?.status === "pending" ? "rgba(251,146,60,0.15)" : tx?.status === "paid" ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.15)",
                          color: tx?.status === "pending" ? "#fb923c" : tx?.status === "paid" ? "#22c55e" : theme.muted,
                          borderRadius: "20px", padding: "4px 12px",
                          fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap",
                        }}>{tx?.status?.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "14px 24px", borderTop: `1px solid ${theme.border}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ margin: 0, color: theme.muted, fontSize: "12px" }}>
                  Paid: <strong style={{ color: "#22c55e" }}>{allTx.filter(t => t.status === "paid").length}</strong>
                  &nbsp;&nbsp;Pending: <strong style={{ color: "#fb923c" }}>{allTx.filter(t => t.status === "pending").length}</strong>
                </p>
                <button onClick={() => setShowTxModal(false)} style={{ padding: "7px 20px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#6c63ff,#3b82f6)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Profile Modal */}
      {showModal && (
        <div
          onClick={handleCloseModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: darkMode
                ? "linear-gradient(145deg, #12101f, #1a1535)"
                : "#ffffff",
              border: `1px solid ${theme.border}`,
              borderRadius: "20px",
              padding: "32px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: darkMode
                ? "0 8px 48px rgba(0,0,0,0.7)"
                : "0 8px 32px rgba(0,0,0,0.14)",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: darkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9",
                border: "none",
                color: theme.muted,
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <FaTimes size={13} />
            </button>

            {/* Avatar + title */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "28px",
                boxShadow: "0 4px 20px rgba(108,99,255,0.5)",
                marginBottom: "14px",
              }}>
                {userInitials}
              </div>
              <h3 style={{ margin: 0, color: theme.text, fontWeight: 700, fontSize: "1.15rem" }}>Edit Profile</h3>
              <p style={{ margin: "4px 0 0", color: theme.muted, fontSize: "13px" }}>Update your account information</p>
            </div>

            {/* Fields */}
            {[
              { label: "Full Name",     key: "fullName", type: "text",  placeholder: "Enter your full name" },
              { label: "Email Address", key: "email",    type: "email", placeholder: "Enter your email" },
              { label: "Phone Number",  key: "phone",    type: "tel",   placeholder: "Enter your phone number" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  color: theme.muted,
                  fontSize: "11px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}>
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={userData?.[key] || ""}
                  onChange={(e) => setUserData({ ...userData, [key]: e.target.value })}
                  onFocus={(e) => { e.target.style.border = "1.5px solid #6c63ff"; e.target.style.boxShadow = "0 0 0 3px rgba(108,99,255,0.15)"; }}
                  onBlur={(e)  => { e.target.style.border = `1px solid ${theme.border}`; e.target.style.boxShadow = "none"; }}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: `1px solid ${theme.border}`,
                    background: darkMode ? "rgba(255,255,255,0.06)" : "#f8fafc",
                    color: theme.text,
                    fontSize: "14px",
                    outline: "none",
                    transition: "border 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={handleCloseModal}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: `1px solid ${theme.border}`,
                  background: "transparent",
                  color: theme.muted,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(108,99,255,0.4)",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
