const db = require("../connection");
const {format} = require("@scaleleap/pg-format");
const {hashPassword} = require("../utils/hash")

import type {User} from "../../types"

const seed = async ({userData} : {userData: User[]}) => {
  try {
    await db.query(`DROP TABLE IF EXISTS users;`);

    await db.query(`
        CREATE TABLE users (
            username VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            "isAdmin" BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const hashedUsers = await Promise.all(
        userData.map(async (u:User) => ({
            ...u,
            password: await hashPassword(u.password)
        }))
    )

    const insertUserString = format(
      `INSERT INTO users (username, name, email, password, "isAdmin") VALUES %L RETURNING *;`,
      hashedUsers.map((u) => [u.username, u.name, u.email, u.password, u.isAdmin])
    );

    const insertedUsers = await db.query(insertUserString);
    console.log(`Seeded ${insertedUsers.rowCount} users`)
  } catch (err) {
    console.error("Error seeding users:", err);
  }
};

module.exports = seed;
