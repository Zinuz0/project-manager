import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import { io } from '../server.js'; // Import the io instance from your server setup

export const createNotification = async (req, res, next) => {
  try {
    const recipients = req.body.recipientId; 
    const { senderId, type, message } = req.body;
    if (!recipients || !senderId || !type || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    recipients.forEach(async (id) => {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: `Recipient with ID ${id} not found` });
      }
    });

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: `Sender with ID ${senderId} not found` });
    }

    // Create a new notification
    const newNotification = new Notification({
      recipient: recipients,
      sender: senderId,
      type,
      message
    });
   
    recipients.forEach(recipientId => {
      io.to(`user ${recipientId}`).emit('newNotification', newNotification);
    })
        
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    next(error);
  }
};


export const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch notifications for the user
    const notifications = await Notification.find({ recipient: userId }).populate('sender', 'name email');
    res.status(200).json(notifications);

  } catch (error) {
    next(error);
  }
};

export const createNotifications = createNotification;

