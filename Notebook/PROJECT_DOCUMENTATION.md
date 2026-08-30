# Notebook Project Documentation

## 1. Project Overview

Notebook is a personal productivity and social workspace. It combines:

- Sticky notes and a code editor for HTML, CSS and JavaScript.
- A personal music library with audio uploads, cover images and playback.
- Focus and stopwatch timers.
- A temporary todo list in the desktop window.
- User search, follow/unfollow and profile pages.
- Direct messaging with online presence and unread-message tracking.
- An optional Electron desktop shell that opens notes, todo items and the music player in separate windows.

The project is split into two applications:

| Part | Technology | Default purpose |
| --- | --- | --- |
| `backend` | Node.js, Express 5, MongoDB/Mongoose, Socket.IO | REST API, authentication, persistence, uploads and realtime events |
| `frontend` | React 19, Vite, React Router, Redux Toolkit, TanStack React Query, Tailwind CSS | Browser UI and API client |

The backend and frontend currently use hard-coded local URLs in several files. The backend README describes port `4000`, while many frontend requests use port `5000`; this must be made consistent before a clean local run.

## 2. Directory Structure

```text
Notebook/
├── backend/
│   ├── server.js                    # HTTP server and Socket.IO setup
│   ├── package.json                 # API scripts and dependencies
│   ├── uploads/                     # Created at runtime for music and images
│   └── src/
│       ├── app.js                   # Express middleware and router registration
│       ├── config/EVConfig.js       # Environment configuration
│       ├── db/databaseConnection.js # MongoDB connection
│       ├── middleware/              # Auth, uploads and error handling
│       ├── module/                  # Mongoose schemas/models
│       ├── controllers/             # Request handlers grouped by feature
│       ├── router/authRoute.route.js# All current REST endpoints
│       └── utils/                   # Password hashing and JWT helpers
└── frontend/
    ├── package.json                 # Vite, React and Electron scripts
    ├── vite.config.js               # Vite + React + Tailwind plugins
    ├── electron/
    │   ├── main.js                  # Desktop windows and IPC handlers
    │   └── preload.cjs              # Safe renderer-to-main IPC bridge
    └── src/
        ├── main.jsx                 # React bootstrap
        ├── router/                  # Routes, layout and protected routes
        ├── auth/                    # Signup, login, OTP and auth checks
        ├── component/               # Main page-level components
        ├── page/                    # Feature implementations
        ├── Redux/                   # Global editor/auth/UI state
        ├── context/Socket.jsx       # Socket.IO client provider
        ├── config/                  # Image and timer asset maps
        └── IndexDB/                 # Focus timer database setup
```

## 3. How the Application Starts

### Backend

1. Change directory to `project/Notebook/backend`.
2. Copy `.env.example` to `.env` if that file exists, then fill in the values.
3. Install dependencies with `npm install`.
4. Start development mode with `npm run dev`, or production mode with `npm start`.
5. The server creates an HTTP server from Express and attaches Socket.IO to the same server.
6. `app.js` connects to MongoDB when it is imported.

Backend scripts:

| Command | Result |
| --- | --- |
| `npm start` | Runs `node server.js` |
| `npm run dev` | Runs `nodemon server.js` |
| `npm test` | Runs Node's test runner; no complete test suite is currently documented |

### Frontend browser mode

1. Change directory to `project/Notebook/frontend`.
2. Install dependencies with `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL, normally `http://localhost:5173`.

Frontend scripts:

| Command | Result |
| --- | --- |
| `npm run dev` | Starts Vite development server |
| `npm run build` | Creates the production bundle |
| `npm run lint` | Runs Oxlint |
| `npm run preview` | Serves the production bundle locally |
| `npm run watch` | Starts the Electron main process |

### Electron mode

Electron expects Vite to already be running at `http://localhost:5173`. Then run `npm run watch` from `frontend`.

The main window loads `/`. IPC can open these additional renderer routes:

