// server.js (ESM)
import 'dotenv/config'; // loads .env in dev if present
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 5000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASS = process.env.ADMIN_PASS ?? 'admin';

// login route uses env values
app.post('/api/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    return res.json({ success: true, message: 'Login successful' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// show a simple message at the root so preview doesn't say "Cannot GET /"
app.get('/', (req, res) => {
  res.send('ERP backend is running. Use /api/login (POST) or /health.');
});

app.listen(PORT, () => console.log(`Server (ESM) running on port ${PORT}`));

