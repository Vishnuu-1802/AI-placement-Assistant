import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || "dev-secret-change-me", {
    expiresIn: "7d",
  });

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profile: user.profile || {},
  createdAt: user.createdAt,
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      profile: {},
    });

    const token = createToken(user._id.toString());
    return res.status(201).json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ error: error.message || "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user._id.toString());
    return res.json({ token, user: toPublicUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ error: error.message || "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({ error: error.message || "Failed to fetch profile" });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const allowedProfileFields = [
      "headline",
      "bio",
      "location",
      "experienceLevel",
      "targetRole",
      "github",
      "linkedin",
      "skills",
    ];

    const updates = {};
    if (typeof req.body.name === "string") {
      updates.name = req.body.name.trim();
    }

    updates.profile = {};
    for (const key of allowedProfileFields) {
      if (req.body[key] !== undefined) {
        updates.profile[key] = key === "skills" ? req.body[key] : String(req.body[key]);
      }
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (updates.name) {
      user.name = updates.name;
    }

    user.profile = {
      ...(user.profile?.toObject ? user.profile.toObject() : user.profile),
      ...updates.profile,
      skills: Array.isArray(updates.profile.skills)
        ? updates.profile.skills.map((s) => String(s).trim()).filter(Boolean)
        : user.profile?.skills || [],
    };

    await user.save();
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});

export default router;
