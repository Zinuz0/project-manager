import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import { io } from '../server.js';

// Create and broadcast a new notification
export const createNotification = async (req, res, next) => {
  try {
    const recipients = req.body.recipientId;
    const { senderId, type, message } = req.body;

    if (!recipients || !senderId || !type || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const recipientList = Array.isArray(recipients) ? recipients : [recipients];

    for (const id of recipientList) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: `Recipient with ID ${id} not found` });
      }
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: `Sender with ID ${senderId} not found` });
    }

    const newNotification = new Notification({
      recipient: recipientList,
      sender: senderId,
      type,
      message
    });

    await newNotification.save();

    recipientList.forEach(recipientId => {
      io.to(`user ${recipientId}`).emit('newNotification', newNotification);
    });

    res.status(201).json(newNotification);
  } catch (error) {
    next(error);
  }
};

// Get notifications for a specific user
export const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const createNotifications = createNotification;


