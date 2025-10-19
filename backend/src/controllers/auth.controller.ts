import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import {
  fetchUserByUsernameWithPassword,
  fetchUserByEmail,
  createUser,
} from "../models/auth.model";
import { fetchUserByUsername } from "../models/users.model";

import type { AuthRequest } from "../middleware/auth";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required: username, name, email, password",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message:
          "Username must be 3-50 characters and contain only letters, numbers, and underscores",
      });
    }

    try {
      await fetchUserByUsername(username);
      return res.status(409).json({ message: "Username already taken" });
    } catch (err: any) {
      if (err.status !== 404) throw err;
    }

    const existingEmail = await fetchUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const newUser = await createUser({
      username,
      name,
      email,
      password
    });

    const token = generateToken({
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
      token,
    });
  } catch (error: any) {
    console.error("Error in register:", error);
    return res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await fetchUserByUsernameWithPassword(username);
    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = generateToken({
      username: user.username,
      isAdmin: user.isAdmin,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error: any) {
    console.error("Error in login:", error);
    return res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await fetchUserByUsername(req.user.username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error("Error in getMe:", error);
    return res.status(500).json({
      message: "Error fetching user data",
      error: error.message,
    });
  }
};
