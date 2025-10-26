const express = require("express");
const {
  getPostedJobs,
  getJobApplicants,
  updateApplicationStatus,
  uploadCompanyLogo,
  uploadProfilePic,
  getRecruiterProfile,
  updateJobStatus,
  markNotificationAsRead,
} = require("../controllers/recruiterController");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

// Public routes
router.get("/profile/:id", getRecruiterProfile);

// Protected routes - Recruiter only
router.get("/jobs", authenticateToken, authorizeRole(["recruiter"]), getPostedJobs);
router.get("/jobs/:jobId/applicants", authenticateToken, authorizeRole(["recruiter"]), getJobApplicants);
router.put("/jobs/:jobId/applicants/:seekerId/status", authenticateToken, authorizeRole(["recruiter"]), updateApplicationStatus);
router.put("/jobs/:jobId/status", authenticateToken, authorizeRole(["recruiter"]), updateJobStatus);
router.put("/notifications/:notificationId/read", authenticateToken, authorizeRole(["recruiter"]), markNotificationAsRead);

// File upload routes
router.post("/upload-company-logo", authenticateToken, authorizeRole(["recruiter"]), upload.single("companyLogo"), uploadCompanyLogo);
router.post("/upload-profile-pic", authenticateToken, authorizeRole(["recruiter"]), upload.single("profilePic"), uploadProfilePic);

module.exports = router;