const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
const JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
const ACCESS_TOKEN_COOKIE = process.env.ACCESS_TOKEN_COOKIE || "th_access";
const REFRESH_TOKEN_COOKIE = process.env.REFRESH_TOKEN_COOKIE || "th_refresh";

module.exports = {
  PORT,
  DATABASE_URL: process.env.DATABASE_URL || "",
  NODE_ENV,
  WEB_ORIGIN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_TTL,
  JWT_REFRESH_TTL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE
};
