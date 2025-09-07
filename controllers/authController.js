// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '30d';

function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// POST /api/auth/register
// Optional: creates a user (use once via Hoppscotch then disable/remove if desired)
export async function registerUser(req, res) {
  try {
    console.log('REGISTER attempt', { headers: req.headers });
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email: normalizedEmail, password: hashed, name: name || 'User' });

    return res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name
    });
  } catch (err) {
    console.error('registerUser error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/login
export async function loginUser(req, res) {
  try {
    console.log('--- LOGIN ATTEMPT ---', new Date().toISOString());
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    console.log('DB user found?:', !!user, 'email:', normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result:', match);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    return res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('loginUser error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/auth/me
// If your auth middleware sets req.user, this returns that user. Otherwise verify token here.
export async function getMe(req, res) {
  try {
    // If a protect middleware has already set req.user (object or id), use it
    if (req.user) {
      // if req.user is an ID string, fetch the user; if it's a user object, return it
      if (typeof req.user === 'string' || req.user._id) {
        const id = typeof req.user === 'string' ? req.user : req.user._id;
        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({ user });
      }
      // if req.user already contains full user object
      return res.json({ user: req.user });
    }

    // Fallback: verify token from Authorization header
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = auth.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('getMe error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
