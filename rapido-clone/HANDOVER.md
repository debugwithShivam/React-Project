# Sawaari (Rapido Clone) — Handover Checklist

Everything below is **manual work you must do**. The code is written; these are the steps to make it run.

---

## 1. Database Migration

Run this SQL file against your MySQL database **once**:

```
D:\code\project\rapido-clone\DATABASE_MIGRATION_v2.sql
```

It does:
- `ALTER TABLE rides` to add `SCHEDULED` status + new columns (ride_otp, coupon_id, scheduled_at, cancellation_charges, etc.)
- Creates 15 new tables: `vehicle_types`, `cities`, `coupons`, `coupon_redemptions`, `payments`, `wallet_transactions`, `ratings`, `complaints`, `complaint_messages`, `notifications`, `dynamic_pages`, `settings`, `payouts`, `ride_events`, `sos_alerts`
- Seeds default `vehicle_types` (BIKE/AUTO/CAB), `settings`, and `dynamic_pages`

**How to run:**
```bash
mysql -u root -p rapido_clone < D:\code\project\rapido-clone\DATABASE_MIGRATION_v2.sql
```
Or open the file in MySQL Workbench / phpMyAdmin and execute.

> ⚠️ If you already ran it once, don't run again — some CREATE TABLE statements will fail on duplicates. That's expected; the ALTERs are idempotent-safe only if columns don't exist yet.

---

## 2. Backend `.env` Keys

File: `D:\code\project\rapido-clone\backend\.env`

Fill in these placeholders with real values:

| Key | What to put |
|-----|-------------|
| `DB_PASSWORD` | Your MySQL password |
| `ACCESS_TOKEN_SECRET` | Any long random string (e.g. `openssl rand -hex 32`) |
| `REFRESH_TOKEN_SECRET` | Different long random string |
| `RAZORPAY_KEY_ID` | From https://dashboard.razorpay.com → Settings → API Keys (use **Test mode** keys first) |
| `RAZORPAY_KEY_SECRET` | Same page |
| `RAZORPAY_WEBHOOK_SECRET` | Create webhook in Razorpay dashboard → Settings → Webhooks; copy the secret you set there |
| `GOOGLE_MAPS_API_KEY` | From https://console.cloud.google.com → Enable "Maps JavaScript API", "Places API", "Directions API" → Create credentials → API key |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins, e.g. `http://localhost:5173,http://localhost:8081` |

Optional tuning (defaults are fine):
- `DEFAULT_DRIVER_SEARCH_RADIUS_KM=5`
- `DEFAULT_RIDE_REQUEST_TIMEOUT_SEC=30`
- `DEFAULT_COMMISSION_PERCENT=20`

---

## 3. Install Dependencies

### Backend
```bash
cd D:\code\project\rapido-clone\backend
npm install
```
(Already includes `socket.io`, `razorpay`, `axios`, `multer`, `bcrypt`, `jsonwebtoken`, `mysql2`, `dotenv`.)

### WebsiteFrontend (Admin Panel)
```bash
cd D:\code\project\rapido-clone\WebsiteFrontend
npm install
```

### UserApp (Customer)
```bash
cd D:\code\project\rapido-clone\UserApp
npm install
```
(`socket.io-client` was added during this session.)

### RiderApp (Captain/Driver)
```bash
cd D:\code\project\rapido-clone\RiderApp
npm install
```
(New deps added: `axios`, `socket.io-client`, `expo-secure-store`, `expo-location`, `react-native-maps`, `expo-image-picker`, `expo-notifications`, `expo-constants`, `expo-linking`, `react-native-gesture-handler`, `react-native-reanimated`.)

---

## 4. Seed Admin User

The migration does **not** create an admin. Insert one manually:

```sql
INSERT INTO users (name, phone, email, password, role, is_active)
VALUES (
  'Super Admin',
  '9999999999',
  'admin@sawaari.com',
  '$2b$12$REPLACE_WITH_BCRYPT_HASH',
  'ADMIN',
  1
);
```

Generate the bcrypt hash (12 rounds) for your desired password:
```bash
cd D:\code\project\rapido-clone\backend
node -e "const b=require('bcrypt');b.hash('YourPassword123',12).then(h=>console.log(h))"
```
Copy the printed hash into the SQL above.

---

## 5. Run Everything

### Backend (port 4000)
```bash
cd D:\code\project\rapido-clone\backend
npm run dev
```
Verify: `http://localhost:4000/api/health` or check console for "Server running on port 4000".

### WebsiteFrontend / Admin Panel
```bash
cd D:\code\project\rapido-clone\WebsiteFrontend
npm run dev
```
Open the printed Vite URL (usually `http://localhost:5173`).
- Public site: `/`
- Admin panel: `/#/Admin` → login with the admin credentials from step 4.

Make sure `VITE_API_URL` in `WebsiteFrontend/.env` points to `http://localhost:4000/api`.

