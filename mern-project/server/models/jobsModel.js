const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const jobPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Temporary"],
      default: "Full-time",
    },
    salary: { type: String },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    experience: { type: String },
    postedDate: { type: Date, default: Date.now },

    // Applicants array
    applicants: [
      {
        seekerId: { type: Schema.Types.ObjectId, ref: "JobSeeker" }, // reference to Job Seeker
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["applied", "reviewing", "shortlisted", "rejected", "hired"],
          default: "applied",
        },
        resumeUrl: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("JobPost", jobPostSchema);
