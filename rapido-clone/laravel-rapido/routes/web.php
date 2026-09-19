<?php

use Illuminate\Support\Facades\Route;

// Catch-all route to serve the React SPA for any client-side routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
