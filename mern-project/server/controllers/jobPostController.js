const JobPost = require("../models/jobsModel");
const Recruiter = require("../models/recuttersModel");

const createJobPost = async (req, res) => {
  try {
    const { id } = req.user;
    const jobData = req.body;

    // Verify recruiter exists
    const recruiter = await Recruiter.findById(id);
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const jobPost = new JobPost(jobData);
    await jobPost.save();

    // Add job to recruiter's postedJobs
    recruiter.postedJobs.push({
      jobId: jobPost._id,
      title: jobPost.title,
      status: "open",
      postedAt: new Date(),
    });
    await recruiter.save();

    res.status(201).json({
      message: "Job post created successfully",
      jobPost,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllJobPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, location, type } = req.query;
    const query = { };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    const jobPosts = await JobPost.find(query)
      .sort({ postedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await JobPost.countDocuments(query);

    res.json({
      jobPosts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalJobs: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobPost = await JobPost.findById(id);

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.json({ jobPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const updates = req.body;

    const jobPost = await JobPost.findById(id);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    // Check if user is the recruiter who posted the job
    const recruiter = await Recruiter.findOne({ "postedJobs.jobId": id });
    if (!recruiter || recruiter._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to update this job post" });
    }

    const updatedJobPost = await JobPost.findByIdAndUpdate(id, updates, { new: true });

    res.json({
      message: "Job post updated successfully",
      jobPost: updatedJobPost,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const jobPost = await JobPost.findById(id);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    // Check if user is the recruiter who posted the job
    const recruiter = await Recruiter.findOne({ "postedJobs.jobId": id });
    if (!recruiter || recruiter._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this job post" });
    }

    await JobPost.findByIdAndDelete(id);

    // Remove from recruiter's postedJobs
    recruiter.postedJobs = recruiter.postedJobs.filter(
      (job) => job.jobId.toString() !== id
    );
    await recruiter.save();

    res.json({ message: "Job post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobsByRecruiter = async (req, res) => {
  try {
    const { id } = req.user;

    const recruiter = await Recruiter.findById(id).populate({
      path: "postedJobs.jobId",
      model: "JobPost",
    });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    res.json({ jobs: recruiter.postedJobs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  getJobsByRecruiter,
};