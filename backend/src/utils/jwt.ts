import jwt from "jsonwebtoken";
const db = require("../db/connection")

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "FATAL ERROR: JWT_SECRET is not defined. Please set it in your environment variables."
  );
}

const SECRET: string = JWT_SECRET

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface TokenPayload {
  username: string;
  isAdmin: boolean;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};