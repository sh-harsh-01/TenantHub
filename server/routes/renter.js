// routes/yourRoutes.js
const express = require("express");
const router = express.Router();
const Renter = require("../controllers/renterController");
// const { signupValidation } = require("../middleware/studentAuth");

// Sample route
router.get("/sample", (req, res) => {
 
  res.json({ message: "This is a sample route" });
});

router.get("/get-renter-data", Renter.getRenterData);

router.get("/get-pay-amount", Renter.totalAmountToPay);

// router.post("/create", Renter.createRenter);

router.post("/register", Renter.registerRenter);

router.post("/login", Renter.loginRenter);

router.get("/renters-info", Renter.getAllRentersInfo);

router.get("/get-renter-bill-by-admin",Renter.getRenterDataByAdmin)

module.exports = router;
