// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory credentials
const USER = {
  email: 'admin@example.com',
  password: 'admin',
};

// Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === USER.email && password === USER.password) {
    return res.json({ success: true, message: 'Login successful' });
  } else {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid credentials' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
