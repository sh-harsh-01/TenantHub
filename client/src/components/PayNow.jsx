import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const PayNow = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Bills passed from dashboard (already filtered to pending-only by server)
  const rentBills = state?.roomBill        || [];
  const elecBills = state?.electricityBill || [];

  // Derive totals from the actual bill arrays so they always match what's displayed
  const totalRentFromDash = rentBills.reduce((sum, b) => sum + (b.amountDue || 0), 0);
  const totalElecFromDash = elecBills.reduce((sum, b) => sum + (b.amountDue || 0), 0);

  // Which type the user clicked from dashboard ("rent" | "electricity")
  const defaultBillType = state?.billType || "rent";

  // Checkboxes — pre-check whichever was clicked, other unchecked
  const [includeRent, setIncludeRent] = useState(defaultBillType === "rent");
  const [includeElec, setIncludeElec] = useState(defaultBillType === "electricity");

  const totalDue =
    (includeRent ? totalRentFromDash : 0) +
    (includeElec ? totalElecFromDash : 0);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    if (totalDue === 0) return;

    const loaded = await loadRazorpayScript();
    if (!loaded) { alert("Failed to load Razorpay SDK."); return; }

    try {
      const keyRes   = await axios.get("http://localhost:5000/payment/getkey");
      const orderRes = await axios.post("http://localhost:5000/payment/create-order", {
        amount: totalDue, currency: "INR", receipt: "receipt_1",
      });

      const options = {
        key: keyRes.data.key,
        amount: orderRes.data.order.amount,
        currency: "INR",
        name: "Sharma's House",
        description: `Payment for ${[includeRent && "Room Rent", includeElec && "Electricity"].filter(Boolean).join(" & ")}`,
        order_id: orderRes.data.order.id,
        prefill: { name: state?.fullName || "", email: state?.email || "", contact: state?.phone || "" },
        theme: { color: "#6c63ff" },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post("http://localhost:5000/payment/verify-payment", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              // Mark only the selected bills as paid
              await axios.post("http://localhost:5000/payment/update-status", {
                rentBillIds: includeRent ? rentBills.map(b => b._id) : [],
                elecBillIds: includeElec ? elecBills.map(b => b._id) : [],
                paymentId:   response.razorpay_payment_id,
              });

              navigate("/invoice", {
                state: {
                  name:            state?.fullName,
                  electricityBill: includeElec ? elecBills : [],
                  roomRent:        includeRent ? rentBills : [],
                  totalAmount:     totalDue,
                  date:            new Date().toLocaleDateString(),
                  paymentId:       response.razorpay_payment_id,
                },
              });
            }
          } catch { alert("Payment succeeded but verification failed."); }
        },
      };

      new window.Razorpay(options).open();
    } catch { alert("Payment initiation failed. Please try again."); }
  };

  // Theme
  const dark = {
    bg:     "#0f0c29",
    card:   "#1a1535",
    border: "rgba(255,255,255,0.08)",
    text:   "#e2e8f0",
    muted:  "#94a3b8",
    row:    "#1e1a40",
  };

  const checkboxRow = (label, amount, checked, color, onChange) => (
    <div
      onClick={onChange}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: checked ? `${color}18` : dark.row,
        border: `1.5px solid ${checked ? color : dark.border}`,
        borderRadius: "12px", padding: "14px 18px", cursor: "pointer",
        transition: "all 0.2s", marginBottom: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Custom checkbox */}
        <div style={{
          width: "20px", height: "20px", borderRadius: "6px",
          border: `2px solid ${checked ? color : dark.muted}`,
          background: checked ? color : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.2s",
        }}>
          {checked && <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>✓</span>}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: dark.text, fontSize: "14px" }}>{label}</p>
          <p style={{ margin: 0, fontSize: "12px", color: dark.muted }}>
            {amount > 0 ? `₹${amount} pending` : "No pending amount"}
          </p>
        </div>
      </div>
      <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: checked ? color : dark.muted }}>
        ₹{amount}
      </p>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "500px",
        background: dark.card, borderRadius: "20px",
        border: `1px solid ${dark.border}`,
        boxShadow: "0 8px 48px rgba(0,0,0,0.6)", padding: "32px",
      }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "transparent", border: "none", color: dark.muted, cursor: "pointer", padding: 0, fontSize: "13px", marginBottom: "12px" }}
          >← Back</button>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: "1.4rem", color: dark.text }}>Pay Bills</h2>
          <p style={{ margin: "4px 0 0", color: dark.muted, fontSize: "13px" }}>
            {state?.fullName} · {state?.email}
          </p>
        </div>

        {/* Bill selection */}
        <p style={{ fontSize: "11px", fontWeight: 600, color: dark.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
          Select bills to pay
        </p>

        {checkboxRow("Room Rent", totalRentFromDash, includeRent, "#a78bfa", () => setIncludeRent(p => !p))}
        {checkboxRow("Electricity Bill", totalElecFromDash, includeElec, "#facc15", () => setIncludeElec(p => !p))}

        {/* Divider + Total */}
        <div style={{ height: "1px", background: dark.border, margin: "20px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <p style={{ margin: 0, color: dark.muted, fontSize: "14px" }}>Total Payable</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "1.6rem", color: totalDue > 0 ? "#a78bfa" : dark.muted }}>
            ₹{totalDue}
          </p>
        </div>

        {/* Pending bills breakdown */}
        {(includeRent || includeElec) && (
          <div style={{ background: dark.row, borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 600, color: dark.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>Bill breakdown</p>
            {includeRent && rentBills.map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: dark.muted, fontSize: "13px" }}>Room Rent · {b.dueDate?.substring(0, 10)}</span>
                <span style={{ color: "#a78bfa", fontWeight: 600, fontSize: "13px" }}>₹{b.amountDue}</span>
              </div>
            ))}
            {includeElec && elecBills.map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: dark.muted, fontSize: "13px" }}>Electricity · {b.dueDate?.substring(0, 10)}</span>
                <span style={{ color: "#facc15", fontWeight: 600, fontSize: "13px" }}>₹{b.amountDue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={totalDue === 0}
          style={{
            width: "100%", padding: "14px",
            borderRadius: "12px", border: "none",
            background: totalDue > 0
              ? "linear-gradient(135deg, #6c63ff, #3b82f6)"
              : "rgba(255,255,255,0.08)",
            color: totalDue > 0 ? "#fff" : dark.muted,
            fontWeight: 700, fontSize: "15px",
            cursor: totalDue > 0 ? "pointer" : "not-allowed",
            boxShadow: totalDue > 0 ? "0 4px 20px rgba(108,99,255,0.45)" : "none",
            transition: "all 0.2s",
          }}
        >
          {totalDue > 0 ? `Pay ₹${totalDue}` : "Select at least one bill"}
        </button>
      </div>
    </div>
  );
};

export default PayNow;

