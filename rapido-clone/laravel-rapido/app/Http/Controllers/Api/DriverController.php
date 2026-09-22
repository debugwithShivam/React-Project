<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Driver as DriverService;
use App\Services\Matching;
use App\Services\Ride as RideService;
use Illuminate\Http\Request;
use Throwable;

class DriverController extends Controller
{
    private function fail(Throwable $e, int $status = 400)
    {
        return response()->json(['success' => false, 'message' => $e->getMessage()], $status);
    }

    public function toggleOnline(Request $request)
    {
        try {
            $result = DriverService::toggleOnline(
                $request->user()->id,
                (bool) $request->input('isOnline'),
                $request->input('lat'),
                $request->input('lng')
            );

            return response()->json(array_merge(['success' => true], $result));
        } catch (Throwable $e) {
            return $this->fail($e, 403);
        }
    }

    public function updateLocation(Request $request)
    {
        try {
            DriverService::updateLocation($request->user()->id, $request->input('lat'), $request->input('lng'));

            return response()->json(['success' => true]);
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function profile(Request $request)
    {
        $driver = DriverService::getByUserId($request->user()->id);
        if (! $driver) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found'], 404);
        }

        return response()->json(['success' => true, 'driver' => $driver]);
    }

    public function updateProfile(Request $request)
    {
        $driver = DriverService::updateProfile($request->user()->id, $request->all());

        return response()->json(['success' => true, 'driver' => $driver]);
    }

    public function listDocuments(Request $request)
    {
        return response()->json(['success' => true, 'documents' => DriverService::listDocuments($request->user()->id)]);
    }

    public function uploadDocument(Request $request)
    {
        try {
            $result = DriverService::uploadDocument(
                $request->user()->id,
                $request->input('documentType'),
                $request->input('documentSide'),
                $request->file('file')
            );

            return response()->json(array_merge(['success' => true], $result), 201);
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function nearbyRideRequests(Request $request)
    {
        $rides = DriverService::listNearbyRideRequests($request->user()->id, (float) $request->query('radiusKm', 5));

        return response()->json(['success' => true, 'rides' => $rides]);
    }

    public function nearbyDrivers(Request $request)
    {
        $drivers = Matching::findNearbyDrivers(
            $request->query('lat'), $request->query('lng'),
            (float) $request->query('radiusKm', 5), $request->query('vehicleType')
        );

        return response()->json(['success' => true, 'drivers' => $drivers]);
    }

    public function activeRide(Request $request)
    {
        return response()->json(['success' => true, 'ride' => RideService::activeForDriver($request->user()->id)]);
    }

    public function acceptRide(Request $request, int $rideId)
    {
        try {
            return response()->json(array_merge(['success' => true], DriverService::acceptRide($request->user()->id, $rideId)));
        } catch (Throwable $e) {
            return $this->fail($e, 409);
        }
    }

    public function rejectRide(Request $request, int $rideId)
    {
        try {
            return response()->json(array_merge(['success' => true], DriverService::rejectRide($request->user()->id, $rideId, $request->input('reason'))));
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function markArrived(Request $request, int $rideId)
    {
        try {
            return response()->json(array_merge(['success' => true], DriverService::markArrived($request->user()->id, $rideId, $request->input('lat'), $request->input('lng'))));
        } catch (Throwable $e) {
            return $this->fail($e, 409);
        }
    }

    public function startRide(Request $request, int $rideId)
    {
        try {
            return response()->json(array_merge(['success' => true], DriverService::startRide($request->user()->id, $rideId, $request->input('otp'))));
        } catch (Throwable $e) {
            return $this->fail($e, 409);
        }
    }

    public function completeRide(Request $request, int $rideId)
    {
        try {
            return response()->json(array_merge(['success' => true], DriverService::completeRide(
                $request->user()->id, $rideId,
                $request->input('finalFare'), $request->input('distanceKm'), $request->input('durationMin')
            )));
        } catch (Throwable $e) {
            return $this->fail($e, 409);
        }
    }

    public function cancelRide(Request $request, int $rideId)
    {
        try {
            return response()->json(array_merge(['success' => true], DriverService::cancelRide($request->user()->id, $rideId, $request->input('reason'))));
        } catch (Throwable $e) {
            return $this->fail($e, 409);
        }
    }

    public function trips(Request $request)
    {
        $trips = DriverService::listTrips(
            $request->user()->id, $request->query('status'),
            (int) $request->query('limit', 50), (int) $request->query('offset', 0)
        );

        return response()->json(['success' => true, 'trips' => $trips]);
    }

    public function earnings(Request $request)
    {
        try {
            return response()->json(['success' => true, 'earnings' => DriverService::earnings($request->user()->id, $request->query('from'), $request->query('to'))]);
        } catch (Throwable $e) {
            return $this->fail($e, 404);
        }
    }
}
