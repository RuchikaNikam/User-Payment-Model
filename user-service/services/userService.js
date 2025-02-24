const User = require("../models/User");
const redisClient = require("../config/redis");

// Get user by ID (with caching)
exports.getUserById = async (userId) => {
  // Check Redis cache
  const cachedUser = await redisClient.get(`user:${userId}`);
  if (cachedUser) return JSON.parse(cachedUser);

  // Fetch from database
  const user = await User.findById(userId);
  if (!user) return null;

  // Store in Redis cache
  await redisClient.set(`user:${userId}`, JSON.stringify(user), "EX", 3600);
  return user;
};

// Update user profile
exports.updateUserProfile = async (userId, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  if (!updatedUser) return null;

  // Update Redis cache
  await redisClient.set(`user:${userId}`, JSON.stringify(updatedUser), "EX", 3600);
  return updatedUser;
};
