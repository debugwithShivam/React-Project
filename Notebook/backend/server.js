import app from "./src/app.js";
import config from "./src/config/EVConfig.js";

const server = app.listen(config.port, () => {
  console.info(`Notebook API listening on port ${config.port} (${config.env})`);
});

const shutdown = (signal) => {
  console.info(`${signal} received. Closing HTTP server...`);
  server.close((error) => {
    if (error) {
      console.error("Unable to close HTTP server cleanly", error);
      process.exitCode = 1;
    }
    process.exit();
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
