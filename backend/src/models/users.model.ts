const db = require('../db/connection')
import { hashPassword } from '../utils/hash';
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

export const updateUser = async (
  username: string, 
  updates: { name?: string; email?: string }
) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name) {
    fields.push(`name = $${paramIndex}`);
    values.push(updates.name);
    paramIndex++;
  }

  if (updates.email) {
    fields.push(`email = $${paramIndex}`);
    values.push(updates.email);
    paramIndex++;
  }

  if (fields.length === 0) {
    return Promise.reject({ status: 400, msg: 'No valid fields to update' });
  }

  values.push(username);

  const result = await db.query(
    `UPDATE users 
     SET ${fields.join(', ')} 
     WHERE username = $${paramIndex} 
     RETURNING username, name, email, "isAdmin", created_at`,
    values
  );

  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'User not found' });
  }

  return result.rows[0];
};

export const deleteUser = async (username: string) => {
  const result = await db.query(
    'DELETE FROM users WHERE username = $1 RETURNING username',
    [username]
  );

  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'User not found' });
  }

  return result.rows[0];
};