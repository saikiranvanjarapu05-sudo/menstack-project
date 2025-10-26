const Recruiter = require("../models/recuttersModel");
const JobPost = require("../models/jobsModel");
const JobSeeker = require("../models/jobSeekerModel");

const getPostedJobs = async (req, res) => {
  try {
    const { id } = req.user;

    const recruiter = await Recruiter.findById(id).populate({
      path: "postedJobs.jobId",
      model: "JobPost",
    });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    res.json({ postedJobs: recruiter.postedJobs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const { id } = req.user;
    const { jobId } = req.params;

    console.log('Getting applicants for job:', jobId, 'by recruiter:', id);

    // Verify the job belongs to the recruiter
    const recruiter = await Recruiter.findOne({ "postedJobs.jobId": jobId });
    console.log('Found recruiter:', !!recruiter);
    if (!recruiter || recruiter._id.toString() !== id) {
      console.log('Unauthorized: recruiter not found or ID mismatch');
      return res.status(403).json({ message: "Unauthorized to view applicants for this job" });
    }

    const jobPost = await JobPost.findById(jobId).populate({
      path: "applicants.seekerId",
      model: "JobSeeker",
      select: "name email phone skills location profilePicUrl resumeUrl",
    });

    console.log('Found job post:', !!jobPost);
    console.log('Applicants count:', jobPost?.applicants?.length || 0);

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.json({ applicants: jobPost.applicants });
  } catch (error) {
    console.error('Error in getJobApplicants:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.user; // Recruiter ID
    const { jobId, seekerId } = req.params;
    const { status } = req.body;

    const validStatuses = ["applied", "reviewing", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Verify the job belongs to the recruiter
    const recruiter = await Recruiter.findOne({ "postedJobs.jobId": jobId });
    if (!recruiter || recruiter._id.toString() !== id) {
      return res.status(403).json({ message: "Unauthorized to update application status" });
    }

    // Update status in job post
    const jobPost = await JobPost.findById(jobId);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    const applicant = jobPost.applicants.find(
      (app) => app.seekerId.toString() === seekerId
    );
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    applicant.status = status;
    await jobPost.save();

    // Update status in job seeker's appliedJobs
    const jobSeeker = await JobSeeker.findById(seekerId);
    if (jobSeeker) {
      const application = jobSeeker.appliedJobs.find(
        (app) => app.jobId.toString() === jobId
      );
      if (application) {
        application.status = status;
        await jobSeeker.save();

        // Add notification to job seeker when shortlisted
        if (status === 'shortlisted') {
          const jobPost = await JobPost.findById(jobId);
          jobSeeker.notifications.push({
            message: `Congratulations! You have been shortlisted for the position: ${jobPost.title} at ${jobPost.company}`,
            type: "application",
            read: false,
            createdAt: new Date(),
          });
          await jobSeeker.save();
        }
      }
    }

    res.json({ message: "Application status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const uploadCompanyLogo = async (req, res) => {
  try {
    const { id } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const recruiter = await Recruiter.findByIdAndUpdate(
      id,
      { companyLogoUrl: req.file.path },
      { new: true }
    );

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    res.json({
      message: "Company logo uploaded successfully",
      companyLogoUrl: req.file.path,
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

    const recruiter = await Recruiter.findByIdAndUpdate(
      id,
      { profilePicUrl: req.file.path },
      { new: true }
    );

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    res.json({
      message: "Profile picture uploaded successfully",
      profilePicUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRecruiterProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const recruiter = await Recruiter.findById(id).select("-password");
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    res.json({ recruiter });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.user;
    const { notificationId } = req.params;

    const recruiter = await Recruiter.findById(id);
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const notification = recruiter.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await recruiter.save();

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.user;
    const { jobId } = req.params;
    const { status } = req.body;

    const validStatuses = ["open", "closed", "draft"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const recruiter = await Recruiter.findOne({ "postedJobs.jobId": jobId });
    if (!recruiter || recruiter._id.toString() !== id) {
      return res.status(403).json({ message: "Unauthorized to update this job" });
    }

    const job = recruiter.postedJobs.find(
      (job) => job.jobId.toString() === jobId
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found in posted jobs" });
    }

    job.status = status;
    await recruiter.save();

    res.json({ message: "Job status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getPostedJobs,
  getJobApplicants,
  updateApplicationStatus,
  uploadCompanyLogo,
  uploadProfilePic,
  getRecruiterProfile,
  updateJobStatus,
  markNotificationAsRead,
};