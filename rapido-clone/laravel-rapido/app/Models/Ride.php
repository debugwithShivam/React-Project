<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
    use HasFactory;

    protected $table = 'rides';

    protected $fillable = [
        'user_id',
        'driver_id',
        'pickup_title',
        'pickup_address',
        'drop_title',
        'drop_address',
        'vehicle_type',
        'distance',
        'duration',
        'fare',
        'otp',
        'status',
        'payment_method',
        'rating',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
