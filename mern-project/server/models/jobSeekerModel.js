const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema, model } = mongoose;

const jobSeekerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    location: { type: String },
    profilePicUrl: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    portfolioUrl: { type: String },
    experience: { type: String },
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    appliedJobs: [
      {
        jobId: { type: Schema.Types.ObjectId, ref: "JobPost" },
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["applied", "reviewing", "shortlisted", "rejected", "hired"],
          default: "applied",
        },
        resumeUrl: { type: String },
      },
    ],
    notifications: [
      {
        message: String,
        type: {
          type: String,
          enum: ["system", "job", "application", "callback"],
          default: "system",
        },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isVerified: { type: Boolean, default: false },
    eligible: { type: Boolean, default: true },
    dateOfBirth: { type: Date },
  },
  { timestamps: true }
);

/* Password hashing */
jobSeekerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

jobSeekerSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = model("JobSeeker", jobSeekerSchema);
