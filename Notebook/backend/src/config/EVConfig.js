import dotenv from "dotenv";

dotenv.config();

const parsePort = (value) => {
  const port = Number(value);

  if (Number.isInteger(port) && port > 0 && port <= 65535) {
    return port;
  }

  return 4000;
};

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const config = Object.freeze({
  env: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  mongoUri: process.env.MONGODB,
  corsOrigins: allowedOrigins,
});

export default config;
