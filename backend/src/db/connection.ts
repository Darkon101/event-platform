import { Pool } from "pg";
import type { PoolConfig } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV = process.env.NODE_ENV || "development";

dotenv.config({ path: path.resolve(__dirname, `../../.env.${ENV}`) });

const config: PoolConfig = {};

if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
}

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
} else {
  console.log(`Connected to ${process.env.PGDATABASE}`);
}

const db = new Pool(config);

export default db;
