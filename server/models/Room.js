const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: String, default: "" },
  monthlyRent: { type: Number, required: true },
  renterId: { type: String, default: null }, // null = vacant
  renterName: { type: String, default: null },
  renterEmail: { type: String, default: null },
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
