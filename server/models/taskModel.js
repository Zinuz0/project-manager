import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    taskid: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;

