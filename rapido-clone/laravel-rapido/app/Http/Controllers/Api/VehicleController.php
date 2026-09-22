<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\City;
use App\Services\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function vehicles(Request $request)
    {
        return response()->json([
            'success' => true,
            'vehicles' => Vehicle::listAll($request->query('includeInactive') === 'true'),
        ]);
    }

    public function cities(Request $request)
    {
        return response()->json([
            'success' => true,
            'cities' => City::listAll($request->query('includeInactive') === 'true'),
        ]);
    }
}
