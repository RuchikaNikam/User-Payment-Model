const { v4: uuidv4 } = require("uuid");
const Payment = require("../models/paymentModel");

// 🏦 **Simulate Payment Processing**
const processPaymentSimulation = () => {
  return Math.random() > 0.2 ? "success" : "failed"; // 80% chance of success
};

// 🏦 **Process Payment**
exports.processPayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Amount and payment method are required." });
    }

    console.log("Processing Payment:", { userId, amount, paymentMethod });

    const transactionId = uuidv4();
    const status = processPaymentSimulation(); // Simulated Payment Status

    const payment = new Payment({ userId, amount, paymentMethod, transactionId, status });
    const savedPayment = await payment.save();

    console.log("Payment Saved:", savedPayment);

    // Store in Redis for faster retrieval
    if (global.redisClient) {
      try {
        await global.redisClient.set(`payment:${savedPayment._id}`, JSON.stringify(savedPayment), { EX: 3600 });
      } catch (redisError) {
        console.error("Redis Error (Skipping Cache):", redisError);
      }
    }

    res.status(201).json({ success: true, message: "Payment processed successfully", payment: savedPayment });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// 🔍 **Get Payment by ID**
exports.getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Payment ID is required." });
    }

    console.log("Fetching Payment ID:", id);

    // Check Redis cache first
    if (global.redisClient) {
      try {
        const cachedPayment = await global.redisClient.get(`payment:${id}`);
        if (cachedPayment) {
          console.log("Cache Hit: Returning Payment from Redis");
          return res.json({ success: true, payment: JSON.parse(cachedPayment) });
        }
      } catch (redisError) {
        console.error("Redis Error (Skipping Cache):", redisError);
      }
    }

    // Fetch from MongoDB if not in cache
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    console.log("Database Hit: Payment Found", payment);

    // Store in Redis for future requests
    if (global.redisClient) {
      try {
        await global.redisClient.set(`payment:${id}`, JSON.stringify(payment), { EX: 3600 });
      } catch (redisError) {
        console.error("Redis Error (Skipping Cache):", redisError);
      }
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ❌ **Cancel Payment**
exports.cancelPayment = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Canceling Payment ID:", id);

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending payments can be canceled." });
    }

    payment.status = "canceled";
    await payment.save();

    console.log("Payment Canceled Successfully:", payment);

    // Update Redis cache
    if (global.redisClient) {
      try {
        await global.redisClient.set(`payment:${id}`, JSON.stringify(payment), { EX: 3600 });
      } catch (redisError) {
        console.error("Redis Error (Skipping Cache):", redisError);
      }
    }

    res.json({ success: true, message: "Payment canceled successfully.", payment });
  } catch (error) {
    console.error("Error canceling payment:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
