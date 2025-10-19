import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { deleteUser, updateUser } from "../models/users.model";
const { fetchUsers, fetchUserByUsername, insertUser } = require("../models/users.model");

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await fetchUsers();
    return res.status(200).json({ users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};
export const getUserByUsername = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const user = await fetchUserByUsername(username);
    return res.status(200).json({ user });
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.msg });
    }
    console.error("Error fetching user:", error);
    return res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
};

export const patchUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const { name, email } = req.body;

    if (req.user?.username !== username && !req.user?.isAdmin) {
      return res.status(403).json({
        message: "You can only update your own profile",
      });
    }

    const updates: { name?: string; email?: string } = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const updatedUser = await updateUser(username, updates);
    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    if (error.status === 400 || error.status === 404) {
      return res.status(error.status).json({ message: error.msg });
    }
    console.error("Error updating user:", error);
    return res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};

export const removeUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    if (req.user?.username !== username && !req.user?.isAdmin) {
      return res.status(403).json({
        message: "You can only delete your own account",
      });
    }

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    await deleteUser(username);
    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.msg });
    }
    console.error("Error deleting user:", error);
    return res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};
