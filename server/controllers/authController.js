import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}; 
const generateToken = (userId) => {
  if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if(!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user already 
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword, 
    });

    const token = generateToken(newUser._id);
    res.cookie('token', token, cookieOptions); 
    /*what this line does is it sets a cookie named 'token' in the response with the generated JWT token. The cookie options specify that the cookie is HTTP-only (not accessible via JavaScript), secure (only sent over HTTPS in production), has a strict same-site policy, and expires after 7 days. This allows the client to store the token securely for subsequent authenticated requests. previously, the token was only sent in the response body, but now it is also stored in a cookie for easier access on the client side. what happens after its sent in the response body is that the client can store it (e.g., in localStorage or sessionStorage) and include it in the Authorization header for future requests. However, storing it in a cookie allows the browser to automatically send it with each request to the server, simplifying authentication management on the client side. example of auth header usage: The client can include the token in the Authorization header of subsequent requests like this: `Authorization: Bearer <token>`. This allows the server to verify the token and authenticate the user for protected routes. authorization header is a standard HTTP header used to pass authentication credentials from the client to the server. In the context of JWT (JSON Web Tokens), it is commonly used to send the token that proves the user's identity. The format of the Authorization header for JWT is typically: `Authorization: Bearer <token>`. Here, "Bearer" indicates that the client is using a bearer token for authentication, and `<token>` is the actual JWT string. When the server receives a request with this header, it can extract the token, verify its validity, and authenticate the user accordingly.
    */
    

    await newUser.save();
    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      userId: newUser._id,
     });

  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions); // Set the token in a cookie

    res.status(200).json({ token, userId: user._id, username: user.username, message: 'Login successful' });

  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logout successful' });
};

export const getUserProfile = async (req, res, next) => { 
  try {
    const userId = req.user.id; // Assuming you have middleware that sets req.user based on the JWT token

    const user = await User.findById(userId).select('-password'); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export const updateUserProfile = async (req, res, next) => {
  try{
    const userId = req.user.id; 

    const validUser = await User.findById(userId);
    if (!validUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { name, email, password, avatar, bio } = req.body;

    if(email && email !== validUser.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      validUser.email = email;
    }
    
    if(password) {
      // compare with existing password
      const isMatch = await bcrypt.compare(password, validUser.password);
      if (isMatch) {
        return res.status(400).json({ message: 'New password cannot be the same as the old password' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      validUser.password = hashedPassword;
    }
    if(name) validUser.name = name;
    if(avatar) validUser.avatar = avatar;
    if(bio) validUser.bio = bio;
    
    await validUser.save();
    res.status(200).json({ message: 'Profile updated successfully', user: validUser });
  }
  catch(error){
    next(error);
  }
}