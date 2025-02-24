const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transactionId: { type: String, unique: true, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ["pending", "success", "failed", "canceled"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
