import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import config from "./config/EVConfig.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import appRouter from "./router/router.js";
import connectDB from "./db/DatabaseConnection.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);


dns.resolveSrv(
  "_mongodb._tcp.cluster0.inxslpo.mongodb.net",
  (err, records) => {
    console.log(err);
    console.log(records);
  }
);

const app = express();

connectDB()
app.disable("x-powered-by");
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(morgan(config.env === "production" ? "combined" : "dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", appRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
