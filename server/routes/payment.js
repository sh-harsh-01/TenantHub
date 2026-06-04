// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/rozarPayController');

// Sample route (optional)
router.get('/sample', (req, res) => {
  res.json({ message: 'This is a sample route' });
});


// Route to create a Razorpay order
router.get('/get-key',PaymentController.getKey);

// Route to create a Razorpay order
router.post('/create-order', PaymentController.createOrder);

// Route to verify the Razorpay payment
router.post('/verify-payment', PaymentController.verifyPayment);

router.post('/update-status', PaymentController.updateStatus);

module.exports = router;
