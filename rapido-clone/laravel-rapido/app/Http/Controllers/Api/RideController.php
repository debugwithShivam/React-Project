<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\User;
use Illuminate\Http\Request;

class RideController extends Controller
{
    /**
     * Estimate fare for different vehicle categories
     */
    public function estimate(Request $request)
    {
        $distanceKm = floatval($request->distance ?? 6.4);

        $fares = [
            'bike' => [
                'name' => 'Bike Taxi',
                'base' => 38,
                'total' => round(38 + ($distanceKm * 9)),
                'eta' => '2-4 mins',
            ],
            'auto' => [
                'name' => 'City Auto',
                'base' => 59,
                'total' => round(59 + ($distanceKm * 14)),
                'eta' => '3-5 mins',
            ],
            'cab_mini' => [
                'name' => 'Cab Mini',
                'base' => 115,
                'total' => round(115 + ($distanceKm * 18)),
                'eta' => '4-6 mins',
            ],
            'cab_premium' => [
                'name' => 'Cab Prime Sedan',
                'base' => 155,
                'total' => round(155 + ($distanceKm * 22)),
                'eta' => '5-7 mins',
            ],
        ];

        return response()->json([
            'success' => true,
            'distance_km' => $distanceKm,
            'estimates' => $fares,
        ]);
    }

    /**
     * Book a new ride
     */
    public function book(Request $request)
    {
        $request->validate([
            'pickup_title' => 'required|string',
            'drop_title' => 'required|string',
            'vehicle_type' => 'required|string',
            'fare' => 'required|numeric',
        ]);

        $user = $request->user();

        // Find available driver or assign null/first driver
        $driver = User::where('role', 'DRIVER')->where('is_active', true)->first();

        $ride = Ride::create([
            'user_id' => $user->id,
            'driver_id' => $driver ? $driver->id : null,
            'pickup_title' => $request->pickup_title,
            'pickup_address' => $request->pickup_address ?? $request->pickup_title,
            'drop_title' => $request->drop_title,
            'drop_address' => $request->drop_address ?? $request->drop_title,
            'vehicle_type' => $request->vehicle_type,
            'distance' => $request->distance ?? '6.4 km',
            'duration' => $request->duration ?? '18 mins',
            'fare' => $request->fare,
            'otp' => (string) rand(1000, 9999),
            'status' => 'ACCEPTED',
            'payment_method' => $request->payment_method ?? 'WALLET',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Captain assigned! Ride booked successfully.',
            'ride' => $ride->load('driver'),
        ], 201);
    }

    /**
     * Get user rides history
     */
    public function myRides(Request $request)
    {
        $user = $request->user();

        $rides = Ride::where('user_id', $user->id)
            ->orWhere('driver_id', $user->id)
            ->with(['driver', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'rides' => $rides,
        ]);
    }

    /**
     * Cancel a ride
     */
    public function cancel(Request $request, $id)
    {
        $ride = Ride::findOrFail($id);
        $ride->status = 'CANCELLED';
        $ride->save();

        return response()->json([
            'success' => true,
            'message' => 'Ride cancelled.',
            'ride' => $ride,
        ]);
    }

    /**
     * Submit rating
     */
    public function rate(Request $request, $id)
    {
        $ride = Ride::findOrFail($id);
        $ride->rating = $request->rating ?? 5;
        $ride->save();

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your rating!',
            'ride' => $ride,
        ]);
    }
}
