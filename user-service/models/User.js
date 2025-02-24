const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profilePic: { type: String, default: "default.jpg" },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
