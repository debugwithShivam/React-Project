<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\MiscController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RideController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public endpoints
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Public dynamic pages
Route::get('/pages', [MiscController::class, 'publicPages']);
Route::get('/pages/{slug}', [MiscController::class, 'publicPage']);

// Public vehicles + cities
Route::get('/vehicles', [VehicleController::class, 'vehicles']);
Route::get('/cities', [VehicleController::class, 'cities']);

// Razorpay config + webhook (public)
Route::get('/config', [PaymentController::class, 'config']);
Route::post('/webhooks/razorpay', [PaymentController::class, 'webhook']);

/*
|--------------------------------------------------------------------------
| Authenticated endpoints
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth self
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/profile', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh-token', [AuthController::class, 'refreshToken']);
    Route::post('/auth/refreshToken', [AuthController::class, 'refreshToken']);
    Route::middleware('admin')->post('/auth/changeAdminPassword', [AuthController::class, 'changeAdminPassword']);

    // User profile
    Route::prefix('users')->group(function () {
        Route::get('/me', [UserController::class, 'me']);
        Route::match(['put', 'patch'], '/me', [UserController::class, 'update']);
        Route::post('/me/fcm-token', [UserController::class, 'saveFcm']);
        Route::get('/me/referral-code', [UserController::class, 'referralCode']);
    });

    // Rides (specific paths first, then :id)
    Route::get('/rides/fare-estimate', [RideController::class, 'fareEstimate']);
    Route::get('/rides/nearby-vehicles', [RideController::class, 'nearbyVehicles']);
    Route::post('/rides', [RideController::class, 'store'])->middleware('role:USER,ADMIN');
    Route::get('/rides/my', [RideController::class, 'myRides']);
    Route::get('/rides/active', [RideController::class, 'active']);
    Route::get('/rides/{id}', [RideController::class, 'show'])->whereNumber('id');
    Route::get('/rides/{id}/receipt', [RideController::class, 'receipt'])->whereNumber('id');
    Route::get('/rides/{id}/events', [RideController::class, 'events'])->whereNumber('id');
    Route::get('/rides/{id}/contact-driver', [RideController::class, 'contactDriver'])->whereNumber('id');
    Route::get('/rides/{id}/share', [RideController::class, 'share'])->whereNumber('id');
    Route::match(['put', 'patch'], '/rides/{id}/cancel', [RideController::class, 'cancel'])->whereNumber('id');
    Route::post('/rides/{id}/sos', [RideController::class, 'sos'])->whereNumber('id');
    Route::post('/rides/{id}/pay', [RideController::class, 'pay'])->whereNumber('id');

    // Payments + wallet
    Route::post('/order', [PaymentController::class, 'createOrder']);
    Route::post('/verify', [PaymentController::class, 'verify']);
    Route::get('/history', [PaymentController::class, 'history']);
    Route::get('/wallet', [PaymentController::class, 'wallet']);
    Route::get('/wallet/transactions', [PaymentController::class, 'walletTransactions']);

    // Coupons
    Route::post('/coupons/validate', [MiscController::class, 'validateCoupon']);
    Route::get('/coupons/mine', [MiscController::class, 'myCoupons']);

    // Ratings
    Route::post('/ratings', [MiscController::class, 'submitRating']);
    Route::get('/ratings/mine', [MiscController::class, 'myRatings']);

    // Complaints / support
    Route::post('/complaints', [MiscController::class, 'createComplaint']);
    Route::get('/complaints/mine', [MiscController::class, 'myComplaints']);

    // Notifications
    Route::get('/notifications', [MiscController::class, 'listNotifications']);
    Route::match(['put', 'patch'], '/notifications/read-all', [MiscController::class, 'markAllRead']);
    Route::match(['put', 'patch'], '/notifications/{id}/read', [MiscController::class, 'markRead'])->whereNumber('id');
    Route::delete('/notifications/{id}', [MiscController::class, 'deleteNotification'])->whereNumber('id');

    // Payouts (driver)
    Route::post('/payouts/request', [MiscController::class, 'requestPayout']);
    Route::get('/payouts/mine', [MiscController::class, 'myPayouts']);

    /*
    |----------------------------------------------------------------------
    | Driver / Captain endpoints
    |----------------------------------------------------------------------
    */
    Route::middleware('role:DRIVER,ADMIN')->prefix('driver')->group(function () {
        Route::post('/online', [DriverController::class, 'toggleOnline']);
        Route::post('/location', [DriverController::class, 'updateLocation']);

        Route::get('/profile', [DriverController::class, 'profile']);
        Route::match(['put', 'patch'], '/profile', [DriverController::class, 'updateProfile']);

        Route::get('/documents', [DriverController::class, 'listDocuments']);
        Route::post('/documents', [DriverController::class, 'uploadDocument']);

        Route::get('/rides/nearby', [DriverController::class, 'nearbyRideRequests']);
        Route::get('/rides/active', [DriverController::class, 'activeRide']);
        Route::post('/rides/{rideId}/accept', [DriverController::class, 'acceptRide'])->whereNumber('rideId');
        Route::post('/rides/{rideId}/reject', [DriverController::class, 'rejectRide'])->whereNumber('rideId');
        Route::post('/rides/{rideId}/arrive', [DriverController::class, 'markArrived'])->whereNumber('rideId');
        Route::post('/rides/{rideId}/start', [DriverController::class, 'startRide'])->whereNumber('rideId');
        Route::post('/rides/{rideId}/complete', [DriverController::class, 'completeRide'])->whereNumber('rideId');
        Route::post('/rides/{rideId}/cancel', [DriverController::class, 'cancelRide'])->whereNumber('rideId');

        Route::get('/trips', [DriverController::class, 'trips']);
        Route::get('/earnings', [DriverController::class, 'earnings']);
    });
});

