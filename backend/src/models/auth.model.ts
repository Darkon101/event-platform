const db = require("../db/connection");
import type { User } from "../types";
import { hashPassword } from "../utils/hash";

export interface UserRow {
  username: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  created_at: Date;
}

export const fetchUserByUsernameWithPassword = async (
  username: string
): Promise<UserRow | null> => {
  const result = await db.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
};


export const fetchUserByEmail = async (email: string): Promise<UserRow | null> => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
};
export const createUser = async (userData: {
  username: string;
  name: string;
  email: string;
  password: string;
}) => {
  const { username, name, email, password } = userData;
  
  const hashedPassword = await hashPassword(password);
  
  const result = await db.query(
    `INSERT INTO users (username, name, email, password, "isAdmin") 
     VALUES ($1, $2, $3, $4, false) 
     RETURNING username, name, email, "isAdmin", created_at`,
    [username, name, email, hashedPassword]
  );
  
  return result.rows[0];
};

export const getAllUsers = async (): Promise<Omit<UserRow, 'password'>[]> => {
  const query = `SELECT username, name, email, "isAdmin", created_at FROM users ORDER BY created_at DESC`;
  const result = await db.query(query);
  return result.rows;
};