| IPC event | Renderer route | Window purpose |
| --- | --- | --- |
| `open-note-window` | `/CreateNotes` | Create a note or code document |
| `UpdateNotes` | `/UpdateNotes/:id` | Edit an existing note |
| `ViewNotes` | `/viewNotes/:id` | View a note in a small always-on-top window |
| `CustomMusicPlayer` | `/CustomMusicPlayer` | Dedicated music player |
| `open-todo-window` | `/TodoPage` | Small always-on-top todo window |
| `closeNoteWindow` | none | Closes the current note child window |
| `closeTodoWindow` | none | Closes the current todo child window |

## 4. Environment Configuration

The backend reads `.env` through `src/config/EVConfig.js`:

| Variable | Meaning | Current behavior |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | Defaults to `development` |
| `PORT` | HTTP port | Valid values are 1-65535; otherwise defaults to `4000` |
| `CORS_ORIGIN` | Allowed browser origins | Comma-separated; defaults to `http://localhost:5173` |
| `MONGODB` | MongoDB connection string | Used by Mongoose |
| `JWTACCESS` | Access-token signing secret | Required for JWT auth |
| `JWTREFRESH` | Refresh-token signing secret | Required for refresh flow |
| `EMAIL` | Gmail SMTP account | Used for OTP mail |
| `PASS` | Gmail SMTP password/app password | Used for OTP mail |

The frontend README mentions `VITE_API_URL`, but the current source mostly calls `http://localhost:5000` directly. Setting `VITE_API_URL` alone will not change those requests until the code is centralized around that variable.

## 5. Frontend Routes and Screens

### Public routes

| Route | Component | Purpose |
| --- | --- | --- |
| `/login` | `auth/Login.jsx` | Account creation form (despite its name) |
| `/signup` | `auth/Singin.jsx` | Email/password sign-in form (despite its name) |
| `/Email` | `auth/EmailVerifyOTP.jsx` | Six-digit email OTP verification |
| `*` | `component/NotFound.jsx` | 404 page |

### Protected routes

`router/ProtectedRoutes.jsx` calls `/authRouter/check-auth` with credentials. While checking, it shows `Loading...`; an unauthenticated user is redirected to `/login`.

| Route | Component | Main capability |
| --- | --- | --- |
| `/` | `component/Notes.jsx` | Notes dashboard |
| `/SearchUser` | `component/SearchUser.jsx` | Search users by name or username |
| `/timer` | `component/Timer.jsx` | Focus timer and stopwatch |
| `/music` | `component/Music.jsx` | Music library and upload UI |
| `/tasks` | `component/Todo.jsx` | Todo page inside the main layout |
| `/ProfilePage` | `component/ProfilePage.jsx` | Profile, stats, followers and following |
| `/ChatSeaction` | `page/Profilepage/ChatSeaction.jsx` | Direct chat with a selected user |

Standalone utility routes are available without the protected layout: `/CreateNotes`, `/UpdateNotes/:id`, `/ViewNotes/:id`, `/CustomMusicPlayer` and `/TodoPage`.

## 6. Feature Behavior

### Authentication and email verification

1. The user submits name, username, email and password from the create-account screen.
2. The backend hashes the password with bcrypt.
3. A six-digit OTP is stored with a five-minute expiry and sent through Nodemailer/Gmail.
4. The user submits the OTP from `/Email`.
5. On success, the user is marked verified and access and refresh JWTs are placed in cookies.
6. Sign-in also creates both JWTs and returns basic user information.
7. Protected requests use the access cookie first. If it is expired, the middleware verifies the refresh cookie and issues a new access cookie.

JWT payloads contain the user id. Access tokens last two days; refresh tokens last seven days.

### Notes and code editor

- `NotesContainer` fetches the current user's notes with React Query.
- A note can contain normal text, HTML, CSS and JavaScript.
- `CreateNotes` uses a textarea for text mode and Monaco Editor for code mode.
- HTML, CSS and JavaScript can be combined into an `srcDoc` preview when Run is selected.
- Formatting flags include bold, italic, underline and strike-through.
- Notes can be viewed, edited or deleted from the note cards.
- Electron IPC refreshes the note list after a child create/update window saves successfully.

### Music

