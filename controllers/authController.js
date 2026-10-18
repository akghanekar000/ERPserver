
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const generateAccessToken = (id, role) => {
  return jwt.sign(
    { id: String(id), role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    { id: String(id) },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
};

// Refresh tokens are stored in memory.
// They are cleared whenever the server restarts.
let refreshTokens = [];

// Register a new user.
// New users remain staff unless an administrator
// assigns a different role securely.
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(
      user._id,
      user.role
    );

    const refreshToken = generateRefreshToken(user._id);
    refreshTokens.push(refreshToken);

    return res.status(201).json({
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Log in an existing user.
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(
      user._id,
      user.role
    );

    const refreshToken = generateRefreshToken(user._id);
    refreshTokens.push(refreshToken);

    return res.json({
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Return the current user's database record.
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Refresh an access token using the user's current database role.
export const refreshToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  if (!refreshTokens.includes(token)) {
    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }

  jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: "Invalid refresh token",
        });
      }

      try {
        const user = await User.findById(decoded.id);

        if (!user) {
          refreshTokens = refreshTokens.filter(
            (savedToken) => savedToken !== token
          );

          return res.status(401).json({
            message: "User not found",
          });
        }

        const accessToken = generateAccessToken(
          user._id,
          user.role
        );

        return res.json({
          token: accessToken,
          accessToken,
        });
      } catch (error) {
        return res.status(500).json({
          message: error.message,
        });
      }
    }
  );
};

// Log out by removing the refresh token.
export const logoutUser = (req, res) => {
  const { token } = req.body;

  refreshTokens = refreshTokens.filter(
    (savedToken) => savedToken !== token
  );

  return res.json({
    message: "Logged out successfully",
  });
};

