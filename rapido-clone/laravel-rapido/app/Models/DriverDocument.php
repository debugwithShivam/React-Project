<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverDocument extends Model
{
    use HasFactory;

    protected $table = 'driver_documents';

    protected $fillable = [
        'driver_id',
        'document_type',
        'document_side',
        'file_name',
        'file_data',
        'verification_status',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id');
    }
}
