const mongoose = require("mongoose");

const roomBillSchema = new mongoose.Schema(
  {
    renterId: { type: String, ref: "Renter", required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["card", "netbanking", "qr", "cash"],
      default: "card",
    },
    dueDate: { type: Date, required: true },
    paymentDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    transactionId: { type: String, default: null },
  },
  { timestamps: true }
);

const RoomBill = mongoose.model("RoomBill", roomBillSchema);

module.exports = RoomBill;
