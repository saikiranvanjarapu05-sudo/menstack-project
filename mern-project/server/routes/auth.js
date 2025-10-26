const express = require("express");
const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticateToken, getProfile);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

module.exports = router;