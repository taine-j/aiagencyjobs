import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  emails: { type: Array, required: true },
  photos: { type: Array, required: true },
});

const User = mongoose.model('User', userSchema);

export default User;