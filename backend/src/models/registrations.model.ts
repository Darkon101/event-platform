const db = require("../db/connection");

export interface RegistrationRow {
  registration_id: number;
  event_id: number;
  username: string;
  registered_at: Date;
}

export const registerForEvent = async (eventId: number, username: string) => {
  const query = `
    INSERT INTO event_registrations (event_id, username)
    VALUES ($1, $2)
    RETURNING *
  `;

  try {
    const result = await db.query(query, [eventId, username]);
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw { status: 409, msg: 'User already registered for this event' };
    }
    if (error.code === '23503') {
      throw { status: 404, msg: 'Event or user not found' };
    }
    throw error;
  }
};

export const unregisterFromEvent = async (eventId: number, username: string) => {
  const query = `
    DELETE FROM event_registrations
    WHERE event_id = $1 AND username = $2
    RETURNING registration_id
  `;

  const result = await db.query(query, [eventId, username]);

  if (result.rows.length === 0) {
    throw { status: 404, msg: 'Registration not found' };
  }

  return result.rows[0];
};

export const getEventRegistrations = async (eventId: number) => {
  const query = `
    SELECT er.registration_id, er.event_id, u.username, u.name, u.email, er.registered_at
    FROM event_registrations er
    JOIN users u ON er.username = u.username
    WHERE er.event_id = $1
    ORDER BY er.registered_at ASC
  `;

  const result = await db.query(query, [eventId]);
  return result.rows;
};

export const getUserRegistrations = async (username: string) => {
  const query = `
    SELECT er.registration_id, e.event_id, e.title, e.location, e.date, 
           e.price, e.capacity, er.registered_at,
           (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.event_id) as registered_count
    FROM event_registrations er
    JOIN events e ON er.event_id = e.event_id
    WHERE er.username = $1
    ORDER BY e.date ASC
  `;

  const result = await db.query(query, [username]);
  return result.rows;
};

export const isUserRegistered = async (eventId: number, username: string): Promise<boolean> => {
  const query = `
    SELECT 1 FROM event_registrations
    WHERE event_id = $1 AND username = $2
  `;

  const result = await db.query(query, [eventId, username]);
  return result.rows.length > 0;
};

export const getRegistrationCount = async (eventId: number): Promise<number> => {
  const query = `
    SELECT COUNT(*) as count FROM event_registrations
    WHERE event_id = $1
  `;

  const result = await db.query(query, [eventId]);
  return parseInt(result.rows[0].count);
};