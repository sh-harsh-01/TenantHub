const RoomBill = require("../models/RoomBill");
const ElectricityBill = require("../models/ElectricityBill");

const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config(); // Load .env variables

// Initialize Razorpay instance with credentials from .env

// console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
// console.log("Key Secret:", process.env.RAZORPAY_SECRET); // Optional, but avoid logging in production

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const currency = "INR";

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: parseInt(amount) * 100, // Amount in paise
      currency,
      receipt,
      payment_capture: 1, // Capture payment automatically
    };

    // console.log("Creating Razorpay order with options:", options);

    // create the order using rozarpay API
    const order = await razorpay.orders.create(options);
    // console.log("Order created successfully:", order);

    return res.status(200).json({ order });
  } catch (error) {
    if (error.response) {
      console.error("Error creating Razorpay order:", error.response);
    } else {
      console.error("Error creating Razorpay order:", error);
    }

    return res.status(500).json({ error: "Failed to create order" });
  }
};

// Verify Razorpay payment signature

const verifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment signature is valid
      return res
        .status(200)
        .json({ success: true, message: "Payment verified" });
    } else {
      // Invalid signature
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getKey = (req, res) => {
  try {
    const razorpayKey = process.env.RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      throw new Error("Razorpay Key is missing.");
    }

    // console.log("hello",razorpayKey);

    res.status(200).json({ key: razorpayKey });
  } catch (error) {
    console.error("Error retrieving Razorpay Key:", error);
    throw error;
  }
};

const updateStatus = async (req, res) => {
  try {
    const { rentBillIds = [], elecBillIds = [], paymentId } = req.body;

    const now = new Date();
    const updateFields = {
      status: "paid",
      paymentDate: now,
      paymentMethod: "card",
      transactionId: paymentId || null,
    };

    let roomModified = 0;
    let elecModified = 0;

    if (rentBillIds.length > 0) {
      const roomUpdate = await RoomBill.find({ _id: { $in: rentBillIds } });
      for (const bill of roomUpdate) {
        bill.status = "paid";
        bill.amountPaid = bill.amountDue;
        bill.paymentDate = now;
        bill.paymentMethod = "card";
        bill.transactionId = paymentId || null;
        await bill.save();
        roomModified++;
      }
    }

    if (elecBillIds.length > 0) {
      const elecUpdate = await ElectricityBill.find({ _id: { $in: elecBillIds } });
      for (const bill of elecUpdate) {
        bill.status = "paid";
        bill.amountPaid = bill.amountDue;
        bill.paymentDate = now;
        bill.paymentMethod = "card";
        bill.transactionId = paymentId || null;
        await bill.save();
        elecModified++;
      }
    }

    if (roomModified === 0 && elecModified === 0) {
      return res.status(404).json({ message: "No bills found to update." });
    }

    res.json({ success: true, message: `Marked ${roomModified} rent bill(s) and ${elecModified} electricity bill(s) as paid.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getKey,
  updateStatus,
};
