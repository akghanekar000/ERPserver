// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

// Helper to generate tokens
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" }); // short-lived
};
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" }); // long-lived
};

// In-memory refresh storage (for demo) — you can replace with MongoDB later
let refreshTokens = [];

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });
    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      refreshTokens.push(refreshToken);

      res.status(201).json({
        accessToken,
        refreshToken,
        user: { id: user._id, email: user.email, name: user.name },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      refreshTokens.push(refreshToken);

      res.json({
        accessToken,
        refreshToken,
        user: { id: user._id, email: user.email, name: user.name },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get logged-in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Refresh access token
export const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "No token provided" });
  if (!refreshTokens.includes(token))
    return res.status(403).json({ message: "Invalid refresh token" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });
    const accessToken = generateAccessToken(user.id);
    res.json({ accessToken });
  });
};

// Logout (invalidate refresh token)
export const logoutUser = (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.json({ message: "Logged out successfully" });
};
