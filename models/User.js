import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  emails: Array,
  photos: Array,
  companyName: String,
  location: String,
  companyDescription: String,
  techStack: String,
  profilePicture: String,
  useCompanyName: Boolean
});

const User = mongoose.model('User', userSchema);

export default User;