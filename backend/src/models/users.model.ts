const db = require('../db/connection')
import { hashPassword } from '../db/utils/hash';
import type { User } from '../types';

export const fetchUsers = async () => {
    const result = await db.query(`SELECT username, name, email, "isAdmin" FROM users`)
    return result.rows
}

export const fetchUserByUsername = async (username: string) => {
  const result = await db.query(
    'SELECT username, name, email, "isAdmin", created_at FROM users WHERE username = $1',
    [username]
  );
  
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'User not found' });
  }
  
  return result.rows[0];
};

export const insertUser = async (userData: User) => {
  const { username, name, email, password, isAdmin } = userData;
  
  const hashedPassword = await hashPassword(password);
  
  const result = await db.query(
    `INSERT INTO users (username, name, email, password, "isAdmin") 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING username, name, email, "isAdmin", created_at`,
    [username, name, email, hashedPassword, isAdmin]
  );
  
  return result.rows[0];
};