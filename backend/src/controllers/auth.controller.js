import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

/**
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ identifier });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      role: user.role,
      forcePasswordChange: user.mustChangePassword
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

/**
 * POST /auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    await user.setPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Password change failed" });
  }
};

/**
 * POST /auth/create-user
 * Coordinator only
 */
export const createUser = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ identifier });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = new User({
      identifier,
      role
    });

    await user.setPassword(password);
    await user.save();

    return res.status(201).json({
      message: "User created successfully",
      user: {
        identifier: user.identifier,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "User creation failed" });
  }
};