/*
|--------------------------------------------------------------------------
| Admin endpoints
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/drivers', [AdminController::class, 'listDrivers']);
    Route::get('/drivers/{id}', [AdminController::class, 'driverDetails']);
    Route::patch('/drivers/{id}/review', [AdminController::class, 'reviewDriver']);
    Route::patch('/drivers/documents/{docId}/review', [AdminController::class, 'reviewDocument']);
    Route::get('/drivers/documents/{docId}/blob', [AdminController::class, 'documentBlob']);
    Route::get('/rides', [AdminController::class, 'listAllRides']);
    Route::get('/rides/{id}', [AdminController::class, 'rideDetail']);
    Route::patch('/rides/{id}/cancel', [AdminController::class, 'cancelRide']);
    Route::get('/users', [AdminController::class, 'listUsers']);
    Route::get('/users/{id}', [AdminController::class, 'userDetail']);
    Route::patch('/users/{id}/toggle-active', [AdminController::class, 'toggleUser']);
    Route::patch('/users/{id}', [AdminController::class, 'updateUser']);
    Route::post('/users/{id}/wallet', [AdminController::class, 'adjustWallet']);
    Route::get('/coupons', [AdminController::class, 'coupons']);
    Route::post('/coupons', [AdminController::class, 'createCoupon']);
    Route::patch('/coupons/{id}', [AdminController::class, 'updateCoupon']);
    Route::delete('/coupons/{id}', [AdminController::class, 'deleteCoupon']);
    Route::get('/ratings', [AdminController::class, 'ratings']);
    Route::delete('/ratings/{id}', [AdminController::class, 'deleteRating']);
    Route::get('/complaints', [AdminController::class, 'complaints']);
    Route::get('/complaints/{id}', [AdminController::class, 'complaint']);
    Route::patch('/complaints/{id}', [AdminController::class, 'updateComplaint']);
    Route::delete('/complaints/{id}', [AdminController::class, 'deleteComplaint']);
    Route::get('/notifications', [AdminController::class, 'notifications']);
    Route::post('/notifications/send', [AdminController::class, 'sendNotification']);
    Route::get('/settings', [AdminController::class, 'settings']);
    Route::patch('/settings', [AdminController::class, 'updateSettings']);
    Route::put('/settings/bulk', [AdminController::class, 'updateSettings']);
    Route::get('/pages', [AdminController::class, 'pages']);
    Route::get('/pages/{slugOrId}', [AdminController::class, 'page']);
    Route::put('/pages', [AdminController::class, 'upsertPage']);
    Route::delete('/pages/{id}', [AdminController::class, 'deletePage']);
    Route::get('/vehicle-types', [AdminController::class, 'vehicleTypes']);
    Route::post('/vehicle-types', [AdminController::class, 'createVehicleType']);
    Route::patch('/vehicle-types/{id}', [AdminController::class, 'updateVehicleType']);
    Route::delete('/vehicle-types/{id}', [AdminController::class, 'deleteVehicleType']);
    Route::get('/cities', [AdminController::class, 'cities']);
    Route::post('/cities', [AdminController::class, 'createCity']);
    Route::patch('/cities/{id}', [AdminController::class, 'updateCity']);
    Route::delete('/cities/{id}', [AdminController::class, 'deleteCity']);
    Route::get('/payments', [AdminController::class, 'payments']);
    Route::post('/payments/{id}/refund', [AdminController::class, 'refundPayment']);
    Route::get('/payouts', [AdminController::class, 'payouts']);
    Route::patch('/payouts/{id}', [AdminController::class, 'processPayout']);
    Route::get('/reports/revenue', [AdminController::class, 'revenueReport']);
    Route::get('/reports/rides-by-status', [AdminController::class, 'ridesByStatus']);
    Route::get('/sos', [AdminController::class, 'sos']);
    Route::patch('/sos/{id}', [AdminController::class, 'resolveSos']);

    // Legacy Laravel admin endpoints kept for existing pages.
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/rides-legacy', [AdminController::class, 'rides']);
    Route::put('/users/{id}/status', [AdminController::class, 'toggleUserStatus']);
    Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
});
