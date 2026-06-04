import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const Invoice = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const rentBills = state?.roomRent || [];
  const elecBills = state?.electricityBill || [];
  const totalAmount =
    rentBills.reduce((s, b) => s + (b.amountDue || 0), 0) +
    elecBills.reduce((s, b) => s + (b.amountDue || 0), 0) ||
    state?.totalAmount || 0;

  const hex = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const W = 210;
      const H = 297;
      const L = 14;
      const R = W - L;
      const MID = W / 2;

      // ── Page background ──
      pdf.setFillColor(248, 249, 252);
      pdf.rect(0, 0, W, H, "F");

      // ── Top indigo bar ──
      pdf.setFillColor(79, 70, 229);
      pdf.rect(0, 0, W, 3, "F");

      // ── Header card (full width) ──
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(220, 218, 245);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(L, 7, R - L, 38, 3, 3, "FD");

      // Brand
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(30, 27, 75);
      pdf.text("Sharma's House", L + 6, 20);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Gali No. 1, near Sai Mandir, Salarpur, Noida - 201301", L + 6, 27);
      pdf.text("maheshsharma@gmail.com", L + 6, 33);

      // INVOICE pill — right side of same card
      pdf.setFillColor(79, 70, 229);
      pdf.roundedRect(R - 38, 11, 32, 8, 2, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("INVOICE", R - 22, 16.5, { align: "center" });

      // Transaction ID
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      const txId = `#${(state?.paymentId || "N/A").substring(0, 24)}`;
      pdf.text(txId, R - 6, 25, { align: "right" });

      // PAID badge (no emoji)
      pdf.setFillColor(220, 252, 231);
      pdf.setDrawColor(134, 239, 172);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(R - 30, 29, 24, 8, 2, 2, "FD");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(21, 128, 61);
      pdf.text("PAID", R - 18, 34.3, { align: "center" });

      // ── Divider ──
      let y = 52;
      pdf.setDrawColor(220, 218, 245);
      pdf.setLineWidth(0.4);
      pdf.line(L, y, R, y);

      // ── FROM / TO — two equal columns ──
      y += 7;
      const col1x = L;
      const col2x = MID + 2;
      const colW = MID - L - 4;

      // Labels
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text("FROM", col1x, y);
      pdf.text("BILLED TO", col2x, y);

      // Tenant box (draw before text so text renders on top)
      pdf.setFillColor(245, 243, 255);
      pdf.setDrawColor(196, 181, 253);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(col2x - 2, y + 2, colW + 2, 20, 2, 2, "FD");

      y += 7;
      // Landlord name
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(30, 27, 75);
      pdf.text("Mahesh Sharma", col1x, y);
      // Tenant name
      pdf.setTextColor(79, 70, 229);
      pdf.text(state?.name || "-", col2x + 2, y);

      y += 5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Landlord - Gali No. 1, Salarpur", col1x, y);
      pdf.text("Tenant - Paid via Razorpay", col2x + 2, y);

      y += 5;
      pdf.text(`Date: ${state?.date || "-"}`, col1x, y);
      pdf.text("Method: Online Payment", col2x + 2, y);

      // ── Section divider ──
      y += 9;
      pdf.setDrawColor(220, 218, 245);
      pdf.setLineWidth(0.4);
      pdf.line(L, y, R, y);

      // ── Table ──
      y += 3;

      // Column x positions
      const colNum  = L;
      const colDesc = L + 10;
      const colDate = L + 110;
      const colAmt  = R;

      // Table header bg
      pdf.setFillColor(79, 70, 229);
      pdf.rect(L, y, R - L, 9, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(255, 255, 255);
      pdf.text("#", colNum + 1, y + 6);
      pdf.text("Description", colDesc, y + 6);
      pdf.text("Due Date", colDate, y + 6);
      pdf.text("Amount", colAmt, y + 6, { align: "right" });

      y += 9;

      // Bill rows
      const allBills = [
        ...rentBills.map((b) => ({ ...b, label: "Room Rent" })),
        ...elecBills.map((b) => ({ ...b, label: "Electricity Bill" })),
      ];

      const ROW_H = 10;
      allBills.forEach((bill, i) => {
        // Alternate bg
        pdf.setFillColor(i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 255 : 255);
        pdf.rect(L, y, R - L, ROW_H, "F");

        // Row bottom border
        pdf.setDrawColor(235, 233, 252);
        pdf.setLineWidth(0.2);
        pdf.line(L, y + ROW_H, R, y + ROW_H);

        const textY = y + 6.5;

        // Row number
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(180, 180, 200);
        pdf.text(`${i + 1}`, colNum + 1, textY);

        // Description
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(30, 27, 75);
        pdf.text(bill.label, colDesc, textY);

        // Due date
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text(bill.dueDate ? bill.dueDate.substring(0, 10) : "-", colDate, textY);

        // Amount
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        const isRent = bill.label === "Room Rent";
        if (isRent) pdf.setTextColor(109, 40, 217);
        else pdf.setTextColor(161, 120, 0);
        pdf.text(`Rs. ${bill.amountDue}`, colAmt, textY, { align: "right" });

        y += ROW_H;
      });

      if (allBills.length === 0) {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(L, y, R - L, 12, "F");
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(10);
        pdf.setTextColor(180, 180, 200);
        pdf.text("No bill details available.", MID, y + 8, { align: "center" });
        y += 12;
      }

      // Table bottom border
      pdf.setDrawColor(196, 181, 253);
      pdf.setLineWidth(0.4);
      pdf.line(L, y, R, y);

      // ── Total block ──
      y += 8;
      const boxW = 86;
      const boxX = R - boxW;
      pdf.setFillColor(245, 243, 255);
      pdf.setDrawColor(196, 181, 253);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(boxX, y, boxW, 32, 3, 3, "FD");

      y += 8;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Subtotal", boxX + 6, y);
      pdf.text(`Rs. ${totalAmount}`, R - 6, y, { align: "right" });

      y += 7;
      pdf.text("GST / Tax", boxX + 6, y);
      pdf.setTextColor(21, 128, 61);
      pdf.text("Rs. 0.00", R - 6, y, { align: "right" });

      y += 2;
      pdf.setDrawColor(196, 181, 253);
      pdf.setLineWidth(0.3);
      pdf.line(boxX + 5, y, R - 5, y);

      y += 7;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(79, 70, 229);
      pdf.text("Total Paid", boxX + 6, y);
      pdf.setFontSize(13);
      pdf.text(`Rs. ${totalAmount}`, R - 6, y, { align: "right" });

      // ── Footer ──
      const footY = H - 20;
      pdf.setDrawColor(220, 218, 245);
      pdf.setLineWidth(0.4);
      pdf.line(L, footY, R, footY);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(30, 27, 75);
      pdf.text("Thank you for your timely payment!", L, footY + 7);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text("This is a computer-generated invoice. No physical signature required.", L, footY + 13);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text("Authorized Signature", R, footY + 10, { align: "right" });

      // Bottom indigo bar
      pdf.setFillColor(79, 70, 229);
      pdf.rect(0, H - 3, W, 3, "F");

      pdf.save(`Invoice-${state?.paymentId || "receipt"}.pdf`);
    } finally {
      setDownloading(false);
    }
  };


  const shortId = (state?.paymentId || "N/A").substring(0, 20);

  return (
    <div ref={invoiceRef} style={{
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "linear-gradient(160deg, #0d0b26 0%, #1a1040 50%, #0d1a33 100%)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      boxSizing: "border-box",
    }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 55%, #06b6d4 100%)",
          padding: "22px 48px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "130px", height: "130px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", top: "10px", right: "60px", width: "60px", height: "60px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>&#127968;</div>
              <div>
                <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>Sharma's House</h1>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>Gali No. 1, Salarpur, Noida, Sector 102</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={() => navigate("/dashboard")} style={{ padding: "5px 12px", borderRadius: "50px", border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  &#127968; Home
                </button>
                <div style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: 800, color: "#fff", letterSpacing: "2px" }}>RECEIPT</div>
              </div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "12px", fontFamily: "monospace" }}>#{shortId}</p>
            </div>
          </div>
        </div>

        {/* Status strip */}
        <div style={{ background: "#0e0c30", padding: "10px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "14.5px", letterSpacing: "0.5px" }}>PAID</span>
          </div>
          <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, color: "#475569", fontSize: "12px" }}>DATE</p>
              <p style={{ margin: 0, color: "#cbd5e1", fontWeight: 600, fontSize: "14px" }}>{state?.date || "-"}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, color: "#475569", fontSize: "12px" }}>METHOD</p>
              <p style={{ margin: 0, color: "#cbd5e1", fontWeight: 600, fontSize: "14px" }}>Razorpay &middot; Online</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => window.print()} style={{ padding: "5px 13px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#94a3b8", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>&#128424; Print</button>
              <button onClick={handleDownload} disabled={downloading} style={{ padding: "5px 13px", borderRadius: "6px", border: "none", background: downloading ? "rgba(108,99,255,0.4)" : "linear-gradient(135deg,#6c63ff,#3b82f6)", color: "#fff", cursor: downloading ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 700 }}>{downloading ? "..." : "PDF"}</button>
            </div>
          </div>
        </div>

        {/* From / To */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "18px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: "20px", flexShrink: 0 }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>From (Landlord)</p>
            <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#e2e8f0", fontSize: "15.5px" }}>Mahesh Sharma</p>
            <p style={{ margin: "0 0 1px", color: "#64748b", fontSize: "13.5px" }}>Gali No. 1, Salarpur, Noida</p>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px" }}>maheshsharma@gmail.com</p>
          </div>
          <div style={{ background: "rgba(108,99,255,0.07)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "10px", padding: "12px 16px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>Billed To (Tenant)</p>
            <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#e2e8f0", fontSize: "15.5px" }}>{state?.name || "-"}</p>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px" }}>Tenant &middot; Paid via Razorpay</p>
          </div>
        </div>

        {/* Line items */}
        <div style={{ padding: "16px 48px", flex: 1, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 110px", padding: "6px 12px", marginBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "#334155", fontSize: "12.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>#</span>
            <span style={{ color: "#334155", fontSize: "12.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Description</span>
            <span style={{ color: "#334155", fontSize: "12.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", textAlign: "right" }}>Amount</span>
          </div>
          {rentBills.map((bill, i) => (
            <div key={`rent-${i}`} style={{ display: "grid", gridTemplateColumns: "36px 1fr 110px", padding: "10px 12px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#475569", fontSize: "14px", fontWeight: 600 }}>{i + 1}</span>
              <div>
                <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 600, fontSize: "15px" }}>Room Rent{rentBills.length > 1 ? ` · Month ${i + 1}` : ""}</p>
                {bill.dueDate && <p style={{ margin: "1px 0 0", color: "#475569", fontSize: "13px" }}>Due: {bill.dueDate.substring(0, 10)}</p>}
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ display: "inline-block", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", fontWeight: 700, fontSize: "15px", borderRadius: "7px", padding: "3px 10px" }}>&#8377;{bill.amountDue}</span>
              </div>
            </div>
          ))}
          {elecBills.map((bill, i) => (
            <div key={`elec-${i}`} style={{ display: "grid", gridTemplateColumns: "36px 1fr 110px", padding: "10px 12px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#475569", fontSize: "14px", fontWeight: 600 }}>{rentBills.length + i + 1}</span>
              <div>
                <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 600, fontSize: "15px" }}>Electricity Bill{elecBills.length > 1 ? ` · Month ${i + 1}` : ""}</p>
                {bill.dueDate && <p style={{ margin: "1px 0 0", color: "#475569", fontSize: "13px" }}>Due: {bill.dueDate.substring(0, 10)}</p>}
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ display: "inline-block", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.25)", color: "#facc15", fontWeight: 700, fontSize: "15px", borderRadius: "7px", padding: "3px 10px" }}>&#8377;{bill.amountDue}</span>
              </div>
            </div>
          ))}
          {rentBills.length === 0 && elecBills.length === 0 && (
            <p style={{ textAlign: "center", color: "#475569", fontSize: "13px", padding: "16px 0" }}>No bill details available.</p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.18), rgba(59,130,246,0.18))", border: "1px solid rgba(108,99,255,0.3)", borderRadius: "12px", padding: "12px 20px", minWidth: "210px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#64748b", fontSize: "13.5px" }}>Subtotal</span>
                <span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 600 }}>&#8377;{totalAmount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#64748b", fontSize: "13.5px" }}>GST / Tax</span>
                <span style={{ color: "#22c55e", fontSize: "14px", fontWeight: 600 }}>&#8377;0.00</span>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#e2e8f0", fontSize: "15px", fontWeight: 700 }}>Total Paid</span>
                <span style={{ color: "#a78bfa", fontSize: "1.4rem", fontWeight: 800 }}>&#8377;{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#0e0c30", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, marginTop: "auto" }}>
          <div>
            <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 600, fontSize: "14.5px" }}>Thank you for your payment! &#128591;</p>
            <p style={{ margin: "3px 0 0", color: "#334155", fontSize: "13px" }}>Computer-generated receipt &middot; No signature required.</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <img src="/signature.png" alt="Signature" style={{ width: "100px", height: "36px", objectFit: "contain", filter: "invert(1) brightness(1.5)", opacity: 0.85 }} />
            <p style={{ margin: "3px 0 0", color: "#334155", fontSize: "12.5px" }}>Authorized Signature</p>
          </div>
        </div>
    </div>
  );
};

export default Invoice;
