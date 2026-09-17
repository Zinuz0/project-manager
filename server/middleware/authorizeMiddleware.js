// create a middleware for every route that requires authentication, to check if the user is authenticated and has a valid JWT token. If the token is valid, the middleware should set req.user with the user's information (e.g., userId) so that it can be accessed in the route handlers. If the token is invalid or missing, the middleware should return a 401 Unauthorized response.
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const authorizeMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    req.user = { id: user._id, email: user.email }; // Set the user information in the request object
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};