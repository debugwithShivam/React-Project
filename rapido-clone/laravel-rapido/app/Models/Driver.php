<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $table = 'drivers';

    protected $fillable = [
        'user_id',
        'city',
        'vehicle_type',
        'vehicle_model',
        'vehicle_plate',
        'driving_license',
        'aadhaar_number',
        'payout_upi',
        'status',
        'is_online',
        'current_lat',
        'current_lng',
        'last_location_update',
        'rating_avg',
        'rating_count',
        'total_rides',
        'total_earnings',
        'wallet_balance',
        'fcm_token',
        'rejection_reason',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'current_lat' => 'float',
        'current_lng' => 'float',
        'rating_avg' => 'float',
        'rating_count' => 'integer',
        'total_rides' => 'integer',
        'total_earnings' => 'float',
        'wallet_balance' => 'float',
        'last_location_update' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function documents()
    {
        return $this->hasMany(DriverDocument::class, 'driver_id');
    }
}
