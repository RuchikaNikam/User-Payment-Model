const express = require("express");
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} = require("../controllers/userController");

const { authenticateUser } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const { validateUserUpdate } = require("../middlewares/validationMiddleware");

const router = express.Router();

// ✅ User Registration (No authentication required)
router.post("/register", registerUser); 

// ✅ User Login (No authentication required)
router.post("/login", loginUser); 

// ✅ Get User Profile (Requires authentication)
router.get("/:id", authenticateUser, getUserProfile);

// ✅ Update User Profile (Requires authentication + validation)
router.put("/:id", authenticateUser, validateUserUpdate, updateUserProfile);

// ✅ Admin Route: Only admins can update any user profile
router.put("/:id/admin", authenticateUser, authorizeRoles(["admin"]), updateUserProfile);

module.exports = router;
