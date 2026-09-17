import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

    // export const protect = async (req, res, next) => {
    //   let token;

    //   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     try {
    //       token = req.headers.authorization.split(' ')[1];
    //       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    //       req.user = await User.findById(decoded.id).select('-password');
    //       return next();
    //     } catch (error) {
    //       res.status(401);
    //       return next(new Error('Not authorized, token failed'));
    //     }
    //   }

    //   if (!token) {
    //     res.status(401);
    //     return next(new Error('Not authorized, no token'));
    //   }
    // };

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { userId: decoded.id }; // Attach user ID to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};




// is this the only function required for authentication? or do we need to add more functions for authorization? i think we need to add more functions for authorization. for example, we need to check if the user is an admin or a member of the project before allowing them to perform certain actions. we can create a function called isAdmin or isMember that checks if the user is an admin or a member of the project. we can then use this function in our controllers to check if the user is authorized to perform certain actions. however we are doing that in every controller. so we can create a function called isAuthorized that takes in the userId, projectId, and role (admin or member) and checks if the user is authorized to perform the action. we can then use this function in our controllers to check if the user is authorized to perform certain actions. but we are