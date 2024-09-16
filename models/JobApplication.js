import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  projectLinks: String,
  cvPath: String,
  supportingDocsPath: String,
  phone: String,
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  deletedByEmployer: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;