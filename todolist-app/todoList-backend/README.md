# Todo List API

Express and MongoDB API. Routes preserve the paths used by the existing frontend.

## Run locally

```sh
npm install
npm run dev
```

The API uses `mongodb://127.0.0.1:27017/searchItem` unless `MONGODB_URI` is set. `PORT` defaults to `3000`. Use `npm start` for a normal server process.

## Source layout

```text
src/
  config/       Database connection
  controllers/  Request handlers and persistence operations
  middleware/   Not-found and error responses
  models/       Mongoose schemas
  routes/       HTTP route declarations
  app.js        Express middleware and route composition
  server.js     Database connection and HTTP startup
index.js        Compatibility entry point
```

API groups currently cover search tasks, Todo pages, and Todos. The `Login` model is retained, but this project does not yet expose authentication routes.
