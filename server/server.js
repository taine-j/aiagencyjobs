import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureAuth } from './auth.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import multer from 'multer';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 1967;

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, '../src')));

// Middleware to parse JSON data with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Configure authentication
configureAuth(app);

// JOBS
// Route to get all jobs with optional limit
app.get('/jobs', async (req, res) => {
    const limit = parseInt(req.query._limit, 10);
  
    try {
      let query = Job.find().sort({ createdAt: -1 });
      if (limit) {
        query = query.limit(limit);
      }
      const jobs = await query.exec();
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Unable to fetch jobs' });
    }
  });

// Route to get a job by ID
app.get('/jobs/:id', async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await Job.findById(jobId).populate('postedBy', '_id email googleId');
    if (!job) {
      console.log(`Job with id ${jobId} not found`);
      return res.status(404).json({ error: `Job with id ${jobId} not found` });
    }
    console.log('Job fetched:', JSON.stringify(job, null, 2));
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Unable to fetch job', details: error.message });
  }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/jobs', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const newJob = new Job({
    ...req.body,
    postedBy: req.user._id
  });

  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ error: 'Unable to save job' });
  }
});

// Route to delete a job by ID
app.delete('/jobs/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  1
  const jobId = req.params.id;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: `Job with id ${jobId} not found` });
    }

    console.log('Job to delete:', job);
    console.log('User trying to delete:', req.user);

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(jobId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Unable to delete job' });
  }
});

// Route to update a job by ID
app.put('/jobs/:id', (req, res) => {
    const jobId = req.params.id;
    const updatedJob = req.body;

    fs.readFile(path.join(__dirname, '../data/jobs.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).json({ error: 'Unable to read data' });
        }

        try {
            const parsedData = JSON.parse(data);
            let jobs = parsedData.jobs;

            if (Array.isArray(jobs)) {
                const jobIndex = jobs.findIndex(job => job.id === jobId);

                if (jobIndex !== -1) {
                    jobs[jobIndex] = { ...jobs[jobIndex], ...updatedJob };

                    fs.writeFile(path.join(__dirname, '../data/jobs.json'), JSON.stringify({ jobs }), 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing to the file:', err);
                            return res.status(500).json({ error: 'Unable to update job' });
                        }

                        res.json(jobs[jobIndex]);
                    });
                } else {
                    res.status(404).json({ error: `Job with id ${jobId} not found` });
                }
            } else {
                console.error('Data is not in expected array format:', jobs);
                res.status(500).json({ error: 'Data is not in expected array format' });
            }
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
    });
});

// Route to update user profile
app.post('/update_profile', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const updatedProfile = req.body;

    try {
        const user = await User.findByIdAndUpdate(req.user._id, updatedProfile, { new: true, upsert: true });
        res.status(200).json(user);
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Route to get user's job listings
app.get('/user_jobs', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const userJobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(userJobs);
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    res.status(500).json({ error: 'Unable to fetch user jobs' });
  }
});

// Submit a job application
app.post('/api/job-applications', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'supportingDocs', maxCount: 1 }
]), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const newApplication = new JobApplication({
      job: req.body.job,
      applicant: req.user._id,
      message: req.body.message,
      skills: req.body.skills,
      projectLinks: req.body.projectLinks,
      cvPath: req.files['cv'] ? req.files['cv'][0].path : null,
      supportingDocsPath: req.files['supportingDocs'] ? req.files['supportingDocs'][0].path : null,
    });
    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Unable to submit application', details: error.message });
  }
});

// Get job applications for the current user
app.get('/job-applications', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const applications = await JobApplication.find({ applicant: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Unable to fetch applications', details: error.message });
  }
});

// Route to check the current user
app.get('/current_user', (req, res) => {
  try {
    if (req.user) {
      res.json({
        id: req.user._id,
        displayName: req.user.displayName,
        email: req.user.emails[0].value,
        googleId: req.user.googleId,
      });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Error in /current_user:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Catch-all handler to serve React's index.html for all unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
