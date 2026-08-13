import app from "./src/app.js";
import config from "./src/config/EVConfig.js";
import { Server } from 'socket.io'
import http from 'http'
import jwt from 'jsonwebtoken'

const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigins,
    credentials: true
  }
})

io.use(async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error("Authentication required"))
    }

    const accessToken = cookies.split("; ").find((cookie) => cookie.startsWith("accessToken=")).split("=")[1]

    if (!accessToken) {
      return next(new Error("Access Token missing"));
    }

    const decoded = jwt.verify(accessToken, config.ACCESSTOKEN)

    socket.user = decoded
    next()

  } catch (error) {
    console.log("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
})

const onlineUsers = new Map();

io.on("connection", (socket) => {
    const userId = socket.user.id;

    socket.join(String(userId)); 

    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    socket.emit("online-users",{
      userId:[...onlineUsers.keys()]
    })

    if (onlineUsers.get(userId).size === 1) {
        socket.broadcast.emit("user-online", {
            userId,
        });
    }

    socket.on("disconnect", () => {
        const userSockets = onlineUsers.get(userId);

        if (!userSockets) return;

        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
            onlineUsers.delete(userId);

            console.log("OFFLINE:", userId);

            socket.broadcast.emit("user-offline", {
                userId,
            });
        }
    });
});

app.set("io",io)

const server = httpServer.listen(config.port, () => {
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
