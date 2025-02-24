const Payment = require("../models/paymentModel");
const redisClient = require("../config/redis");

// Get payment by ID (with caching)
exports.getPaymentById = async (paymentId) => {
  // Check Redis cache
  const cachedPayment = await redisClient.get(`payment:${paymentId}`);
  if (cachedPayment) return JSON.parse(cachedPayment);

  // Fetch from database
  const payment = await Payment.findById(paymentId);
  if (!payment) return null;

  // Store in Redis cache
  await redisClient.set(`payment:${paymentId}`, JSON.stringify(payment), "EX", 3600);
  return payment;
};

// Cancel a payment
exports.cancelPayment = async (paymentId) => {
  const updatedPayment = await Payment.findByIdAndUpdate(paymentId, { status: "failed" }, { new: true });
  if (!updatedPayment) return null;

  // Update Redis cache
  await redisClient.set(`payment:${paymentId}`, JSON.stringify(updatedPayment), "EX", 3600);
  return updatedPayment;
};
