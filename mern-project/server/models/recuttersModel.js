const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema, model } = mongoose;

const recruiterSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    bio: { type: String },
    location: { type: String },
    profilePicUrl: { type: String, default: "" },

    // Company details (optional, but helpful)
    companyName: { type: String },
    companyDescription: { type: String },
    companyWebsite: { type: String },
    companyLogoUrl: { type: String },

    // Jobs posted by recruiter
    postedJobs: [
      {
        jobId: { type: Schema.Types.ObjectId, ref: "JobPost" },
        title: { type: String },
        status: {
          type: String,
          enum: ["open", "closed", "draft"],
          default: "open",
        },
        postedAt: { type: Date, default: Date.now },
      },
    ],

    notifications: [
      {
        message: String,
        type: {
          type: String,
          enum: ["system", "application", "callback"],
          default: "system",
        },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isVerified: { type: Boolean, default: false },
    eligible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* Password hashing */
recruiterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

recruiterSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = model("Recruiter", recruiterSchema);
