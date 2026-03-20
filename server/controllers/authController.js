/**
 * Authentication Controller - Register, Login, Profile
 */

const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const logger = require("../utils/logger");

// ─── Register ─────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide name, email, and password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    logger.info(`User logged in: ${email}`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        preferences: req.user.preferences,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Preferences ───────────────────────────────────────────────────
const updatePreferences = async (req, res, next) => {
  try {
    const { theme, fontSize } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { "preferences.theme": theme, "preferences.fontSize": fontSize },
      { new: true, runValidators: true }
    );

    res.json({ preferences: user.preferences });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updatePreferences };
