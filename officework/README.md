# AIMEDIX MEDS Backend

PHP/MySQL backend for the AIMEDIX MEDS website, customer application, medical administration and pharmacy portal, deployed on Hostinger. This `hostinger/` tree is the sole production backend; the root `backend/` tree is legacy reference code and is non-deployable.

## Hostinger

Deploy only the contents of this directory. Never upload, package, or copy the root `backend/` tree into production.

1. Upload the contents of `hostinger/` to `public_html`, including both `.htaccess` files.
2. Create `.env` from `.env.hostinger.example`. Replace every placeholder with Hostinger MySQL credentials, a random app key, and unique admin credentials.
3. Run `php scripts/setup_mysql.php` from Hostinger SSH, or import `database/schema_mysql.sql` and then run `php scripts/migrate.php`.
4. Point the domain document root to `public/` when Hostinger permits it. The root `.htaccess` safely supports installations that must use `public_html` directly.
5. Confirm PHP has PDO MySQL and fileinfo enabled, HTTPS is active, and `storage/private` is writable but not web-accessible.
6. Open `/admin/health` and resolve every production warning before accepting traffic.

Production keeps `APP_ENV=production`. Every enabled, live, or production payment webhook requires a configured secret and valid `X-Webhook-Signature` (HMAC-SHA256) header. Unsigned webhook testing is limited to an explicitly configured local/test app with online payment disabled.

Anonymous e-commerce and medical clients must persist the `guest_id` and `guest_credential` returned by the first API response, then send them as `guest_id` and `customer_token` (or `X-Guest-Credential`) on later cart, checkout, order, support, refund, notification, review, wishlist, and device-token calls. A caller-chosen `guest_id` is never an identity credential.

Do not import demo SQL or use example credentials in production.

Routes:

- `/` — public medical website
- `/api/v1/medical` — customer API
- `/admin/login` — AIMEDIX MEDS admin
- `/vendor/login` — pharmacy partner portal
- `/medical-compliance` — compliance page

The medical module reuses shared commerce, payment, customer, zone, wallet, refund and support controllers from the updated foundation. The standalone operational navigation exposes Medical and shared system controls only.
