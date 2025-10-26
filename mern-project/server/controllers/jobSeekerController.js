const JobSeeker = require("../models/jobSeekerModel");
const JobPost = require("../models/jobsModel");

const applyForJob = async (req, res) => {
  try {
    console.log('applyForJob called');
    console.log('req.body:', req.body);
    console.log('req.user:', req.user);

    const { id, role } = req.user; // JobSeeker ID and role

    // Check if user is a job seeker
    if (role !== 'jobseeker') {
      return res.status(403).json({ message: "Only job seekers can apply for jobs" });
    }

    const { jobId } = req.params;
    const coverLetter = req.body.coverLetter || '';
    const resumeUrl = req.body.resumeUrl || null;

    console.log('coverLetter:', coverLetter);
    console.log('resumeUrl:', resumeUrl);

    // Check if jobSeeker exists
    const jobSeeker = await JobSeeker.findById(id);
    console.log('jobSeeker found:', !!jobSeeker);
    if (!jobSeeker) {
      console.log('Job seeker not found with id:', id);
      return res.status(404).json({ message: "Job seeker not found" });
    }

    // Check if jobPost exists
    const jobPost = await JobPost.findById(jobId);
    console.log('jobPost found:', !!jobPost);
    if (!jobPost) {
      console.log('Job post not found with id:', jobId);
      return res.status(404).json({ message: "Job post not found" });
    }

    // Check if already applied
    const alreadyApplied = jobSeeker.appliedJobs.some(
      (application) => application.jobId.toString() === jobId
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    // Add application to job seeker's appliedJobs
    jobSeeker.appliedJobs.push({
      jobId,
      appliedAt: new Date(),
      status: "applied",
      resumeUrl: resumeUrl || jobSeeker.resumeUrl,
    });
    await jobSeeker.save();

    // Add applicant to job post's applicants
    jobPost.applicants.push({
      seekerId: id,
      appliedAt: new Date(),
      status: "applied",
      resumeUrl: resumeUrl || jobSeeker.resumeUrl,
    });
    await jobPost.save();

    // Find the recruiter who posted this job and add notification
    const Recruiter = require("../models/recuttersModel");
    const recruiter = await Recruiter.findOne({ "postedJobs.jobId": jobId });
    if (recruiter) {
      recruiter.notifications.push({
        message: `${jobSeeker.name} has applied for the position: ${jobPost.title}`,
        type: "application",
        read: false,
        createdAt: new Date(),
      });
      await recruiter.save();
    }

    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAppliedJobs = async (req, res) => {
  try {
    const { id } = req.user;

    const jobSeeker = await JobSeeker.findById(id).populate({
      path: "appliedJobs.jobId",
      model: "JobPost",
    });

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.json({ appliedJobs: jobSeeker.appliedJobs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.user; // JobSeeker ID
    const { jobId } = req.params;
    const { status } = req.body;

    const validStatuses = ["applied", "reviewing", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const jobSeeker = await JobSeeker.findById(id);
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    const application = jobSeeker.appliedJobs.find(
      (app) => app.jobId.toString() === jobId
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await jobSeeker.save();

    // Update status in job post as well
    const jobPost = await JobPost.findById(jobId);
    if (jobPost) {
      const applicant = jobPost.applicants.find(
        (app) => app.seekerId.toString() === id
      );
      if (applicant) {
        applicant.status = status;
        await jobPost.save();
      }
    }

    res.json({ message: "Application status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    const { id } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      id,
      { resumeUrl: req.file.path },
      { new: true }
    );

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const uploadProfilePic = async (req, res) => {
  try {
    const { id } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      id,
      { profilePicUrl: req.file.path },
      { new: true }
    );

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobSeekerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const jobSeeker = await JobSeeker.findById(id).select("-password");
    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.json({ jobSeeker });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  applyForJob,
  getAppliedJobs,
  updateApplicationStatus,
  uploadResume,
  uploadProfilePic,
  getJobSeekerProfile,
};