# Notebook API

## Getting started

1. Copy `.env.example` to `.env` and update the values for your environment.
2. Run `npm install`.
3. Start the API with `npm run dev` (development) or `npm start` (production).

The API listens on `http://localhost:4000` by default. Its health check is available at `GET /api/health`.

## Environment variables

| Name | Description |
| --- | --- |
| `NODE_ENV` | Application environment; defaults to `development`. |
| `PORT` | HTTP port from 1 through 65535; defaults to `4000`. |
| `CORS_ORIGIN` | Comma-separated list of permitted browser origins. |
| `MONGODB` | MongoDB connection string for future persistence integration. |
