const User = require("../models/User");
const redisClient = require("../config/redis");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Login User & Generate JWT Token
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get User Profile with Redis Caching
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check Redis cache
    const cachedUser = await redisClient.get(`user:${userId}`);
    if (cachedUser) {
      return res.json({ success: true, user: JSON.parse(cachedUser) });
    }

    // Fetch from DB if not cached
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Store in Redis cache
    await redisClient.set(`user:${userId}`, JSON.stringify(user), { EX: 3600 });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, profilePic } = req.body;

    const user = await User.findByIdAndUpdate(userId, { name, profilePic }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update Redis cache
    await redisClient.set(`user:${userId}`, JSON.stringify(user), { EX: 3600 });

    res.json({ success: true, message: "Profile updated!", user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
