// routes/yourRoutes.js
const express = require("express");
const router = express.Router();
const Admin = require("../controllers/adminController");
const isAdmin = require("../middlewares/isAdmin");

router.get("/renters-info", isAdmin, Admin.getAllRentersInfo);
router.get("/get-renter-bill-by-admin", isAdmin, Admin.getRenterDataByAdmin);
router.post("/add-electricity-bill", isAdmin, Admin.addElectricityBill);
router.get("/all-bills", isAdmin, Admin.getAllBills);

// Settings
router.post("/change-password", isAdmin, Admin.changePassword);
router.get("/config", isAdmin, Admin.getConfig);
router.post("/config", isAdmin, Admin.updateConfig);

// Rooms / Properties
router.get("/rooms", isAdmin, Admin.getRooms);
router.post("/rooms", isAdmin, Admin.addRoom);
router.post("/rooms/assign", isAdmin, Admin.assignRoom);
router.delete("/rooms/:id", isAdmin, Admin.deleteRoom);

module.exports = router;
