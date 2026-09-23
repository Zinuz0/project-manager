import User from '../models/userModel.js';
import Project from '../models/projectModel.js';
import { io } from '../server.js'; 
import ProjectMember from '../models/projectMemberModel.js';

export const createProject = async (req, res, next) => {
  try {
    const { userId } = req.user; 
    const { name, description, coverImage, adminId} = req.body; 

    if(!name || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' }); 
    }
    
    if(Project.findOne({ name })) {
      return res.status(400).json({ message: 'Project name already exists' });
    }

    if(coverImage && !isValidUrl(coverImage)) {
      return res.status(400).json({ message: 'Invalid cover image URL' });
    }
    
    const owner = await User.findById(userId);
    if (!owner) {
      return res.status(404).json({ message: 'User/Owner not found' });
    }

    const newProject = new Project({
      name,
      description,
      owner: userId,
      coverImage: coverImage || null,
      admin: adminId || [],
    });

    await newProject.save();
    await User.findByIdAndUpdate(userId, { $addToSet: { projects: newProject._id } }, { new: true });

    for (const id of adminId) {
      const adminUser = await User.findById(id);
      if (!adminUser) {
        return res.status(404).json({ message: `Admin with ID ${id} not found` });
      }
      await User.findByIdAndUpdate(id, { $addToSet: { projects: newProject._id } }, { new: true }); 
      io.to(`user ${id}`).emit('adminAdded', { message: 'You have been added as an admin to the project' });
    }

    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
};  // done

export const getAllProjects = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const projects = await Project.find({ members: userId }).populate('owner', 'username email').populate('members', 'username email');
    res.status(200).json(projects);
  } 
  catch (error) {
    next(error);
  }
}; // how should the axios api for this function look like? The axios API call for this function would look like this:
// export const getAllProjects = async (userId) => {
//     try {
//         const response = await axios.get(`${API_URL}/projects`, { user: { userId } }, { withCredentials: true });
//         return response.data;
//     } catch (error) {
//         throw error.response.data;
//     }
// };
// why are we sending the userId in the request body? The userId is sent in the request body to identify which user's projects we want to retrieve. In this case, the server uses the userId to find all projects that the user is a member of. However, since we are using authentication middleware that sets req.user based on the JWT token, we don't actually need to send the userId in the request body. The server can extract the userId directly from req.user, making it unnecessary to include it in the request body. hence we can also rewrite the api call like this:
// export const getAllProjects = async () => {
//     try {
//         const response = await axios.get(`${API_URL}/projects`, { withCredentials: true });
//         return response.data;
//     } catch (error) {
//         throw error.response.data;
//     }
// };



export const editProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { name, description, coverImage } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== userId || !project.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to edit this project' });
    }

    if(!name && !description && !coverImage) {
      return res.status(400).json({ message: 'At least one field (name, description, coverImage) is required to update' });
    }

    if(coverImage && !isValidUrl(coverImage)) {
      return res.status(400).json({ message: 'Invalid cover image URL' });
    }

    const newProject = await Project.findById(projectId);
    if (!newProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update project fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (coverImage) project.coverImage = coverImage;

    await project.save();
    for (const id of project.members) {
      io.to(`user ${id}`).emit('projectUpdated', { projectId, message: 'Project has been updated' });
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
}; // done

export const deleteProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { members } = req.body;
    // how do i make the axios api for this function? you can make the axios API call for this function like this:
    // const response = await axios.delete(`${API_URL}/projects/${projectId}`, { data: { members } }, { withCredentials: true });
    // return response.data;
    // how to give th req.user in the axios api? you can include the user information in the request headers or as part of the request body. For example, you can send the user ID in the request headers like this:
    // return response.data;  
    // for the body of any request you must always send the data in the data field of the axios request. The data field is used to send the request body in axios. In this case, you are sending the members array in the request body, so you need to include it in the data field of the axios request.

    if(!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const newProject = await Project.findById(projectId);
    if (!newProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if(userId !== newProject.owner.toString() && !newProject.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to delete this project' });
    }

    newProject.members = [];
    await newProject.save();

    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    for (const memberId of members) {
      // remove the project from the member's projects array
      await User.findByIdAndUpdate(memberId, { $pull: { projects: projectId } });
      // remove all tasks associated with the project from the member's tasks array
      await User.findByIdAndUpdate(memberId, { $pull: { tasks: { project: projectId } } });
    }

    for(const id in project.admin){
      await User.findByIdAndUpdate(id, { $pull: { admin: projectId } });
    }

    io.to(`project ${projectId}`).emit('projectDeleted', { projectId, message: 'Project has been deleted' });
    
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
}; // done

export const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if(!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId).populate('owner', 'username email').populate('members', 'username email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
}; // done

export const addMembersToProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { memberId } = req.body; 

    if (!projectId || !memberId) {
      return res.status(400).json({ message: 'Project ID and Member ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if(userId !== project.owner.toString() && !project.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to add members to this project' });
    }

    for (const id in memberId) {
      const member = await User.findById(id);
      if (!member || project.members.includes(id)) {
        memberId.splice(id, 1);
        res.status(404).json({ message: `Member with ID ${id} not found or is already a member of the project` });
      }
    }

    await User.updateMany({ _id: { $in: memberId } }, { $addToSet: { projects: projectId } }, { new: true }); 
    project.members.push(...memberId);
    io.to(`project ${projectId}`).emit('memberAdded', { memberId, message: 'Members have been added to the project' }); 

    await project.save();
    res.status(200).json({ message: 'Member added to project successfully', project });
  } catch (error) {
    next(error);
  }
}; //done

