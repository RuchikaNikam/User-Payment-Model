const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { validatePayment } = require("../middlewares/paymentValidation");
const paymentController = require("../controllers/paymentController");

// 🏦 Process Payment (Protected Route)
router.post("/process", authenticateJWT, validatePayment, paymentController.processPayment);

// 🔍 Get Payment by ID (Protected Route)
router.get("/:id", authenticateJWT, paymentController.getPayment);

// ❌ Cancel Payment (Protected Route)
router.put("/cancel/:id", authenticateJWT, paymentController.cancelPayment);

module.exports = router;
