const connectDB = require("./configs/mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/auth");
const jobPostRoutes = require("./routes/jobposts");
const jobSeekerRoutes = require("./routes/jobseeker");
const recruiterRoutes = require("./routes/recruiter");

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobPostRoutes);
app.use("/api/jobseeker", jobSeekerRoutes);
app.use("/api/recruiter", recruiterRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running", status: "OK" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
