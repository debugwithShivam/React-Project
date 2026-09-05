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
  ACCESSTOKEN: process.env.JWTACCESS,
  REFRESHTOKEN: process.env.JWTREFRESH,
  EMAIL: process.env.EMAIL,
  PASS: process.env.PASS,
  RESENDAPI: process.env.RESEND_API_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
});

export default config;

