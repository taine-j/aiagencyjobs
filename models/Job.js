import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: String,
  type: String,
  location: String,
  description: String,
  price: String,
  company: {
    name: String,
    description: String,
    contactEmail: String,
    contactPhone: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('Job', jobSchema);

export default Job;