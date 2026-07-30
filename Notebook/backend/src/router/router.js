import { Router } from "express";

const appRouter = Router();

appRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default appRouter;
