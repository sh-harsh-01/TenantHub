const mongoose = require("mongoose");

const renterSchema = new mongoose.Schema({
  fullName: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  phone: { type: String },
  dob: { type: Date },
  gender: { type: String },
  monthlyRent: { type: Number, required: true },
  nextRentDueDate: { type: Date, required: true },
  role: { type: String, enum: ["renter", "admin"], default: "renter" },
});

const Renter = mongoose.model("Renter", renterSchema);

module.exports = Renter;
