<?php

namespace App\Support;

class Gen
{
    public static function rideOtp(): string
    {
        return (string) random_int(1000, 9999);
    }

    public static function referralCode(string $name = ''): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $name) ?: '', 0, 4)) ?: 'SAW';
        $suffix = strtoupper(substr(bin2hex(random_bytes(4)), 0, 5));

        return $prefix.$suffix;
    }

    public static function referenceNumber(string $prefix = 'TXN'): string
    {
        return $prefix.'-'.round(microtime(true) * 1000).'-'.random_int(0, 999);
    }
}
