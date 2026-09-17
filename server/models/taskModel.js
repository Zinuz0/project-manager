import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    taskid: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }, // is this an array of users or a single user? If it's multiple users, change it to an array of ObjectIds with default: []. 
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
