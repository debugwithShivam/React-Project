<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user or captain/driver
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'phone' => 'required|string',
            'email' => 'nullable|email|max:150',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:USER,DRIVER,ADMIN,user,captain',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Clean phone number: take last 10 digits
        $cleanPhone = preg_replace('/[^0-9]/', '', $request->phone);
        if (strlen($cleanPhone) > 10) {
            $cleanPhone = substr($cleanPhone, -10);
        }

        if (strlen($cleanPhone) !== 10) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid 10-digit mobile phone number.',
            ], 422);
        }

        // Check if phone or email already registered
        $existingPhone = User::where('phone', $cleanPhone)->first();
        if ($existingPhone) {
            return response()->json([
                'success' => false,
                'message' => 'This mobile phone number is already registered. Please login.',
            ], 400);
        }

        if ($request->email) {
            $existingEmail = User::where('email', $request->email)->first();
            if ($existingEmail) {
                return response()->json([
                    'success' => false,
                    'message' => 'This email address is already registered. Please login.',
                ], 400);
            }
        }

        $assignedRole = 'USER';
        $inputRole = strtoupper($request->role ?? 'USER');
        if ($inputRole === 'CAPTAIN' || $inputRole === 'DRIVER') {
            $assignedRole = 'DRIVER';
        }

        $user = User::create([
            'name' => $request->name,
            'phone' => $cleanPhone,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'role' => $assignedRole,
            'is_active' => true,
        ]);

        // If driver/captain, create driver profile
        if ($assignedRole === 'DRIVER') {
            Driver::create([
                'user_id' => $user->id,
                'city' => $request->city ?? 'Bangalore',
                'vehicle_type' => $request->vehicleType ?? 'bike',
                'vehicle_model' => $request->vehicleModel ?? 'Hero Splendor',
                'vehicle_plate' => $request->vehiclePlate ?? ('KA ' . rand(10, 99) . ' EX ' . rand(1000, 9999)),
                'driving_license' => $request->drivingLicense ?? ('DL' . rand(10000000, 99999999)),
                'aadhaar_number' => $request->aadhaarNumber ?? null,
                'payout_upi' => $request->payoutUpi ?? null,
                'status' => 'APPROVED',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Welcome to Sawaari.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image' => $user->profile_image,
                'is_active' => $user->is_active,
            ],
            'token' => $token,
            'accessToken' => $token,
        ], 201);
    }

    /**
     * User / Captain / Admin Login
     */
    public function login(Request $request)
    {
        $identifier = $request->identifier ?? $request->email ?? $request->phone;
        $password = $request->password;

        if (!$identifier || !$password) {
            return response()->json([
                'success' => false,
                'message' => 'Email or mobile number and password are required.',
            ], 422);
        }

        // Clean phone digits if identifier looks numeric
        $cleanPhone = preg_replace('/[^0-9]/', '', $identifier);
        if (strlen($cleanPhone) > 10) {
            $cleanPhone = substr($cleanPhone, -10);
        }

        // Find user by email or phone
        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->when(strlen($cleanPhone) === 10, function ($query) use ($cleanPhone) {
                return $query->orWhere('phone', $cleanPhone);
            })
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email or mobile number.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        $storedHash = $user->getRawOriginal('password_hash');
        if (is_string($storedHash) && str_starts_with($storedHash, '$2b$')) {
            $storedHash = '$2y$' . substr($storedHash, 4);
        }

        $passwordMatches = false;
        try {
            $passwordMatches = is_string($storedHash) && Hash::check($password, $storedHash);
        } catch (\InvalidArgumentException $exception) {
            $passwordMatches = false;
        }

        if (!$passwordMatches) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password. Please try again.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image' => $user->profile_image,
                'is_active' => $user->is_active,
            ],
            'token' => $token,
            'accessToken' => $token,
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get Current Authenticated User Profile
     */
    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $driver = null;
        if ($user->role === 'DRIVER') {
            $driver = Driver::where('user_id', $user->id)->first();
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image' => $user->profile_image,
                'is_active' => $user->is_active,
                'driver_profile' => $driver,
            ],
        ]);
    }

    /**
     * Refresh Token
     */
    public function refreshToken(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid token'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'success' => true,
            'accessToken' => $token,
            'token' => $token,
        ]);
    }
}
