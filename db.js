const { Client } = require("pg");
const path = require("path");

require("dotenv").config({
  override: true,
  path: path.join(__dirname, ".env"),
});

const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT,
});

client
  .connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Connection error", err.stack));

module.exports = client;
