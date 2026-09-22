<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Gen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    private function profile(int $userId): ?object
    {
        return DB::table('users')
            ->where('id', $userId)
            ->first(['id', 'name', 'phone', 'email', 'role', 'profile_image', 'is_active', 'wallet_balance', 'rating_avg', 'rating_count', 'referral_code', 'city', 'created_at', 'updated_at']);
    }

    public function me(Request $request)
    {
        $user = $this->profile($request->user()->id);
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        return response()->json(['success' => true, 'user' => $user]);
    }

    public function update(Request $request)
    {
        $fields = $request->only(['name', 'email', 'phone', 'city']);
        if ($request->hasFile('profileImage')) {
            $file = $request->file('profileImage');
            $fields['profile_image'] = 'data:'.$file->getMimeType().';base64,'.base64_encode(file_get_contents($file->getRealPath()));
        } elseif ($request->filled('profile_image')) {
            $fields['profile_image'] = $request->input('profile_image');
        }
        if ($fields) {
            $fields['updated_at'] = now();
            DB::table('users')->where('id', $request->user()->id)->update($fields);
        }

        return response()->json(['success' => true, 'user' => $this->profile($request->user()->id)]);
    }

    public function saveFcm(Request $request)
    {
        $token = $request->input('token');
        if (! $token) {
            return response()->json(['success' => false, 'message' => 'token required'], 400);
        }
        DB::table('users')->where('id', $request->user()->id)->update(['fcm_token' => $token]);

        return response()->json(['success' => true]);
    }

    public function referralCode(Request $request)
    {
        $userId = $request->user()->id;
        $row = DB::table('users')->where('id', $userId)->first(['name', 'referral_code']);
        $code = $row->referral_code;
        if (! $code) {
            $code = Gen::referralCode((string) $row->name);
            DB::table('users')->where('id', $userId)->update(['referral_code' => $code]);
        }

        return response()->json(['success' => true, 'referralCode' => $code]);
    }
}
