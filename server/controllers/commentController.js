import Comment from '../models/commentModel.js';
import User from '../models/userModel.js';

export const createComment = async (req, res, next) => {
  try {
    const { content, authorId, taskId } = req.body;

    // Validate required fields
    if (!content || !authorId || !taskId) {
      return res.status(400).json({ message: 'Content, authorId, and taskId are required' });
    }

    // Validate author existence
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Create a new comment
    const newComment = new Comment({
      content,
      author: authorId,
      task: taskId
    });

    await newComment.save();
    res.status(201).json(newComment);

  } catch (error) {
    next(error);
  }
};

export const getAllCommentsForTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // Validate taskId
    if (!taskId) {
      return res.status(400).json({ message: 'taskId is required' });
    }

    // Fetch comments for the given taskId
    const comments = await Comment.find({ task: taskId }).populate('author', 'username name email avatar');
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const getComments = getAllCommentsForTask;

