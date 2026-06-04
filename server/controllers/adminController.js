const bcrypt = require("bcrypt");
const Renter = require("../models/Renter");
const RoomBill = require("../models/RoomBill");
const ElectricityBill = require("../models/ElectricityBill");
const AppConfig = require("../models/AppConfig");
const Room = require("../models/Room");
const jwt = require("jsonwebtoken");

const getAllRentersInfo = async (req, res) => {
  try {
    const renterDetails = await Renter.find(
      { role: { $ne: "admin" } },
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

const addElectricityBill = async (req, res) => {
  try {
    
    const { email, amountDue, dueDate, billingMonth } = req.body;

    if (!email || !amountDue || !dueDate || !billingMonth) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const renter = await Renter.findOne({ email });
    if (!renter) {
      return res.status(404).json({ message: "Renter not found" });
    }

    
    const newBill = new ElectricityBill({
      renterId: renter._id,
      billingMonth,
      amountDue,
      amountPaid: 0,
      paymentMethod: null,
      dueDate,
      paymentDate: null,
      paymentMonth: null,
      status: "pending",
      transactionId: null,
    });

    await newBill.save();

    res
      .status(201)
      .json({ message: "Electricity bill added successfully", bill: newBill });
  } catch (error) {
    console.error("Error adding electricity bill:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllBills = async (req, res) => {
  try {
    // Fetch all renters to build an id→name map (exclude admins)
    const renters = await Renter.find({ role: { $ne: "admin" } }, { _id: 1, fullName: 1, email: 1 });
    const renterMap = {};
    renters.forEach((r) => { renterMap[r._id.toString()] = { fullName: r.fullName, email: r.email }; });

    const roomBills = await RoomBill.find({}).sort({ dueDate: -1 });
    const electricityBills = await ElectricityBill.find({}).sort({ dueDate: -1 });

    const enriched = (bills, type) =>
      bills.map((b) => ({
        _id: b._id,
        type,
        amountDue: b.amountDue,
        amountPaid: b.amountPaid,
        dueDate: b.dueDate,
        paymentDate: b.paymentDate,
        status: b.status,
        transactionId: b.transactionId,
        renterName: renterMap[b.renterId]?.fullName || "Unknown",
        renterEmail: renterMap[b.renterId]?.email || "",
      }));

    return res.send({
      bills: [
        ...enriched(roomBills, "Room Rent"),
        ...enriched(electricityBills, "Electricity"),
      ].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getAllRentersInfo,
  getRenterDataByAdmin,
  addElectricityBill,
  getAllBills,

  // ── Change admin password ──────────────────────────────────
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword)
        return res.status(400).json({ message: "Both fields are required" });
      if (newPassword.length < 4)
        return res.status(400).json({ message: "New password must be at least 4 characters" });

      const admin = await Renter.findById(req.user.id);
      if (!admin) return res.status(404).json({ message: "Admin not found" });

      if (currentPassword !== admin.password)
        return res.status(403).json({ message: "Current password is incorrect" });

      admin.password = newPassword;
      await admin.save();
      return res.json({ message: "Password updated successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },

  // ── Rent due day config ───────────────────────────────────
  getConfig: async (req, res) => {
    try {
      const config = await AppConfig.getSingleton();
      return res.json({ rentDueDay: config.rentDueDay });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },

  updateConfig: async (req, res) => {
    try {
      const { rentDueDay } = req.body;
      if (!rentDueDay || rentDueDay < 1 || rentDueDay > 28)
        return res.status(400).json({ message: "Day must be between 1 and 28" });
      const config = await AppConfig.getSingleton();
      config.rentDueDay = rentDueDay;
      await config.save();
      return res.json({ message: "Config updated", rentDueDay: config.rentDueDay });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },

  // ── Rooms ─────────────────────────────────────────────────
  getRooms: async (req, res) => {
    try {
      const rooms = await Room.find().sort({ roomNumber: 1 });
      return res.json({ rooms });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },

  addRoom: async (req, res) => {
    try {
      const { roomNumber, floor, monthlyRent, notes } = req.body;
      if (!roomNumber || !monthlyRent)
        return res.status(400).json({ message: "Room number and monthly rent are required" });
      const exists = await Room.findOne({ roomNumber });
      if (exists) return res.status(409).json({ message: "Room number already exists" });
      const room = await Room.create({ roomNumber, floor, monthlyRent, notes });
      return res.status(201).json({ room });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },

  assignRoom: async (req, res) => {
    try {
      const { roomId, renterEmail } = req.body;
      const room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      if (!renterEmail) {
        // Unassign
        room.renterId = null; room.renterName = null; room.renterEmail = null;
      } else {
        const renter = await Renter.findOne({ email: renterEmail, role: { $ne: "admin" } });
        if (!renter) return res.status(404).json({ message: "Renter not found" });
        room.renterId = renter._id.toString();
        room.renterName = renter.fullName;
        room.renterEmail = renter.email;
      }
      await room.save();
      return res.json({ room });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },

  deleteRoom: async (req, res) => {
    try {
      await Room.findByIdAndDelete(req.params.id);
      return res.json({ message: "Room deleted" });
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },
};