export const removeMemberFromProject = async (req, res, next) => {
  try {
    const { userId } = req.user; // Assuming you have user authentication middleware that sets req.user
    const { projectId } = req.params;
    const { memberId } = req.body;

    if (!projectId || memberId.length === 0) {
      return res.status(400).json({ message: 'Project ID and Member IDs are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if(userId !== project.owner.toString() || !project.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to remove members from this project' }); 
    }

    for (const id of memberId) {
      const member = await User.findById(id);
      if (!project.members.includes(id) || !member ) {
        memberId = memberId.filter(id => project.members.includes(id) && member); 
        return res.status(400).json({ message: `Member with ID ${id} is not part of the project or does not exist idk nigga ` });
      }
      else{
        // remove the project name from the user's project array
        await User.findByIdAndUpdate(id, { $pull: { projects: projectId } });
        // remove all the tasks for that particular project for that particular user 
        await Task.deleteMany({ projectId, userId: id });
        // notify the member 
        io.to(`user ${id}`).emit('memberRemoved', { message: 'You have been removed from the project' }); 
      }
    }
    {
    // this is the socket event that will be emitted to the removed member when they are removed from the project. The event name is 'memberRemoved' and the data sent with the event includes a message indicating that the member has been removed from the project. how to only emit to the removed member? You can create a room for each member using their user ID. When a member is removed from the project, you can emit the 'memberRemoved' event to that specific member's room. This way, only the removed member will receive the notification. For example, you can use `io.to(`user ${memberId}`).emit('memberRemoved', { message: 'You have been removed from the project' });` to notify the removed member. where do you create the room for each member? You can create a room for each member when they join the project. When a user connects to the socket, you can have them join a room named after their user ID. For example, in your socket connection handler, you can do something like this:
    }
    await project.save();
    res.status(200).json({ message: 'Member removed from project successfully', project });
  } catch (error) {
    next(error);
  }
};

export const addAdminToProject = async (req, res, next) => {
  try {
    const { userId } = req.user; // Assuming you have user authentication middleware that sets req.user
    const { projectId } = req.params;
    const { adminId } = req.body;

    if (!projectId || !adminId) {
      return res.status(400).json({ message: 'Project ID and Admin ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if(userId !== project.owner.toString() || !project.admin.includes(userId)) { 
      return res.status(403).json({ message: 'You are not authorized to add admins to this project' });
    }

    for (const id of adminId) {
      const admin = await User.findById(id);
      if (!admin || project.admin.includes(id)) {
        return res.status(400).json({ message: `Admin with ID ${id} is not part of the project or does not exist` });
      }
      else {
        project.admin.push(id);
        await User.findByIdAndUpdate(id, { $addToSet: { projects: projectId } }, { new: true });
        io.to(`user ${id}`).emit('adminAdded', { message: 'You have been added as an admin to the project' }); 
      }
    }
    await project.save();

    res.status(200).json({ message: 'Admin added to project successfully', project });
  }
  catch (error) {
    next(error);
   }
};

export const removeAdminFromProject = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;
    const { adminId } = req.body;


    if (!projectId || !adminId) {
      return res.status(400).json({ message: 'Project ID and Admin ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if(userId !== project.owner.toString() && !project.admin.includes(userId)) {
      return res.status(403).json({ message: 'You are not authorized to remove admins from this project' });
    }

    for (const id of adminId) {
      if(adminId.length === 1 || project.admin.length === 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin from the project' });
      }
      const admin = await User.findById(id);
      if (!project.admin.includes(id) || !admin) {
        return res.status(400).json({ message: `Admin with ID ${id} is not part of the project or does not exist` });
      }
      else {
        project.admin = project.admin.filter(id => id.toString() !== adminId);
        io.to(`user ${id}`).emit('adminRemoved', { message: 'You have been removed as an admin from the project' });
      }
    };
    // we must handle the case where the owner/admin is trying to remove themselves which is not allowed
    // also if there is just one admin for a task and that admin is trying to remove themselves, then we must not allow until there is another
    // then what happens if there are many admins for a task? and one of them leaves or is removed? will it have any effect 

    await project.save();

    res.status(200).json({ message: 'Admin(s) removed from project successfully', project });
  } catch (error) {
    next(error);
  }
};

export const transferProjectOwnership = async (req, res, next) => {
  try {
    const { userId } = req.user; // Assuming you have user authentication middleware that sets req.user
    const { projectId } = req.params;
    const { newOwnerId } = req.body;

    if (!projectId || !newOwnerId) {
      return res.status(400).json({ message: 'Project ID and New Owner ID are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if(userId !== project.owner.toString()) {
      return res.status(403).json({ message: 'You are not authorized to transfer ownership of this project' });
    }

    // idgafNiGGA62830”{}
    
    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
      return res.status(404).json({ message: 'New owner not found' });
    }

    project.owner = newOwnerId;
    await project.save();
    res.status(200).json({ message: 'Project ownership transferred successfully', project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = getAllProjects;
export const addMemberToProject = addMembersToProject;

