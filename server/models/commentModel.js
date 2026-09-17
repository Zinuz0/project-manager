import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    commentId: { type: String, required: true, unique: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: [{ type: Array, default: [] }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }, 
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
