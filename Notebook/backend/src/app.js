import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import config from "./config/EVConfig.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import appRouter from "./router/router.js";

const app = express();

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
