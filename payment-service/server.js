const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
require("dotenv").config();

const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Connect to Redis
const redisClient = redis.createClient();

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

redisClient.connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((err) => console.error("❌ Redis Connection Failed:", err));

// ✅ Attach Redis Client to Global Scope
global.redisClient = redisClient;

// ✅ Routes
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Payment Service running on port ${PORT}`));