- The upload form accepts a title, artist, audio file and cover image.
- Multer stores audio under `uploads/music` and images under `uploads/images`.
- Express exposes `/uploads` as static files.
- The music list is loaded from `/authRouter/getMusic` and filtered in the client by title or artist.
- Cards can start and stop audio playback.
- The footer player and separate custom player support play/pause, next/previous, seek and volume.
- Favorites are displayed from the `fav` field, but the current UI does not persist a favorite toggle.

### Timer and todo

- Focus presets are 25, 15 and 50 minutes, plus a custom duration.
- Focus session counts and focused minutes are stored in `localStorage` under `score`.
- The selected timer page is stored under `TimerPage`.
- Todo entries are currently kept only in React component state, so they disappear after reload/window close.
- The Electron todo window is frameless, transparent and always on top.

### Social features and chat

- Search uses a 500 ms debounce before calling `/searchUsers`.
- Users can follow or unfollow other users.
- The profile endpoint returns current user details, follower/following counts and populated lists.
- A conversation can be created only with a user the current user follows.
- Messages are saved in MongoDB and delivered to the receiver through Socket.IO.
- Socket authentication reads the `accessToken` cookie during the handshake.
- Users join a room named after their user id.
- `online-users`, `user-online` and `user-offline` events maintain presence indicators.
- Unread messages are grouped by conversation and sender; opening a conversation marks received messages as read.

## 7. Backend API Reference

All routes below are mounted under `/authRouter`. Authentication means the `tookenChecker` middleware is required.

### Authentication

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/check-auth` | Yes | Returns authenticated user summary |
| `POST` | `/createAccount` | No | Creates user and sends OTP |
| `POST` | `/singIn` | No | Verifies password and sets JWT cookies |
| `POST` | `/VerifOtp` | No | Verifies OTP and sets JWT cookies |

### Notes

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/getNotes` | Yes | Gets all notes for the current user |
| `GET` | `/noteDataGetById/:id` | Yes | Gets note data for an id parameter |
| `POST` | `/insertNotes` | Yes | Creates text/code note content |
| `PATCH` | `/updateNotes` | No in router | Updates note content using body `id` |
| `DELETE` | `/deleteNotes/:id` | No in router | Deletes a note by id |

### Music

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/getMusic` | Yes | Gets current user's music |
| `POST` | `/uploadMusic` | Yes | Uploads audio and optional cover image |
| `PATCH` | `/updateMusic` | No in router | Placeholder controller; not implemented |
| `DELETE` | `/deleteMusic/:id` | No in router | Placeholder controller; not implemented |

### Account, follows and chat

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/searchUsers?q=...` | Yes | Searches users excluding the current user |
| `GET` | `/profile` | Yes | Gets profile and follower/following data |
| `GET` | `/follow-status/:userId` | Yes | Checks whether current user follows a user |
| `POST` | `/follow/:userId` | Yes | Creates a follow relationship |
| `DELETE` | `/unfollow/:userId` | Yes | Removes a follow relationship |
| `POST` | `/conversation/:userId` | Yes | Gets or creates a two-person conversation |
| `GET` | `/messages/:conversationId` | Yes | Gets conversation messages |
| `POST` | `/message` | Yes | Stores and emits a message |
| `PATCH` | `/messages/:conversationId/read` | Yes | Marks received messages as read |
| `GET` | `/messages/unread` | Yes | Returns unread totals grouped by conversation/sender |

## 8. Database Models

MongoDB models are in `backend/src/module`.

| Model | Important fields | Role |
| --- | --- | --- |
| `Login` | name, username, email, password, otp, otpExpire, isVerified | User account and verification state |
| `Note` | userId, title, type, content, html, css, javascript | Text/code notes |
| `Music` | userId, title, artist, fileUrl, coverImage, fav | Uploaded music metadata |
| `Follow` | follower, following | Unique follow relationship |
| `Conversation` | participants, lastMessage, lastMessageAt | Two-user chat container |
| `Message` | conversation, sender, receiver, content, read, readAt | Chat message and read state |

## 9. State and Data Flow

### Redux Toolkit

The single slice in `frontend/src/Redux/Slice.jsx` stores editor state, authentication state, current user, timer selection, selected chat user, code preview and music form visibility.

### TanStack React Query

React Query handles server reads and mutations for notes, music, profile, users, follow status, conversations and messages. Mutations invalidate related query keys such as `insertNotes`, `insertMusic`, `profile` and `unreadMessages`.

