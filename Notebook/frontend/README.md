# Notebook frontend

Responsive React workspace for notes, tasks, focus sessions, and soundscapes.

## Setup

1. Copy `.env.example` to `.env` and set `VITE_API_URL` if the API is not running at `http://localhost:4000/api`.
2. Install dependencies with `npm install`.
3. Start development with `npm run dev`.

## Quality checks

- `npm run lint` checks React source with Oxlint.
- `npm run build` creates and verifies the production bundle.

The app checks `GET /health` on the configured API endpoint and reports its status in the header. Notes, tasks, and the timer currently keep their state in the browser; connect them to authenticated API endpoints when those backend resources are added.
