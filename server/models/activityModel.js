import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    activityId: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ['task', 'comment', 'project'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
