const db = require("../db/connection");
import type { Event } from "../types";

export interface EventRow {
  event_id: number;
  title: string;
  description: string;
  location: string;
  date: Date;
  capacity: number;
  price: number;
  created_by: string;
  external_id: string | null;
  image_url: string | null;
  url: string | null;
  created_at: Date;
}

export const fetchEvents = async (filters?: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
}) => {
  let query = `
    SELECT e.*, u.name as creator_name,
    (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.event_id) as registered_count
    FROM events e
    LEFT JOIN users u ON e.created_by = u.username
    WHERE 1=1
    `;
  const values: any[] = [];
  let paramIndex = 1;

  if (filters?.search) {
    query += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`;
    values.push(`%${filters.search}%`);
    paramIndex++;
  }
  if (filters?.minPrice !== undefined) {
    query += ` AND e.price >= $${paramIndex}`;
    values.push(filters.minPrice);
    paramIndex++;
  }

  if (filters?.maxPrice !== undefined) {
    query += ` AND e.price <= $${paramIndex}`;
    values.push(filters.maxPrice);
    paramIndex++;
  }

  if (filters?.startDate) {
    query += ` AND e.date >= $${paramIndex}`;
    values.push(filters.startDate);
    paramIndex++;
  }

  if (filters?.endDate) {
    query += ` AND e.date <= $${paramIndex}`;
    values.push(filters.endDate);
    paramIndex++;
  }

  query += ` ORDER BY e.date ASC`;

  const result = await db.query(query, values);
  return result.rows.map((row: any) => ({
    ...row,
    registered_count: parseInt(row.registered_count),
  }));
};

export const fetchEventById = async (eventId: number) => {
  const query = `
    SELECT e.*, u.name as creator_name,
    (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.event_id) as registered_count
    FROM events e
    LEFT JOIN users u ON e.created_by = u.username
    WHERE e.event_id = $1
  `;

  const result = await db.query(query, [eventId]);

  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Event not found" });
  }

  const event = result.rows[0];
  event.registered_count = parseInt(event.registered_count);

  return event;
};

export const insertEvent = async (eventData: {
  title: string;
  description: string;
  location: string;
  date: Date;
  capacity: number;
  price: number;
  created_by: string;
  external_id?: string | null;
  image_url?: string | null;
  url?: string | null;
}) => {
  const query = `
    INSERT INTO events (title, description, location, date, capacity, price, created_by, external_id, image_url, url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    eventData.title,
    eventData.description,
    eventData.location,
    eventData.date,
    eventData.capacity,
    eventData.price,
    eventData.created_by,
    eventData.external_id || null,
    eventData.image_url || null,
    eventData.url || null,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};
export const updateEvent = async (
  eventId: number,
  updates: Partial<{
    title: string;
    description: string;
    location: string;
    date: Date;
    capacity: number;
    price: number;
    image_url: string | null;
    url: string | null;
  }>
) => {
  const allowedFields = [
    "title",
    "description",
    "location",
    "date",
    "capacity",
    "price",
    "image_url",
    "url",
  ];
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(updates[key as keyof typeof updates]);
      paramIndex++;
    }
  });

  if (fields.length === 0) {
    return Promise.reject({ status: 400, msg: "No valid fields to update" });
  }

  values.push(eventId);

  const query = `
    UPDATE events
    SET ${fields.join(", ")}
    WHERE event_id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, values);

  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Event not found" });
  }

  return result.rows[0];
};
export const deleteEvent = async (eventId: number) => {
  const result = await db.query(
    "DELETE FROM events WHERE event_id = $1 RETURNING event_id, title",
    [eventId]
  );

  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Event not found" });
  }

  return result.rows[0];
};
export const fetchEventsByCreator = async (username: string) => {
  const query = `
    SELECT e.*,
    (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.event_id) as registered_count
    FROM events e
    WHERE e.created_by = $1
    ORDER BY e.date ASC
  `;

  const result = await db.query(query, [username]);
  return result.rows.map((row: any) => ({
    ...row,
    registered_count: parseInt(row.registered_count),
  }));
};
