const db = require("../connection");
const { format } = require("@scaleleap/pg-format");
const { hashPassword } = require("../../utils/hash");

import type { User } from "../../types";
import type { Event } from "../../types";

const seed = async ({
  userData,
  eventData,
}: {
  userData: User[];
  eventData: Event[];
}) => {
  try {
    await db.query(`DROP TABLE IF EXISTS event_registrations;`);
    await db.query(`DROP TABLE IF EXISTS events;`);
    await db.query(`DROP TABLE IF EXISTS users;`);

    await db.query(`
        CREATE TABLE users (
            username VARCHAR(200) PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            "isAdmin" BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const hashedUsers = await Promise.all(
      userData.map(async (u: User) => ({
        ...u,
        password: await hashPassword(u.password),
      }))
    );

    const insertUserString = format(
      `INSERT INTO users (username, name, email, password, "isAdmin") VALUES %L RETURNING *;`,
      hashedUsers.map((u) => [
        u.username,
        u.name,
        u.email,
        u.password,
        u.isAdmin,
      ])
    );

    const insertedUsers = await db.query(insertUserString);
    console.log(`Seeded ${insertedUsers.rowCount} users`);

    await db.query(`
    CREATE TABLE events (
        event_id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        location VARCHAR(200) NOT NULL,
        date TIMESTAMP NOT NULL,
        capacity INTEGER NOT NULL,
        price DECIMAL(10,2) DEFAULT 0,
        created_by VARCHAR(200) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        external_id VARCHAR(200) UNIQUE,
        image_url TEXT,
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

    await db.query(`
      CREATE OR REPLACE FUNCTION check_event_creator_is_admin()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM users
          WHERE username = NEW.created_by
          AND "isAdmin" = TRUE
        ) THEN
          RAISE EXCEPTION 'Only admin users can create events';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
      `);

    await db.query(`
      CREATE TRIGGER enforce_admin_event_creator
      BEFORE INSERT OR UPDATE ON events
      FOR EACH ROW
      EXECUTE FUNCTION check_event_creator_is_admin();
      `);

    const insertEventString = format(
      `INSERT INTO events (title, description, location, date, capacity, price, created_by, external_id, image_url, url) VALUES %L RETURNING *;`,
      eventData.map((e) => [
        e.title,
        e.description,
        e.location,
        e.date,
        e.capacity,
        e.price,
        e.created_by,
        e.external_id,
        e.image_url,
        e.url,
      ])
    );

    const insertedEvents = await db.query(insertEventString);
    console.log(`Seeded ${insertedEvents.rowCount} events`);

    await db.query(`
  CREATE TABLE event_registrations (
    registration_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    username VARCHAR(200) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, username)
  );
`);

    await db.query(`
  CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
`);
    console.log(`Created event_registrations table`);


  } catch (err) {
    console.error("Error seeding:", err);
  }
};

module.exports = seed;
