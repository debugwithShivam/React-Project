# Notebook Project Documentation

## Overview
The Notebook project is a full-stack note-taking and multimedia workspace built with:
- Frontend: React, Vite, Tailwind CSS, React Router, Redux Toolkit, React Query
- Backend: Express, MongoDB, Mongoose, JWT authentication, file upload
- Desktop integration: Electron for running the frontend as a desktop app

The project includes note creation, editing, viewing, music upload/playback, search, and user authentication.

---

## Repository Structure

### Root
- `frontend/` — React application and Electron integration
- `backend/` — Express API server and MongoDB backend

### Frontend
- `package.json` — dependencies, scripts, Vite, Electron, React packages
- `.env.example` — frontend sample environment variable file
- `README.md` — brief frontend setup and run instructions
- `src/` — application source code
- `electron/` — Electron main process and preload setup

### Backend
- `package.json` — backend dependencies and scripts
- `.env.example` — sample backend environment variables
- `server.js` — backend entry point that loads `app.js`
- `src/` — backend source code

---

## Frontend Details

### `frontend/package.json`
- `dev`: `vite`
- `build`: `vite build`
- `lint`: `oxlint`
- `preview`: `vite preview`
- `watch`: `electron electron/main.js`
- Uses React 19, React Router 7, Redux Toolkit, React Query, Monaco editor, Tailwind CSS, Electron

### `frontend/.env.example`
- `VITE_API_URL=http://localhost:4000/api`

### Main entry points
- `src/main.jsx` — initializes React app, Redux store, React Query client, and router
- `src/App.jsx` — currently returns `null`, actual app rendering happens in `main.jsx`

### Routing and layout
- `src/router/Router.jsx` — defines client-side routes using `createBrowserRouter`
  - `CreateNotes`
  - `UpdateNotes/:id`
  - `ViewNotes/:id`
  - `CustomMusicPlayer`
  - `/` main layout with protected child routes
  - `login`, `signup`, `Email`, `*` fallback
- `src/router/Layout.jsx` — application frame and navigation menu
  - search
  - notes
  - music
  - timer
  - todo
  - authentication buttons

### Authentication flow
- `src/auth/AuthInitializer.jsx` — checks `/authRouter/check-auth` on startup and updates Redux auth state
- `src/auth/Login.jsx` — creates account and sends OTP email
- `src/auth/Singin.jsx` — signs in existing users
- `src/auth/EmailVerifyOTP.jsx` — verifies OTP and issues tokens
- `src/auth/ProtectedRoutes.jsx` — protects auth-only pages

### Redux state
- `src/Redux/Slice.jsx` — global state for formatting, auth, editor mode, code text, fullscreen, note state, and music form toggle
- `src/Redux/Store.jsx` — configures Redux store with `noteBookSlice`

### Pages and components
- `src/component/Notes.jsx` — page wrapper for note header and notes container
- `src/component/SearchUser.jsx` — search interface for users
- `src/component/Music.jsx` — music section wrapper
- `src/component/Timer.jsx` — timer page component
- `src/component/Todo.jsx` — todo page component
- `src/component/NotFound.jsx` — fallback route

### Note pages
- `src/page/Notes/CreateNotes.jsx` — note editor with text and code modes, Monaco editor, live preview support, save note mutation
- `src/page/Notes/UpdateNotes.jsx` — loads note by ID, allows updating text/code, and submits patch request
- `src/page/Notes/viewNotes.jsx` — view note details by ID
- `src/page/Notes/NotesContainer.jsx` — list notes fetched from backend, with delete, view, and edit actions
- `src/page/Notes/Header.jsx` — note page header

### Music pages
- `src/page/Music/MusicPage.jsx` — music page layout
- `src/page/Music/AddMusicForm.jsx` — upload music track and cover image form, uses FormData
- `src/page/Music/MusicContainer.jsx` — music list, audio playback, play/pause functionality, favorites UI state
- `src/page/Music/Header.jsx` — music page header
- `src/page/Music/Footer.jsx` — music page footer
- `src/page/Music/CustomMusicPlayer.jsx` — custom player route
- `src/page/Music/musicData.js` — custom React Query hook to fetch music playlist

### UI and assets
- `src/config/imageConfig.js` — imports app images for background, logo, login, signup screens
- `src/image/` — static image assets used by the frontend
- `src/App.css`, `src/index.css` — app styling and Tailwind integration

### Electron integration
- `frontend/electron/main.js` — Electron main process
  - creates main browser window loading `http://localhost:5173/`
  - opens DevTools by default
  - defines IPC handlers for note windows, update/view windows, custom music player, and close window
- `frontend/electron/preload.cjs` — preload script for Electron context isolation

### Frontend feature summary
- auth-protected note workspace
- notes list with dynamic cards, edit/delete/view actions
- rich code note editing with Monaco editor
- music upload and playback UI
- search user screen
- responsive navigation
- Electron desktop mode with pop-up note windows

---

## Backend Details

### `backend/package.json`
- `start`: `node server.js`
- `dev`: `nodemon server.js`
- `test`: `node --test`
- Uses Express 5, Mongoose, JWT, bcrypt, multer, nodemailer, dotenv, cors, morgan

### `backend/.env.example`
- `NODE_ENV=development`
- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`
- `MONGODB=mongodb://127.0.0.1:27017/notebook`

