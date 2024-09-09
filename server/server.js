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
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';

const requireLogin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'You must be logged in to do this' });
  }
  next();
};

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

// Configure AWS
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer for S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'private',
    key: function (req, file, cb) {
      console.log('Attempting to upload file:', file);
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      console.log('Generated file name:', fileName);
      console.log('S3 bucket:', process.env.S3_BUCKET_NAME);
      cb(null, fileName);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: 'original',
        key: function (req, file, cb) {
          cb(null, `original-${file.originalname}`);
        },
        transform: function (req, file, cb) {
          cb(null, sharp().resize(800, 600, { fit: 'inside' }));
        },
      },
    ],
  }),
  fileFilter: (req, file, cb) => {
    console.log('File filter - File type:', file.mimetype);
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only PDF is allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

console.log('Multer configuration:', JSON.stringify(upload, null, 2));

// Update your /job-applications route to use upload middleware directly
app.post('/job-applications', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'supportingDocs', maxCount: 1 }
]), async (req, res) => {
  console.log('Received job application request');
  console.log('Request body:', req.body);
  console.log('Request files:', JSON.stringify(req.files, null, 2));
  
  if (!req.user) {
    console.log('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    console.log('Received application data:', req.body);
    console.log('Received files:', JSON.stringify(req.files, null, 2));

    const { job, message, skills, projectLinks } = req.body;
    
    if (!job || !skills) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Job and skills are required fields' });
    }

    let cvPath = null;
    let supportingDocsPath = null;

    if (req.files['cv']) {
      const cvFile = req.files['cv'][0];
      console.log('CV file:', JSON.stringify(cvFile, null, 2));
      
      // Manual upload to S3 if multer-s3 failed
      if (!cvFile.location) {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${Date.now().toString()}-${cvFile.originalname}`,
          Body: cvFile.buffer,
          ContentType: cvFile.mimetype,
          ACL: 'private'
        };
        const command = new PutObjectCommand(uploadParams);
        const uploadResult = await s3Client.send(command);
        cvPath = uploadResult.Location;
      } else {
        cvPath = cvFile.location;
      }
    }

    if (req.files['supportingDocs']) {
      const supportingDocsFile = req.files['supportingDocs'][0];
      console.log('Supporting docs file:', JSON.stringify(supportingDocsFile, null, 2));
      
      // Manual upload to S3 if multer-s3 failed
      if (!supportingDocsFile.location) {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${Date.now().toString()}-${supportingDocsFile.originalname}`,
          Body: supportingDocsFile.buffer,
          ContentType: supportingDocsFile.mimetype,
          ACL: 'private'
        };
        const command = new PutObjectCommand(uploadParams);
        const uploadResult = await s3Client.send(command);
        supportingDocsPath = uploadResult.Location;
      } else {
        supportingDocsPath = supportingDocsFile.location;
      }
    }

    const newApplication = new JobApplication({
      job,
      applicant: req.user._id,
      message,
      skills,
      projectLinks,
      cvPath,
      supportingDocsPath,
    });

    console.log('New application object:', JSON.stringify(newApplication, null, 2));

    await newApplication.save();
    console.log('Application saved successfully');
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Unable to submit application', details: error.message, stack: error.stack });
  }
});

app.get('/applications/:id', requireLogin, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('job', 'title postedBy')
      .populate('applicant', 'displayName');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the current user is either the applicant or the job poster
    const isApplicant = application.applicant._id.toString() === req.user.id;
    const isJobPoster = application.job && application.job.postedBy && 
                        application.job.postedBy.toString() === req.user.id;

    if (!isApplicant && !isJobPoster) {
      return res.status(403).json({ error: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Server error' });
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

// Get job applications for the current user
app.get('/job-applications', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('Fetching applications for user:', req.user._id);

    const sentApplications = await JobApplication.find({ applicant: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });

    const postedJobs = await Job.find({ postedBy: req.user._id });
    const receivedApplications = await JobApplication.find({ job: { $in: postedJobs.map(job => job._id) } })
      .populate('job')
      .populate('applicant', 'displayName email')
      .sort({ createdAt: -1 });

    console.log('Sent applications:', JSON.stringify(sentApplications));
    console.log('Received applications:', JSON.stringify(receivedApplications));

    const response = { sent: sentApplications, received: receivedApplications };
    console.log('Sending response:', JSON.stringify(response));

    res.json(response);
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

app.get('/user-applications', requireLogin, async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user._id }).select('job');
    res.json(applications);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/document/:type/:filename', requireLogin, async (req, res) => {
  const { type, filename } = req.params;
  const key = `${type}/${filename}`;

  console.log('Attempting to generate signed URL for:', key);
  console.log('Full S3 path:', `${process.env.S3_BUCKET_NAME}/${key}`);

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    console.log('GetObjectCommand created with:', {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Signed URL generated successfully');

    res.json({ url });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate document URL', details: error.message, stack: error.stack });
  }
});

// Add this route after your other application-related routes

app.get('/applications/:id/cv-url', requireLogin, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the current user is either the applicant or the job poster
    const job = await Job.findById(application.job);
    const isApplicant = application.applicant.toString() === req.user._id.toString();
    const isJobPoster = job.postedBy.toString() === req.user._id.toString();

    if (!isApplicant && !isJobPoster) {
      return res.status(403).json({ error: 'You are not authorized to access this CV' });
    }

    if (!application.cv) {
      return res.status(404).json({ error: 'No CV found for this application' });
    }

    const key = `cv/${application.cv}`;

    console.log('Attempting to generate signed URL for:', key);
    console.log('Full S3 path:', `${process.env.S3_BUCKET_NAME}/${key}`);

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    console.log('GetObjectCommand created with:', {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Signed URL generated successfully');

    res.json({ url });
  } catch (error) {
    console.error('Error generating CV signed URL:', error);
    res.status(500).json({ error: 'Failed to generate CV URL', details: error.message, stack: error.stack });
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

app.get('/test-s3', async (req, res) => {
  try {
    const command = new ListBucketsCommand({});
    const { Buckets } = await s3Client.send(command);
    res.json({ message: 'S3 connection successful', buckets: Buckets.map(b => b.Name) });
  } catch (error) {
    console.error('S3 test error:', error);
    res.status(500).json({ error: 'S3 test failed', details: error.message, stack: error.stack });
  }
});

