const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");


// Enable CORS — allow credentials so cookies are sent cross-origin
app.use(cors({
  origin: "https://tenant-hub-three.vercel.app",
  credentials: true,
}));

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection
connectDB();


// Import routes
const renter = require("./routes/renter");
const admin = require("./routes/admin");
const paymentRoutes = require('./routes/payment');

// Auth endpoints — verify cookie token & logout
app.get("/auth/verify", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ authenticated: false });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ authenticated: true, user: decoded });
  } catch {
    return res.status(401).json({ authenticated: false });
  }
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  return res.status(200).json({ message: "Logged out" });
});

// Use routes
app.use("/renter", renter);
app.use("/admin", admin);
app.use('/payment', paymentRoutes);

app.get("/payment/getkey", (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID })
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
