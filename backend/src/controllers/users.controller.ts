import { Request, Response, NextFunction } from "express";
const { fetchUsers, fetchUserByUsername, insertUser } = require("../models/users.model");

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await fetchUsers();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};
export const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const user = await fetchUserByUsername(username);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

export const postUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, name, email, password, isAdmin } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const newUser = await insertUser({
      username,
      name,
      email,
      password,
      isAdmin: isAdmin || false,
    });
    res.status(201).json({ user: newUser });
  } catch (err) {
    next(err);
  }
};