### UserApp (Customer)
```bash
cd D:\code\project\rapido-clone\UserApp
npx expo start
```
- Create/update `.env` in UserApp root:
  ```
  EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:4000/api
  ```
  Replace `<YOUR_LAN_IP>` with your computer's local IP (find via `ipconfig` on Windows). Android emulator can use `http://10.0.2.2:4000/api`.
- Scan QR with Expo Go, or press `a` for Android emulator.

### RiderApp (Captain)
```bash
cd D:\code\project\rapido-clone\RiderApp
npx expo start
```
- Same `.env` setup as UserApp:
  ```
  EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:4000/api
  ```
- Sign up as DRIVER → upload KYC → wait for admin approval → go online.

---

## 6. Razorpay Webhook (for automatic payment confirmation)

In Razorpay Dashboard → Settings → Webhooks:
- URL: `https://<your-public-backend-url>/api/payments/razorpay/webhook`
  (For local dev, use ngrok: `ngrok http 4000`, then use the ngrok URL.)
- Events: `payment.captured`, `payment.failed`, `refund.created`
- Secret: same value as `RAZORPAY_WEBHOOK_SECRET` in `.env`

Without this, payments still work via client-side signature verification (`/api/payments/verify`), but webhook adds server-side confirmation.

---

## 7. Push Notifications (Optional, for production)

Both apps have `expo-notifications` installed but **not wired to FCM/Expo Push Service** yet. To enable:
1. Create Expo account, run `eas init` in each app.
2. Add `expo.push_token` saving logic on login (backend already has `saveFcmToken` in user.service.js — just call it from the app after getting the Expo push token).
3. Configure FCM in Firebase Console, add `google-services.json` to android folders.

For now, real-time updates work via **socket.io** (ride requests, status changes, driver location). Push notifications are a nice-to-have for when the app is backgrounded.

---

## 8. Google Maps API Key for Mobile Apps

`react-native-maps` needs the key in native config:

**UserApp & RiderApp → `app.json`**:
```json
{
  "expo": {
    "plugins": [
      ["react-native-maps", {
        "googleMapsApiKey": "YOUR_KEY_HERE"
      }]
    ]
  }
}
```
Or set via `expo config plugin`. After changing, rebuild the dev client (`npx expo run:android`).

The web admin panel doesn't embed maps directly (it uses Google Maps deep links for SOS/driver locations), so no key needed there.

---

## 9. What's Still Pending / Not Built

These were **intentionally skipped or left as stubs** because they need decisions, external services, or are lower priority:

### Admin Panel
- **Wallet, Refunds, RiderHistory, DriverRideHistory, ScheduledCabs, CustomCabs, StaffRoles** — still use generic `AdminRecords` component with hardcoded mock rows. Backend endpoints exist for most (`/admin/users`, `/admin/rides?status=SCHEDULED`, `/admin/payments?status=REFUNDED`); wiring them is straightforward but wasn't done in this pass.
- **StaffRoles** — no backend RBAC beyond `requireAdmin`. Multi-role admin permissions would need a new `admin_roles` table + middleware changes.

### UserApp
- **Wallet screen** — still shows mock balance/transactions. Backend has `/api/wallet` and `/api/wallet/transactions`; wire similarly to RiderApp's wallet.
- **Coupons UI** — backend `/coupons/validate` and `/coupons/mine` exist; no screen built to apply/list them during booking.
- **Scheduled booking** — backend supports `scheduledAt` in `POST /rides`; no date/time picker UI in booking flow.
- **Live map tracking** — tracking screen uses a static placeholder map with fake markers. Real `react-native-maps` with driver polyline + moving marker needs Google Maps key + more work.
- **Expo push notifications** — see section 7.

### RiderApp
- **Background location** — uses `expo-location` foreground watch + attempts background permission, but true background tracking requires a foreground service on Android (needs `expo-task-manager` + native config).
- **In-app navigation** — "Navigate" buttons open Google Maps app via deep link. Turn-by-turn inside the app would need `react-native-maps-directions` + API key.
- **Expo push notifications** — see section 7.

### Backend
- **Razorpay refunds via admin** — `refundPayment` service exists and `/admin/payments/:id/refund` route is wired, but the admin Payments page refund button calls it correctly. Verify with a test payment.
- **Scheduled ride promotion** — `promoteScheduledRides()` runs every 30s in `server.js`. It moves SCHEDULED→SEARCHING when `scheduled_at <= NOW()`. Test by creating a ride with `scheduledAt` 1 minute in future.
- **Database indexes** — migration adds some, but for production add indexes on `rides(status, created_at)`, `drivers(is_online, current_lat, current_lng)`, `notifications(user_id, is_read)` for performance.

---

## 10. Quick Smoke Test Flow

