import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    notificationId: { type: String, required: true, unique: true },
    recipient: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true }, // make this an array of user IDs if you want to send the same notification to multiple users
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    type: { type: String, enum: ['task-assigned', 'task-updated', 'task-commented', 'project-invitation'], required: true },
    message: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
