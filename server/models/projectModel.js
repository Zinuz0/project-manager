import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectid: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: { type: String, default: '' },
    status: { type: String, enum: ['to-do', 'in-progress', 'completed', 'archived'], default: 'to-do' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;

