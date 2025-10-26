const express = require("express");
const {
  applyForJob,
  getAppliedJobs,
  updateApplicationStatus,
  uploadResume,
  uploadProfilePic,
  getJobSeekerProfile,
} = require("../controllers/jobSeekerController");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

// Public routes
router.get("/profile/:id", getJobSeekerProfile);

// Protected routes - JobSeeker only
router.post(
  "/apply/:jobId",
  (req, res, next) => {
    console.log('Route hit: /apply/:jobId');
    next();
  },
  authenticateToken,
  authorizeRole(["jobseeker"]),
  applyForJob
);
router.get("/applied-jobs", authenticateToken, authorizeRole(["jobseeker"]), getAppliedJobs);
router.put("/application/:jobId/status", authenticateToken, authorizeRole(["jobseeker"]), updateApplicationStatus);

// File upload routes
router.post("/upload-resume", authenticateToken, authorizeRole(["jobseeker"]), upload.single("resume"), uploadResume);
router.post("/upload-profile-pic", authenticateToken, authorizeRole(["jobseeker"]), upload.single("profilePic"), uploadProfilePic);

module.exports = router;