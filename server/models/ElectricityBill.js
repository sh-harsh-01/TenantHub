const mongoose = require("mongoose");

const electricityBillSchema = new mongoose.Schema(
  {
    renterId: { type: String, ref: "Renter", required: true },
    billingMonth: { type: String, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["card", "netbanking", "qr", "cash", null],
      default: null,
    },
    dueDate: { type: Date, required: true },
    paymentDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    transactionId: { type: String, default: null },
  },
  { timestamps: true }
);

const ElectricityBill = mongoose.model("ElectricityBill", electricityBillSchema);

module.exports = ElectricityBill;
