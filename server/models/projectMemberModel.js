import mongoose from 'mongoose';

const projectMemberSchema = new mongoose.Schema({
    projectmemberid: { type: String, required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['member', 'admin', 'owner'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);
export default ProjectMember;