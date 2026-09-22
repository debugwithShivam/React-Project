<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Fare;
use App\Services\Matching;
use App\Services\Ride as RideService;
use Illuminate\Http\Request;
use Throwable;

class RideController extends Controller
{
    private function fail(Throwable $e, int $status = 400)
    {
        return response()->json(['success' => false, 'message' => $e->getMessage()], $status);
    }

    public function fareEstimate(Request $request)
    {
        $q = $request->query();
        if (empty($q['pickupLat']) || empty($q['pickupLng']) || empty($q['dropoffLat']) || empty($q['dropoffLng'])) {
            return response()->json(['success' => false, 'message' => 'Coordinates required'], 400);
        }
        if (! empty($q['vehicleType'])) {
            $est = Fare::calculate($q['vehicleType'], $q['pickupLat'], $q['pickupLng'], $q['dropoffLat'], $q['dropoffLng']);

            return response()->json(['success' => true, 'estimate' => $est]);
        }
        $estimates = Fare::estimateAll($q['pickupLat'], $q['pickupLng'], $q['dropoffLat'], $q['dropoffLng']);

        return response()->json(['success' => true, 'estimates' => $estimates]);
    }

    public function nearbyVehicles(Request $request)
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        if ($lat === null || $lng === null) {
            return response()->json(['success' => false, 'message' => 'lat,lng required'], 400);
        }
        $radiusKm = (float) $request->query('radiusKm', 5);
        $vehicleType = $request->query('vehicleType');
        $drivers = Matching::findNearbyDrivers($lat, $lng, $radiusKm, $vehicleType, 100);

        $counts = [];
        foreach ($drivers as $d) {
            $k = strtoupper((string) ($d->vehicle_type ?? $d->vt_code ?? 'OTHER'));
            $counts[$k] = ($counts[$k] ?? 0) + 1;
        }

        return response()->json(['success' => true, 'drivers' => $drivers, 'counts' => (object) $counts, 'total' => count($drivers)]);
    }

    public function store(Request $request)
    {
        $b = $request->all();
        if (empty($b['pickupAddress']) || empty($b['dropoffAddress']) || empty($b['vehicleType'])) {
            return response()->json(['success' => false, 'message' => 'pickupAddress, dropoffAddress, vehicleType required'], 400);
        }
        try {
            $ride = RideService::create([
                'userId' => $request->user()->id,
                'pickupAddress' => $b['pickupAddress'],
                'pickupLat' => $b['pickupLat'] ?? null,
                'pickupLng' => $b['pickupLng'] ?? null,
                'dropoffAddress' => $b['dropoffAddress'],
                'dropoffLat' => $b['dropoffLat'] ?? null,
                'dropoffLng' => $b['dropoffLng'] ?? null,
                'vehicleType' => $b['vehicleType'],
                'estimatedFare' => $b['estimatedFare'] ?? null,
                'paymentMethod' => $b['paymentMethod'] ?? 'CASH',
                'couponCode' => $b['couponCode'] ?? null,
                'scheduledAt' => $b['scheduledAt'] ?? null,
            ]);

            return response()->json(['success' => true, 'ride' => $ride], 201);
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function myRides(Request $request)
    {
        $rides = RideService::forUser($request->user()->id, $request->query('status'), (int) $request->query('limit', 50));

        return response()->json(['success' => true, 'rides' => $rides]);
    }

    public function active(Request $request)
    {
        return response()->json(['success' => true, 'ride' => RideService::activeForUser($request->user()->id)]);
    }

    public function show(Request $request, int $id)
    {
        $ride = RideService::getById($id);
        if (! $ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }
        if ((int) $ride->user_id !== $request->user()->id && $request->user()->role !== 'ADMIN') {
            $driver = \App\Services\Driver::getByUserId($request->user()->id);
            if (! $driver || (int) $driver->id !== (int) $ride->driver_id) {
                return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
            }
        }

        return response()->json(['success' => true, 'ride' => $ride]);
    }

    public function receipt(Request $request, int $id)
    {
        try {
            return response()->json(array_merge(['success' => true], RideService::receipt($id, $request->user()->id)));
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function events(int $id)
    {
        return response()->json(['success' => true, 'events' => RideService::events($id)]);
    }

    public function contactDriver(Request $request, int $id)
    {
        try {
            return response()->json(array_merge(['success' => true], RideService::contactDriver($id, $request->user()->id)));
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function share(Request $request, int $id)
    {
        try {
            return response()->json(array_merge(['success' => true], RideService::shareLink($id, $request->user()->id)));
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function cancel(Request $request, int $id)
    {
        try {
            $result = RideService::cancel($id, $request->user()->id, $request->input('reason'));

            return response()->json(array_merge(['success' => true], $result));
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function sos(Request $request, int $id)
    {
        try {
            $result = RideService::triggerSos($id, $request->user()->id, $request->input('lat'), $request->input('lng'));

            return response()->json(array_merge(['success' => true], $result), 201);
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function pay(Request $request, int $id)
    {
        try {
            $result = RideService::pay($id, $request->user()->id, (string) $request->input('method'));

            return response()->json(array_merge(['success' => true], $result));
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }
}