### Browser storage

| Storage key | Data |
| --- | --- |
| `email` | Email passed from account creation to OTP verification |
| `selectUser` | Selected chat user |
| `TimerPage` | Selected timer tab |
| `score` | Focus sessions, completed sessions and focused minutes |

### Authentication data flow

```text
React form
  -> Axios request with withCredentials: true
  -> Express route
  -> JWT/cookie middleware when protected
  -> Controller
  -> Mongoose model / SMTP / Socket.IO
  -> JSON response or realtime event
```

## 10. Important Current Limitations

These are observed from the current source and should be considered before deploying:

1. Port configuration is inconsistent: backend defaults to `4000`, while many frontend calls and Socket.IO use `5000`.
2. The backend README mentions `GET /api/health`, but `app.js` does not currently register that endpoint.
3. The frontend README mentions `VITE_API_URL`, but most API URLs are hard-coded.
4. The signup and sign-in screen names are reversed: `Login.jsx` creates an account and `Singin.jsx` signs in.
5. Account duplicate checking compares email and username against swapped normalized values, which can produce incorrect duplicate messages.
6. `noteDataGetById` receives an id but queries only by `userId`, so it can return the user's first matching note instead of the requested note.
7. Note update and delete routes are not protected in the router and do not verify ownership before changing data.
8. `updateMusic` and `deleteMusic` are empty controllers.
9. Music upload catches an error but returns `err.message`, although the variable is named `error`; this can cause a second `ReferenceError`.
10. The message schema uses `reduired` instead of `required` for sender and receiver, so those fields are not enforced by Mongoose.
11. Socket authentication assumes the cookie contains an `accessToken=` entry and can throw if it is absent or malformed; the outer catch returns an authentication error.
12. Some Electron windows enable `webSecurity: false` and automatically open DevTools. These settings are useful during development but should be reviewed for production.
13. Cookies are configured with `secure: false` in the current auth flow; production HTTPS should use secure cookies and an appropriate SameSite policy.
14. The focus interval is `10` milliseconds while decrementing seconds, so focus sessions complete much faster than their displayed duration.
15. Todo data is not persisted and the main todo component and Electron todo window use separate local state.
16. Several UI actions are placeholders, including resend OTP, edit profile, view user and favorite music.
17. React Query and Socket.IO providers are initialized under `StrictMode`; development can therefore expose duplicate-effect behavior if event cleanup is incomplete.

## 11. Suggested First Run Checklist

1. Start MongoDB and confirm the `MONGODB` connection string.
2. Configure JWT secrets and SMTP credentials in backend `.env`.
3. Choose one API port, then update backend `PORT`, frontend Axios URLs and Socket.IO URL to match it.
4. Set `CORS_ORIGIN` to the exact frontend origin.
5. Run backend `npm install` and `npm run dev`.
6. Run frontend `npm install` and `npm run dev`.
7. Open the frontend and create an account.
8. Confirm the OTP email arrives, verify it, then test notes, music upload, follow and chat flows.
9. Run `npm run lint` and `npm run build` in the frontend before packaging Electron.

## 12. Key Files for Future Development

| Concern | Start here |
| --- | --- |
| Add/change an API route | `backend/src/router/authRoute.route.js` |
| Change authentication | `backend/src/middleware/authMiddleware.js` and `backend/src/controllers/Auth` |
| Change MongoDB structure | `backend/src/module` |
| Change note editor | `frontend/src/page/Notes/CreateNotes.jsx` and `UpdateNotes.jsx` |
| Change note dashboard | `frontend/src/page/Notes/NotesContainer.jsx` |
| Change navigation/routes | `frontend/src/router/Router.jsx` and `Layout.jsx` |
| Change global UI/editor state | `frontend/src/Redux/Slice.jsx` |
| Change chat realtime behavior | `backend/server.js`, `frontend/src/context/Socket.jsx` and `frontend/src/page/Profilepage/ChatSeaction.jsx` |
| Change desktop windows | `frontend/electron/main.js` and `preload.cjs` |
| Change environment handling | `backend/src/config/EVConfig.js` |