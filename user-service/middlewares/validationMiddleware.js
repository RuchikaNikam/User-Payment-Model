const { body, validationResult } = require("express-validator");

// ✅ Validate User Profile Update
exports.validateUserUpdate = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("profilePic").optional().isURL().withMessage("Profile picture must be a valid URL"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
