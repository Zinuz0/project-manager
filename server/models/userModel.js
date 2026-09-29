import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userid: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    username: { type: String },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;

