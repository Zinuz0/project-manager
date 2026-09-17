export const isAuthorized = async (userId, projectId, role) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  if (role === 'admin') {
    const admin = await User.findOne({ role: 'admin' });
    return userId === project.owner.toString() || userId === admin._id.toString();
  } else if (role === 'member') {
    return project.members.includes(userId);
  }

  throw new Error('Invalid role specified');
}; 