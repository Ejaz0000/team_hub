const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

module.exports = {
  PORT,
  DATABASE_URL: process.env.DATABASE_URL || ""
};
