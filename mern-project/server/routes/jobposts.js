const express = require("express");
const {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  getJobsByRecruiter,
} = require("../controllers/jobPostController");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", getAllJobPosts);
router.get("/:id", getJobPostById);

// Protected routes - Recruiter only
router.post("/", authenticateToken, authorizeRole(["recruiter"]), createJobPost);
router.put("/:id", authenticateToken, authorizeRole(["recruiter"]), updateJobPost);
router.delete("/:id", authenticateToken, authorizeRole(["recruiter"]), deleteJobPost);
router.get("/recruiter/jobs", authenticateToken, authorizeRole(["recruiter"]), getJobsByRecruiter);

module.exports = router;