1. Run migration → seed admin → start backend.
2. Open admin panel → login → Dashboard should show zeros (no data yet).
3. Start UserApp → sign up as USER → book a ride (use map picker for real coords).
4. Start RiderApp → sign up as DRIVER → upload KYC docs.
5. In admin panel → Driver Documents → approve the driver.
6. RiderApp → go online (toggle).
7. UserApp → confirm ride → should see "Finding captain" → RiderApp gets request → accept.
8. UserApp tracking screen shows OTP → tell driver → driver enters OTP → start trip.
9. Driver completes trip → UserApp lands on receipt → pay cash/wallet → rate driver.
10. Admin panel → Rides, Payments, Reviews should all reflect the completed ride.

If any step fails, check backend console logs first — most errors surface there with clear messages.

---

## 11. Laravel Port (`laravel-rapido`) — Parity with Node Backend

The entire Node `backend` feature set has been ported into `D:\code\project\rapido-clone\laravel-rapido` so Laravel reaches functional parity. Both apps share the same MySQL database `rapido_clone` (host `127.0.0.1`, user `root`), so data created by either is visible to the other.

### What was added
- **16 service classes** in `app/Services/`: `Geo`, `Fare`, `Settings`, `Wallet`, `Notification`, `Coupon`, `Rating`, `Complaint`, `Payout`, `DynamicPage`, `City`, `Vehicle`, `Matching`, `Ride`, `Payment`, `Driver` + `app/Support/Gen.php` (OTP / referral / reference generators).
- **Controllers** in `app/Http/Controllers/Api/`: `RideController` (rewritten from mock), and new `DriverController`, `PaymentController`, `MiscController`, `UserController`, `VehicleController`. `AuthController` gained `forgotPassword` + `resetPassword`. `AdminController` was already complete — untouched.
- **Middleware** `EnsureRole` (alias `role`, e.g. `role:DRIVER,ADMIN`) registered in `bootstrap/app.php`.
- **Routes** — full `routes/api.php` rewrite; **125 routes** register cleanly.
- **Models** — `Ride` rewritten to the real schema; `User` + `Driver` extended with v2 columns/casts.
- **Migrations** (all guarded/idempotent, safe on an existing DB): real `rides` schema, `drivers`, `refresh_tokens`, v2 column additions to `users`/`drivers`, and 15 v2 tables + seeds. These **have already been run** — DB now has 29 tables, 4 vehicle_types, 7 cities, 18 settings, 7 dynamic_pages.

### Verified
- `php -l` clean on every ported file; `composer dump-autoload` + `php artisan route:list` OK.
- `php artisan migrate` ran all 4 pending migrations; seeds confirmed via tinker.
- Live smoke test: `/api/vehicles`, `/api/cities`, `/api/pages`, `/api/config` return real seeded JSON; auth-gated routes correctly return `Unauthenticated`.
- Fare math verified (BIKE 7.16 km → ₹81.96 with 12% commission), matching the Node `fare.js` formula.

### Laravel-specific manual TODO
1. **`.env` keys** — set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (same values as the Node backend) for online payments; `Payment` uses `Http::withBasicAuth` REST calls, so **no composer package** is needed. `/api/config` currently returns `enabled:false` until these are set.
2. **Realtime** — the Node backend uses socket.io for live ride updates; Laravel has **no socket layer ported**. REST polling endpoints (`/rides/{id}`, `/rides/{id}/events`, `/driver/rides/nearby`, `/driver/rides/active`) are the fallback. For push realtime, add Laravel Reverb or Pusher later.
3. **Scheduled-ride promotion** — Node runs `promoteScheduledRides()` on a 30s loop. In Laravel, schedule `Ride::promoteScheduled()` in `routes/console.php` (`->everyMinute()`) and run `php artisan schedule:work` (dev) or a cron entry (prod).
4. **Sanctum tokens** — Laravel auth issues Sanctum `plainTextToken`; mobile/web clients must send `Authorization: Bearer <token>`. This is a different token format than the Node JWTs — clients pointed at Laravel must use Laravel's login response.
5. Run `php artisan serve` from `laravel-rapido/` to boot the Laravel API (default `:8000`, all routes under `/api`).

---

## File Locations Reference

| Item | Path |
|------|------|
| SQL Migration | `D:\code\project\rapido-clone\DATABASE_MIGRATION_v2.sql` |
| Backend .env | `D:\code\project\rapido-clone\backend\.env` |
| Backend entry | `D:\code\project\rapido-clone\backend\src\server.js` |
| Admin panel | `D:\code\project\rapido-clone\WebsiteFrontend\` |
| UserApp | `D:\code\project\rapido-clone\UserApp\` |
| RiderApp | `D:\code\project\rapido-clone\RiderApp\` |
| Laravel API (parity port) | `D:\code\project\rapido-clone\laravel-rapido\` |
| This doc | `D:\code\project\rapido-clone\HANDOVER.md` |
