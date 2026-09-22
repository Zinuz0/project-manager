import express from 'express';
//import all functions from authController.js
import { registerUser, loginUser, updateUserProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile/:userId', authMiddleware, updateUserProfile);

export default router;