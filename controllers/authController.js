import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || "staff" });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (e) { next(e); }
}
