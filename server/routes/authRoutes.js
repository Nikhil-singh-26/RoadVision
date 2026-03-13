import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, logoutUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  loginUser
);

router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);

export default router;
