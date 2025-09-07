// routes/authRoutes.js
import express from 'express';
import { loginUser, registerUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js'; // you already have this file

const router = express.Router();

// Public: login
router.post('/login', loginUser);

// Optional: register (use once to create your test/admin user, then you may remove it)
// If you prefer not to expose register, skip adding this route and use Atlas manual insert.
router.post('/register', registerUser);

// Protected: get current user
router.get('/me', protect, getMe);

export default router;
