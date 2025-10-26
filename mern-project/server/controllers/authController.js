const jwt = require("jsonwebtoken");
const JobSeeker = require("../models/jobSeekerModel");
const Recruiter = require("../models/recuttersModel");

const register = async (req, res) => {
  try {
    const { name, email, password, role, ...otherFields } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["jobseeker", "recruiter"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    let user;
    if (role === "jobseeker") {
      user = new JobSeeker({ name, email, password, ...otherFields });
    } else {
      user = new Recruiter({ name, email, password, ...otherFields });
    }

    await user.save();

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user;
    if (role === "jobseeker") {
      user = await JobSeeker.findOne({ email });
    } else if (role === "recruiter") {
      user = await Recruiter.findOne({ email });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;

    let user;
    if (role === "jobseeker") {
      user = await JobSeeker.findById(id).select("-password");
    } else {
      user = await Recruiter.findById(id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.password;
    delete updates.email;

    let user;
    if (role === "jobseeker") {
      user = await JobSeeker.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    } else {
      user = await Recruiter.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };