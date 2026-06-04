const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Renter = require("../models/Renter");
const RoomBill = require("../models/RoomBill");
const ElectricityBill = require("../models/ElectricityBill");


const loginRenter = async (req, res) => {
  const { email, password } = req.body;

  try {
    const renter = await Renter.findOne({ email });

    if (!renter) {
      // Use 'renter' here (the instance fetched)
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Check password (don't compare directly, use bcrypt for hashing)
    // const isPasswordEqual = await bcrypt.compare(password, renter.password);
    if (password !== renter.password) {
      // Again, check against 'renter'
      return res.status(403).json({
        message: "Auth failed: email or password is wrong",
        success: false,
      });
    }

    const token = jwt.sign(
      { id: renter._id, email: renter.email, fullName: renter.fullName, role: renter.role || "renter" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      secure:true,
      sameSite:"none"
    });

    return res.status(200).json({
      message: "Login successful",
      renter: {
        id: renter._id,
        fullName: renter.fullName,
        email: renter.email,
        role: renter.role || "renter",
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const getRenterData = async (req, res) => {
  try {
    const email = req.query.email;
    const renterDetails = await Renter.find(
      { email: email },
      { fullName: 1, email: 1, phone: 1 }
    );

    const id = await Renter.findOne({ email: email }, { _id: 1 });
    const renterId = id._id;
    
    const roomBill = await RoomBill.find({
      renterId: renterId.toString(),
      status: "pending",
    });

    const electricityBill = await ElectricityBill.find({
      renterId: renterId.toString(),
      status: "pending",
    });

    // Full history (all statuses) for transaction history table
    const roomBillHistory = await RoomBill.find(
      { renterId: renterId.toString() },
      { amountDue: 1, amountPaid: 1, dueDate: 1, status: 1, paymentDate: 1, transactionId: 1 }
    ).sort({ dueDate: -1 });

    const electricityBillHistory = await ElectricityBill.find(
      { renterId: renterId.toString() },
      { amountDue: 1, amountPaid: 1, dueDate: 1, status: 1, paymentDate: 1, transactionId: 1 }
    ).sort({ dueDate: -1 });

    const totalRentAmount = await RoomBill.aggregate([
      {
        $match: {
          renterId: renterId.toString(),
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amountDue" },
        },
      },
    ]);

    const totalRent =
      totalRentAmount.length > 0 ? totalRentAmount[0].totalAmount : 0;

    const totalElectricityAmount = await ElectricityBill.aggregate([
      {
        $match: {
          renterId: renterId.toString(),
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amountDue" },
        },
      },
    ]);

    const totalElectricity =
      totalElectricityAmount.length > 0
        ? totalElectricityAmount[0].totalAmount
        : 0;

    return res.send({
      renterDetails,
      roomBill,
      electricityBill,
      roomBillHistory,
      electricityBillHistory,
      totalRent,
      totalElectricity,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const totalAmountToPay = async (req, res) => {
  try {
    const email = req.query.email;
    const renterDetails = await Renter.find(
      { email: email },
      { fullName: 1, email: 1, phone: 1 }
    );

    const id = await Renter.findOne({ email: email }, { _id: 1 });
    const renterId = id._id;
    const roomBill = await RoomBill.find(
      {
        renterId: renterId.toString(),
        status: "pending",
      },
      { amountDue: 1, dueDate: 1 }
    );

    const electricityBill = await ElectricityBill.find(
      {
        renterId: renterId.toString(),
        status: "pending",
      },
      { amountDue: 1, dueDate: 1 }
    );

    const totalRentAmount = await RoomBill.aggregate([
      {
        $match: {
          renterId: renterId.toString(),
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amountDue" },
        },
      },
    ]);

    const totalRent =
      totalRentAmount.length > 0 ? totalRentAmount[0].totalAmount : 0;

    const totalElectricityAmount = await ElectricityBill.aggregate([
      {
        $match: {
          renterId: renterId.toString(),
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amountDue" },
        },
      },
    ]);

    const totalElectricity =
      totalElectricityAmount.length > 0
        ? totalElectricityAmount[0].totalAmount
        : 0;

    return res.send({
      renterDetails,
      roomBill,
      electricityBill,
      totalRent,
      totalElectricity,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getAllRentersInfo = async (req, res) => {
  try {
    const renterDetails = await Renter.find(
      {},
      { fullName: 1, email: 1, phone: 1 }
    );

    return res.send({ renterDetails });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getRenterDataByAdmin = async (req, res) => {
  try {
    const email = req.query.email;

    const id = await Renter.findOne({ email: email }, { _id: 1 });
    const renterId = id._id;

    const pendingRoomBill = await RoomBill.find(
      {
        renterId: renterId.toString(),
        status: "pending",
      },
      { amountDue: 1, dueDate: 1 }
    );

    const pendingElectricityBill = await ElectricityBill.find(
      {
        renterId: renterId.toString(),
        status: "pending",
      },
      { amountDue: 1, dueDate: 1 }
    );

    const paidRoomBill = await RoomBill.find(
      {
        renterId: renterId.toString(),
        status: "paid",
      },
      { amountDue: 1, dueDate: 1 }
    );

    const paidElectricityBill = await ElectricityBill.find(
      {
        renterId: renterId.toString(),
        status: "paid",
      },
      { amountDue: 1, dueDate: 1 }
    );

    const totalRentAmount = await RoomBill.aggregate([
      {
        $match: {
          renterId: renterId.toString(),
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amountDue" },
        },
      },
    ]);

    const totalRent =
      totalRentAmount.length > 0 ? totalRentAmount[0].totalAmount : 0;

    const totalElectricityAmount = await ElectricityBill.aggregate([
      {
        $match: {
          renterId: renterId.toString(),
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amountDue" },
        },
      },
    ]);

    const totalElectricity =
      totalElectricityAmount.length > 0
        ? totalElectricityAmount[0].totalAmount
        : 0;

    return res.send({
      pendingRoomBill,
      pendingElectricityBill,
      paidRoomBill,
      paidElectricityBill,
      totalRent,
      totalElectricity,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const registerRenter = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  if (!name || !email || !password || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existing = await Renter.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const newRenter = new Renter({
      fullName: name,
      email,
      password,
      phone: phoneNumber,
      monthlyRent: 0,
      nextRentDueDate: new Date(),
    });

    await newRenter.save();
    return res.status(200).json({ message: "Registration successful!" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  // createRenter,
  registerRenter,
  loginRenter,
  getRenterData,
  getAllRentersInfo,
  totalAmountToPay,
  getRenterDataByAdmin,
};
