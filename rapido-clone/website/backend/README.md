# Rapido & Uber Clone - Backend (MVC Architecture)

Yeh backend structure strictly **MVC (Model-View-Controller)** pattern follow karta hai.

## Folder Structure

```
backend/
├── server.js                 # Entry point (Express bootstrap & route mounting)
├── .env.example              # Environment variables template
├── package.json              # Backend dependencies
└── src/
    ├── config/
    │   └── db.js             # MongoDB Mongoose connection
    ├── models/
    │   ├── User.js           # Commuter/Rider schema
    │   ├── Captain.js        # Driver/Captain schema
    │   └── Ride.js           # Ride booking & tracking schema
    ├── controllers/
    │   ├── authController.js # Auth endpoints (register, login, OTP)
    │   ├── rideController.js # Ride booking, fare calculation, lifecycle
    │   └── userController.js # User profile & history
    ├── routes/
    │   ├── authRoutes.js     # /api/auth
    │   ├── rideRoutes.js     # /api/rides
    │   └── userRoutes.js     # /api/users
    ├── middlewares/
    │   ├── authMiddleware.js # JWT verification
    │   └── errorHandler.js   # Centralized error handler
    └── utils/
        └── responseHandler.js# Standard JSON response helper
```

## Setup Instructions (Future Implementation)
1. Dependencies install karein:
   ```sh
   npm install
   ```
2. `.env` file create karein `.env.example` se:
   ```sh
   copy .env.example .env
   ```
3. Development server run karein:
   ```sh
   npm run dev
   ```
