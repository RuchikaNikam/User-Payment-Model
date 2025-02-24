exports.validatePayment = (req, res, next) => {
  const { amount, paymentMethod } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount." });
  }

  const allowedMethods = ["credit_card", "paypal", "bank_transfer", "crypto"];
  if (!allowedMethods.includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Invalid payment method." });
  }

  next();
};
