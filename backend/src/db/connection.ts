import { PoolConfig } from "pg";

const dotenv = require("dotenv");
const path = require("path");
const {Pool} = require("pg");

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

module.exports = db;