### Backend entry points
- `server.js` — starts HTTP server and handles graceful shutdown
- `src/app.js` — configures Express app, middleware, routes, and MongoDB connection

### Backend configuration
- `src/config/EVConfig.js` — loads environment variables and exports config values
  - `env`
  - `port`
  - `mongoUri`
  - `corsOrigins`
  - `ACCESSTOKEN`
  - `REFRESHTOKEN`
  - `EMAIL`
  - `PASS`

### Database connection
- `src/db/DatabaseConnection.js` — connects to MongoDB with Mongoose and logs connection status

### Middleware
- `src/middleware/authMiddleware.js` — verifies access token or refresh token and populates `req.user`
- `src/middleware/errorHandler.js` — global error handling for 404 and other errors
- `src/middleware/upload.js` — file upload middleware for music and image uploads

### Routes
- `src/router/authRoute.route.js` — all backend API routes under `/authRouter`
  - `GET /check-auth`
  - `GET /getNotes`
  - `GET /noteDataGetById/:id`
  - `GET /getMusic`
  - `GET /searchUsers`
  - `POST /createAccount`
  - `POST /singIn`
  - `POST /insertNotes`
  - `POST /VerifOtp`
  - `POST /uploadMusic`
  - `PATCH /updateNotes`
  - `PATCH /updateMusic`
  - `DELETE /deleteMusic/:id`
  - `DELETE /deleteNotes/:id`

### Controllers
- `src/controllers/Auth/auth.Controller.js` — registration with OTP email using Nodemailer
- `src/controllers/Auth/SingIn.controller.js` — login with email/password and token cookies
- `src/controllers/Auth/VerifyOtp.Controller.js` — verify OTP, activate user, issue tokens
- `src/controllers/Notes/InsertNotes.controller.js` — create new note for authenticated user
- `src/controllers/Notes/getNotes.controller.js` — fetch notes for current user
- `src/controllers/Notes/getbyId.controller.js` — get single note by ID
- `src/controllers/Notes/updateNotes.controller.js` — update note fields
- `src/controllers/Notes/deleteNotes.controller.js` — delete note by ID
- `src/controllers/Music/uploadMusic.controller.js` — upload music file and optional cover image
- `src/controllers/Music/getMusic.controller.js` — fetch uploaded music list
- `src/controllers/Music/updateMusic.controller.js` — update music record
- `src/controllers/Music/deleteMusic.controller.js` — delete music entry
- `src/controllers/Account/searchUsers.controller.js` — user search by name or username

### Models
- `src/module/User.js` — user schema with `name`, `username`, `email`, `password`, `otp`, `otpExpire`, and `isVerified`
- `src/module/sticky-note.schema.js` — note schema with text/code fields and user relation
- `src/module/music.schema.js` — music schema with `title`, `artist`, `fileUrl`, `coverImage`, and user relation

### Backend utilities
- `src/utils/generateToken.js` — JWT generation for access and refresh tokens
- `src/utils/HashingPassword.js` — bcrypt password hashing
- `src/utils/verifyPassword.js` — bcrypt password verification

### API behavior and auth
- Auth cookies: `accessToken` and `refreshToken`
- Protected backend endpoints use `tookenChecker` middleware
- Music upload uses multer fields: `music` and `coverImage`
- Search returns other users excluding current user

---

## How to Run

### Frontend
1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env` and set `VITE_API_URL` if needed
4. `npm run dev`
5. For Electron desktop mode: `npm run watch`

### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. Set `MONGODB`, `CORS_ORIGIN`, `JWTACCESS`, `JWTREFRESH`, `EMAIL`, and `PASS`
5. `npm run dev`

---

## Notes and Important Details
- The frontend app uses `http://localhost:5000/authRouter` for API requests by default.
- Electron windows load the Vite development server URLs like `/CreateNotes`, `/UpdateNotes/:id`, `/viewNotes/:id`, and `/CustomMusicPlayer`.
- The `AuthInitializer` component checks auth status and updates Redux state before the router renders protected pages.
- Some UI behaviors are still in progress, such as music services and auth token handling.
- The project is split into the frontend React app and the backend API, with Electron providing a desktop wrapper.

---

## Key Files to Inspect
- `frontend/src/router/Router.jsx`
- `frontend/src/router/Layout.jsx`
- `frontend/src/auth/AuthInitializer.jsx`
- `frontend/src/page/Notes/CreateNotes.jsx`
- `frontend/src/page/Music/AddMusicForm.jsx`
- `frontend/electron/main.js`
- `backend/src/app.js`
- `backend/src/router/authRoute.route.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/controllers/Auth/auth.Controller.js`
- `backend/src/module/User.js`

---

## Suggested Improvements
- fix `auth.Controller.js` search logic for username/email normalization and duplicate detection
- verify `frontend/src/App.jsx` usage or remove if unused
- unify API base URL configuration from `frontend/.env`
- secure cookies with `httpOnly` and `secure` in production
- add backend tests for auth, note, and music controllers

---

## Summary
This Notebook application is a multi-part project combining React, Electron, and Express/MongoDB. It supports user signup/login with OTP, note creation/editing, music upload/playback, and a search interface. The documentation above captures the main structure, routes, and feature areas for both frontend and backend.
