import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

interface UserPayload {
  username: string;
  isAdmin: boolean;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.message === "Invalid or expired token") {
      return res.status(401).json({
        message: "Invalid or expired token. Please login again.",
      });
    }

    return res.status(401).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: "Forbidden: Admin access required to create events",
    });
  }
  next();
};
