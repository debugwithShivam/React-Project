<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'phone',
        'email',
        'password_hash',
        'role',
        'profile_image',
        'is_active',
        'wallet_balance',
        'rating_avg',
        'rating_count',
        'referral_code',
        'fcm_token',
        'city',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'wallet_balance' => 'float',
        'rating_avg' => 'float',
        'rating_count' => 'integer',
    ];

    /**
     * Get password for authentication
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * Relationship to Driver profile
     */
    public function driver()
    {
        return $this->hasOne(Driver::class, 'user_id');
    }

    /**
     * Relationship to Booked rides
     */
    public function rides()
    {
        return $this->hasMany(Ride::class, 'user_id');
    }
}
