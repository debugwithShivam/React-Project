# Todo List Frontend

React and Vite client for the Todo List API.

## Run locally

```sh
npm install
npm run dev
```

The client uses `http://localhost:3000` for the API by default. Set `VITE_API_URL` in a local `.env` file when the backend runs elsewhere.

## Source layout

```text
src/
  app/                    App routes and provider composition
  features/
    navigation/           Header and navigation UI
    pages/                 User-created Todo pages
    todos/                 Todo lists, timers, and Todo controls
  contexts/                React context state
  store/                   Redux store and Todo slice
  services/                Shared API client
  shared/                  Reusable utilities
  assets/                  Images and audio
  styles/                  Global and application styles
  main.jsx                 Browser entry point
```
