<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
    use HasFactory;

    protected $table = 'rides';

    protected $guarded = ['id'];

    protected $casts = [
        'pickup_lat' => 'float',
        'pickup_lng' => 'float',
        'dropoff_lat' => 'float',
        'dropoff_lng' => 'float',
        'estimated_fare' => 'float',
        'final_fare' => 'float',
        'distance_km' => 'float',
        'discount_amount' => 'float',
        'commission_amount' => 'float',
        'driver_earnings' => 'float',
        'cancellation_charges' => 'float',
        'is_scheduled' => 'boolean',
        'is_sos' => 'boolean',
        'scheduled_at' => 'datetime',
        'accepted_at' => 'datetime',
        'arrived_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Assigned driver profile (drivers table), not the users row.
     */
    public function driverProfile()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }

    /**
     * Legacy relation kept so existing admin eager-loads resolve.
     */
    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }
}
