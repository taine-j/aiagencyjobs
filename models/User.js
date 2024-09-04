import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String
  },
  displayName: String,
  emails: Array,
  companyName: String,
  location: String,
  companyDescription: String,
  techStack: String,
  profilePicture: String,
  useCompanyName: Boolean
});

const User = mongoose.model('User', userSchema);

export default User;