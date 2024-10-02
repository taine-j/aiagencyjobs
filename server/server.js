import express from 'express';
import path from 'path';
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


app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://aiagencyjobs.com', 'https://aiagencyjobs-66f14b2f7923.herokuapp.com']
    : ['http://localhost:3000', 'http://localhost:1967'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add this line after your CORS configuration
app.set('trust proxy', 1);

// Configure authentication
configureAuth(app);

// Configure AWS
const s3Client = new S3Client({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
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

  app.post('/jobs', requireLogin, async (req, res) => {
    try {
      const jobData = req.body;
      jobData.postedBy = req.user._id; // Assuming you want to associate the job with the current user
  
      const newJob = new Job(jobData);
      await newJob.save();
  
      res.status(201).json(newJob);
    } catch (error) {
      console.error('Error adding new job:', error);
      res.status(500).json({ error: 'Unable to add job', details: error.message });
    }
  });

// Route to get a job by ID
app.get('/jobs/:id', async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await Job.findById(jobId).populate('postedBy', '_id email googleId');
    if (!job) {
      return res.status(404).json({ error: `Job with id ${jobId} not found` });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Unable to fetch job', details: error.message });
  }
});

// Route to delete a job by ID
app.delete('/jobs/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const jobId = req.params.id;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: `Job with id ${jobId} not found` });
    }

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
app.put('/jobs/:id', requireLogin, async (req, res) => {
  const jobId = req.params.id;
  const updatedJob = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: `Job with id ${jobId} not found` });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to update this job' });
    }

    Object.assign(job, updatedJob);
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Unable to update job', details: error.message });
  }
});


// Update your /job-applications route to use upload middleware directly
app.post('/job-applications', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'supportingDocs', maxCount: 1 }
]), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { job, message, skills, projectLinks, phone, email } = req.body;

    if (!job || !skills || !email) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Job, skills, and email are required fields' });
    }

    let cvPath = null;
    let supportingDocsPath = null;

    if (req.files['cv']) {
      const cvFile = req.files['cv'][0];
      cvPath = cvFile.key || `${Date.now().toString()}-${cvFile.originalname}`;

      if (!cvFile.location) {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: cvPath,
          Body: cvFile.buffer,
          ContentType: cvFile.mimetype,
          ACL: 'private'
        };
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);
      }
    }

    if (req.files['supportingDocs']) {
      const supportingDocsFile = req.files['supportingDocs'][0];
      console.log('Supporting docs file:', JSON.stringify(supportingDocsFile, null, 2));
      
      // Store only the object key
      supportingDocsPath = `${Date.now().toString()}-${supportingDocsFile.originalname}`;
      
      // Manual upload to S3 if multer-s3 failed
      if (!supportingDocsFile.location) {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: supportingDocsPath,
          Body: supportingDocsFile.buffer,
          ContentType: supportingDocsFile.mimetype,
          ACL: 'private'
        };
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);
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
      phone,
      email,
    });

    await newApplication.save();

    // Add the job to the user's appliedJobs array
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { appliedJobs: job } });

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
app.get('/job-applications', requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Current user ID:', userId);

    const sentApplications = await JobApplication.find({ applicant: userId })
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    console.log('Sent applications query:', { applicant: userId });
    console.log('Sent applications:', sentApplications);

    // First, find all jobs posted by the user
    const userJobs = await Job.find({ postedBy: userId }).select('_id');
    const userJobIds = userJobs.map(job => job._id);

    console.log('User job IDs:', userJobIds);

    // Then, find applications for these jobs
    const receivedApplications = await JobApplication.find({
      job: { $in: userJobIds },
      $or: [
        { deletedByEmployer: false },
        { deletedByEmployer: { $exists: false } }
      ]
    })
      .populate('job', 'title')
      .populate('applicant', 'displayName')
      .sort({ createdAt: -1 });

    console.log('Received applications query:', { job: { $in: userJobIds } });
    console.log('Received applications before filter:', receivedApplications);

    res.json({
      sent: sentApplications,
      received: receivedApplications
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ error: 'Server error' });
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

// Get total count of pending applications for a user
app.get('/pending-applications-count', requireLogin, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all job IDs posted by the user
    const userPostedJobs = await Job.find({ postedBy: userId }).select('_id');
    const userPostedJobIds = userPostedJobs.map(job => job._id);

    console.log('User posted job IDs:', userPostedJobIds);
    
    // Count pending applications for each job posted by the user
    const pendingCounts = await JobApplication.aggregate([
      {
        $match: {
          job: { $in: userPostedJobIds },
          status: 'Pending'
        }
      },
      {
        $group: {
          _id: '$job',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate total pending count
    const pendingCount = pendingCounts.reduce((total, job) => total + job.count, 0);

    res.json({ count: pendingCount });
  } catch (error) {
    console.error('Error fetching pending applications count:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update the existing route or add a new one for both CV and supporting docs
app.get('/applications/:id/:docType-url', requireLogin, async (req, res) => {
  try {
    const { id, docType } = req.params;
    console.log(`Fetching ${docType} URL for application:`, id);
    const application = await JobApplication.findById(id);
    
    if (!application) {
      console.log('Application not found');
      return res.status(404).json({ error: 'Application not found' });
    }

    console.log('Application found:', application);

    const docPath = docType === 'cv' ? application.cvPath : application.supportingDocsPath;

    if (!docPath) {
      console.log(`No ${docType} path found`);
      return res.status(404).json({ error: `No ${docType} found for this application` });
    }

    console.log(`${docType} path (object key):`, docPath);
    
    // Use the docPath directly as the S3 key
    const s3Key = docPath;
    
    console.log('S3 Key:', s3Key);

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    });

    console.log('GetObjectCommand created');

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    console.log('Signed URL generated:', url);

    if (!url) {
      console.error('Failed to generate signed URL');
      return res.status(500).json({ error: 'Failed to generate signed URL' });
    }

    res.json({ url });
  } catch (error) {
    console.error(`Error generating ${req.params.docType} signed URL:`, error);
    res.status(500).json({ error: `Failed to generate ${req.params.docType} URL`, details: error.message });
  }
});

// Add this near your other application routes
app.post('/applications/:id/status', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Updating application status:', { id, status }); // Debugging log

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await JobApplication.findById(id)
      .populate('job', 'postedBy');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    console.log('Application found:', application); // Debugging log
    console.log('Job posted by:', application.job.postedBy); // Debugging log

    // Check if the current user is the job poster
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.json({ message: 'Application status updated successfully', application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Withdraw application (for applicants)
app.post('/applications/:id/withdraw', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to withdraw application ${id}`);

    const application = await JobApplication.findById(id);

    if (!application) {
      console.log(`Application ${id} not found`);
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the current user is the applicant
    if (application.applicant.toString() !== req.user._id.toString()) {
      console.log(`User ${req.user._id} not authorized to withdraw application ${id}`);
      return res.status(403).json({ error: 'Not authorized to withdraw this application' });
    }

    // Delete the application entirely
    await JobApplication.findByIdAndDelete(id);

    console.log(`Application ${id} withdrawn successfully`);
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete application (for employers)
app.post('/applications/:id/delete', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findById(id).populate('job', 'postedBy');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the current user is the job poster and the application is rejected
    if (application.job.postedBy.toString() !== req.user._id.toString() || application.status !== 'Rejected') {
      return res.status(403).json({ error: 'Not authorized to delete this application' });
    }

    application.deletedByEmployer = true;
    await application.save();

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Server error' });
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


