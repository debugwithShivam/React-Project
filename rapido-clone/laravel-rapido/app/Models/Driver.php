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
