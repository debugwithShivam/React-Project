<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\RideController;

// Public Auth Endpoints
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Fare estimate (public)
Route::post('/rides/estimate', [RideController::class, 'estimate']);

// Protected User Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/user/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh-token', [AuthController::class, 'refreshToken']);

    // Ride operations
    Route::post('/rides/book', [RideController::class, 'book']);
    Route::get('/rides/my-rides', [RideController::class, 'myRides']);
    Route::post('/rides/{id}/cancel', [RideController::class, 'cancel']);
    Route::post('/rides/{id}/rate', [RideController::class, 'rate']);
});

// Admin Operations
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/drivers', [AdminController::class, 'drivers']);
    Route::put('/users/{id}/status', [AdminController::class, 'toggleUserStatus']);
    Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/rides', [AdminController::class, 'rides']);
});
