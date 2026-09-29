import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    notificationId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    recipient: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    type: { type: String, enum: ['task-assigned', 'task-updated', 'task-commented', 'project-invitation'], required: true },
    message: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

