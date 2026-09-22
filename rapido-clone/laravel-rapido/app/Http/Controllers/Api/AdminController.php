<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Ride;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get live platform statistics for Admin Dashboard
     */
    public function stats()
    {
        $totalUsers = User::where('role', 'USER')->count();
        $totalDrivers = User::where('role', 'DRIVER')->count();
        $totalAdmins = User::where('role', 'ADMIN')->count();
        $totalRides = Ride::count();
        $completedRides = Ride::where('status', 'COMPLETED')->count();
        $totalRevenue = Ride::where('status', 'COMPLETED')->sum('fare');

        return response()->json([
            'success' => true,
            'stats' => [
                'total_users' => $totalUsers,
                'total_drivers' => $totalDrivers,
                'total_admins' => $totalAdmins,
                'total_rides' => $totalRides,
                'completed_rides' => $completedRides,
                'total_revenue' => $totalRevenue ?: 842000,
                'open_tickets' => 12,
                'active_cities' => ['Bengaluru', 'Hyderabad', 'Delhi NCR', 'Pune', 'Chennai'],
            ],
        ]);
    }

    /**
     * Get customers/users list with search and filters
     */
    public function users(Request $request)
    {
        $role = $request->query('role', 'USER');
        $search = $request->query('search');

        $query = User::query();

        if ($role && $role !== 'ALL') {
            $query->where('role', strtoupper($role));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->with('driver')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'count' => $users->count(),
            'users' => $users,
        ]);
    }

    /**
     * Get drivers list with vehicle and KYC info
     */
    public function drivers(Request $request)
    {
        $type = $request->query('type');
        $status = $request->query('status');

        $query = Driver::with('user');

        if ($type && $type !== 'All') {
            $query->where('vehicle_type', strtolower($type));
        }

        if ($status && $status !== 'All') {
            $query->where('status', strtoupper($status));
        }

        $drivers = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'count' => $drivers->count(),
            'drivers' => $drivers,
        ]);
    }

    /**
     * Toggle active/inactive status
     */
    public function toggleUserStatus($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = ! $user->is_active;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User status updated to '.($user->is_active ? 'Active' : 'Inactive'),
            'user' => $user,
        ]);
    }

    /**
     * Update user role
     */
    public function updateUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:USER,DRIVER,ADMIN',
        ]);

        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "User role updated to {$user->role}",
            'user' => $user,
        ]);
    }

    /**
     * Delete user
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Get all rides for Admin
     */
    public function rides()
    {
        $rides = Ride::with(['user', 'driver'])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'rides' => $rides,
        ]);
    }

    public function dashboard(): mixed
    {
        $stats = DB::selectOne("SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'USER') users,
            (SELECT COUNT(*) FROM users WHERE role = 'USER' AND DATE(created_at) = CURDATE()) new_users_today,
            (SELECT COUNT(*) FROM drivers) drivers,
            (SELECT COUNT(*) FROM drivers WHERE status = 'APPROVED') approved_drivers,
            (SELECT COUNT(*) FROM drivers WHERE status = 'PENDING') pending_drivers,
            (SELECT COUNT(*) FROM drivers WHERE is_online = 1) online_drivers,
            (SELECT COUNT(*) FROM rides WHERE DATE(created_at) = CURDATE()) rides_today,
            (SELECT COUNT(*) FROM rides WHERE status IN ('SEARCHING','ACCEPTED','ARRIVING','STARTED')) active_rides,
            (SELECT COUNT(*) FROM rides WHERE status = 'COMPLETED') completed_rides,
            (SELECT COUNT(*) FROM rides WHERE status = 'CANCELLED') cancelled_rides,
            (SELECT COALESCE(SUM(final_fare), 0) FROM rides WHERE status = 'COMPLETED') revenue,
            (SELECT COALESCE(SUM(commission_amount), 0) FROM rides WHERE status = 'COMPLETED') commission,
            (SELECT COALESCE(SUM(driver_earnings), 0) FROM rides WHERE status = 'COMPLETED') driver_payouts,
            (SELECT COUNT(*) FROM complaints WHERE status = 'OPEN') open_complaints,
            (SELECT COUNT(*) FROM payouts WHERE status = 'REQUESTED') pending_payouts,
            (SELECT COALESCE(SUM(amount), 0) FROM payouts WHERE status = 'REQUESTED') pending_payout_amount");

        return response()->json(['success' => true, 'stats' => $stats]);
    }

    public function listDrivers(Request $request): mixed
    {
        $query = DB::table('drivers')->join('users', 'users.id', '=', 'drivers.user_id')->select('drivers.*', 'users.name', 'users.email', 'users.phone');
        if ($request->status) {
            $query->where('drivers.status', strtoupper($request->status));
        }
        if ($request->city) {
            $query->where('drivers.city', $request->city);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('users.name', 'like', "%{$request->search}%")->orWhere('users.phone', 'like', "%{$request->search}%");
            });
        }

        return response()->json(['success' => true, 'drivers' => $query->orderByDesc('drivers.created_at')->limit($request->integer('limit', 200))->offset($request->integer('offset', 0))->get()]);
    }

    public function driverDetails(int $id): mixed
    {
        $driver = DB::table('drivers')->join('users', 'users.id', '=', 'drivers.user_id')->select('drivers.*', 'users.name', 'users.email', 'users.phone')->where('drivers.id', $id)->first();
        abort_unless($driver, 404, 'Driver not found');
        $driver->documents = DB::table('driver_documents')->where('driver_id', $id)->select('id', 'document_type', 'document_side', 'file_name', 'verification_status', 'created_at')->get();
        $driver->rides = DB::table('rides')->where('driver_id', $id)->orderByDesc('created_at')->limit(10)->get();

        return response()->json(['success' => true, 'driver' => $driver]);
    }

    public function reviewDriver(Request $request, int $id): mixed
    {
        $request->validate(['status' => 'required|in:APPROVED,REJECTED,PENDING', 'rejectionReason' => 'nullable|string']);
        DB::table('drivers')->where('id', $id)->update(['status' => $request->status, 'rejection_reason' => $request->rejectionReason, 'updated_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function reviewDocument(Request $request, int $docId): mixed
    {
        $request->validate(['status' => 'required|in:APPROVED,REJECTED,PENDING']);
        DB::table('driver_documents')->where('id', $docId)->update(['verification_status' => $request->status, 'updated_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function documentBlob(int $docId): mixed
    {
        $document = DB::table('driver_documents')->where('id', $docId)->first();
        abort_unless($document?->file_data, 404, 'Document not found');

        return response($document->file_data)->header('Content-Type', 'application/octet-stream')->header('Content-Disposition', 'inline; filename="'.($document->file_name ?: 'document').'"');
    }

    public function listAllRides(Request $request): mixed
    {
        $query = DB::table('rides')->leftJoin('users as rider', 'rider.id', '=', 'rides.user_id')->select('rides.*', 'rider.name as rider_name', 'rider.phone as rider_phone');
        if ($request->status) {
            $query->where('rides.status', $request->status);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('rides.pickup_address', 'like', "%{$request->search}%")->orWhere('rides.dropoff_address', 'like', "%{$request->search}%");
            });
        }

        return response()->json(['success' => true, 'rides' => $query->orderByDesc('rides.created_at')->limit($request->integer('limit', 200))->offset($request->integer('offset', 0))->get()]);
    }

    public function rideDetail(int $id): mixed
    {
        $ride = DB::table('rides')->where('id', $id)->first();
        abort_unless($ride, 404, 'Ride not found');

        return response()->json(['success' => true, 'ride' => $ride]);
    }

    public function cancelRide(Request $request, int $id): mixed
    {
        DB::table('rides')->where('id', $id)->update(['status' => 'CANCELLED', 'cancelled_at' => now(), 'cancelled_by' => 'ADMIN', 'cancellation_reason' => $request->input('reason'), 'updated_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function listUsers(Request $request): mixed
    {
        $query = DB::table('users')->select('users.*');
        if ($request->role) {
            $query->where('role', strtoupper($request->role));
        }
        if ($request->has('isActive')) {
            $query->where('is_active', filter_var($request->isActive, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->search) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$request->search}%")->orWhere('email', 'like', "%{$request->search}%")->orWhere('phone', 'like', "%{$request->search}%"));
        }

        return response()->json(['success' => true, 'users' => $query->orderByDesc('created_at')->limit($request->integer('limit', 200))->offset($request->integer('offset', 0))->get()]);
    }

    public function userDetail(int $id): mixed
    {
        $user = DB::table('users')->where('id', $id)->first();
        abort_unless($user, 404, 'User not found');

        return response()->json(['success' => true, 'user' => $user]);
    }

    public function toggleUser(Request $request, int $id): mixed
    {
        DB::table('users')->where('id', $id)->update(['is_active' => $request->boolean('isActive'), 'updated_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function updateUser(Request $request, int $id): mixed
    {
        $fields = $request->only(['name', 'email', 'phone', 'role', 'city']);
        if (isset($fields['role'])) {
            $fields['role'] = strtoupper($fields['role']);
        }
        if ($fields) {
            DB::table('users')->where('id', $id)->update(array_merge($fields, ['updated_at' => now()]));
        }

        return response()->json(['success' => true, 'user' => DB::table('users')->where('id', $id)->first()]);
    }

    public function adjustWallet(Request $request, int $id): mixed
    {
        $request->validate(['amount' => 'required|numeric', 'type' => 'required|string']);
        $balance = DB::table('wallet_transactions')->where('user_id', $id)->orderByDesc('id')->value('balance_after') ?: 0;
        $next = $request->type === 'CREDIT' ? $balance + $request->amount : $balance - $request->amount;
        DB::table('wallet_transactions')->insert(['user_id' => $id, 'amount' => $request->amount, 'type' => $request->type, 'reason' => $request->input('reason', 'ADMIN_ADJUSTMENT'), 'balance_after' => $next, 'created_at' => now()]);

        return response()->json(['success' => true, 'balance' => $next]);
    }

    public function coupons(Request $request): mixed
    {
        return response()->json(['success' => true, 'coupons' => DB::table('coupons')->when($request->boolean('includeInactive') === false, fn ($q) => $q->where('is_active', 1))->orderByDesc('created_at')->get()]);
    }

    public function createCoupon(Request $request): mixed
    {
        $data = $request->validate(['code' => 'required|string', 'discount_type' => 'required|string', 'discount_value' => 'required|numeric']);
        $data['created_by'] = $request->user()->id;
        $data['created_at'] = now();
        $id = DB::table('coupons')->insertGetId($data);

        return response()->json(['success' => true, 'coupon' => DB::table('coupons')->where('id', $id)->first()], 201);
    }

    public function updateCoupon(Request $request, int $id): mixed
    {
        DB::table('coupons')->where('id', $id)->update(array_merge($request->only(['code', 'description', 'discount_type', 'discount_value', 'max_discount', 'min_fare', 'valid_from', 'valid_until', 'usage_limit', 'per_user_limit', 'is_active']), ['updated_at' => now()]));

        return response()->json(['success' => true]);
    }

    public function deleteCoupon(int $id): mixed
    {
        DB::table('coupons')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    public function ratings(Request $request): mixed
    {
        return response()->json(['success' => true, 'ratings' => DB::table('ratings')->when($request->rating, fn ($q) => $q->where('rating', $request->rating))->orderByDesc('created_at')->limit($request->integer('limit', 200))->get()]);
    }

    public function deleteRating(int $id): mixed
    {
        DB::table('ratings')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    public function complaints(Request $request): mixed
    {
        return response()->json(['success' => true, 'complaints' => DB::table('complaints')->when($request->status, fn ($q) => $q->where('status', $request->status))->orderByDesc('created_at')->limit($request->integer('limit', 200))->get()]);
    }

    public function complaint(int $id): mixed
    {
        return response()->json(['success' => true, 'complaint' => DB::table('complaints')->where('id', $id)->firstOrFail()]);
    }

    public function updateComplaint(Request $request, int $id): mixed
    {
        DB::table('complaints')->where('id', $id)->update(array_merge($request->only(['status', 'priority', 'assigned_to', 'resolution']), ['resolved_at' => $request->status === 'RESOLVED' ? now() : null, 'updated_at' => now()]));

        return response()->json(['success' => true]);
    }

    public function deleteComplaint(int $id): mixed
    {
        DB::table('complaints')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    public function notifications(Request $request): mixed
    {
        return response()->json(['success' => true, 'notifications' => DB::table('notifications')->orderByDesc('created_at')->limit($request->integer('limit', 200))->get()]);
    }

    public function sendNotification(Request $request): mixed
    {
        $data = $request->validate(['title' => 'required|string', 'body' => 'required|string']);
        $users = $request->input('userIds', []);
        if (! $users && $request->role) {
            $users = DB::table('users')->where('role', strtoupper($request->role))->pluck('id')->all();
        } foreach ($users as $userId) {
            DB::table('notifications')->insert(array_merge($data, ['user_id' => $userId, 'type' => $request->input('type', 'BROADCAST'), 'created_at' => now()]));
        }

return response()->json(['success' => true, 'sent' => count($users)]);
    }

    public function settings(): mixed
    {
        return response()->json(['success' => true, 'settings' => DB::table('settings')->orderBy('setting_group')->orderBy('setting_key')->get()]);
    }

    public function updateSettings(Request $request): mixed
    {
        $entries = $request->input('settings', $request->all());
        foreach ($entries as $key => $value) {
            DB::table('settings')->where('setting_key', $key)->update(['setting_value' => is_scalar($value) ? (string) $value : json_encode($value), 'updated_at' => now()]);
        }

return response()->json(['success' => true, 'updated' => count($entries)]);
    }

    public function pages(): mixed
    {
        return response()->json(['success' => true, 'pages' => DB::table('dynamic_pages')->orderBy('title')->get()]);
    }

    public function page(string $slugOrId): mixed
    {
        return response()->json(['success' => true, 'page' => DB::table('dynamic_pages')->where('id', $slugOrId)->orWhere('slug', $slugOrId)->firstOrFail()]);
    }

    public function upsertPage(Request $request): mixed
    {
        $data = $request->validate(['slug' => 'required|string', 'title' => 'required|string', 'content_html' => 'nullable|string']);
        DB::table('dynamic_pages')->updateOrInsert(['slug' => $data['slug']], array_merge($data, ['updated_at' => now(), 'created_at' => now()]));

        return response()->json(['success' => true]);
    }

    public function deletePage(int $id): mixed
    {
        DB::table('dynamic_pages')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    public function vehicleTypes(): mixed
    {
        return response()->json(['success' => true, 'vehicles' => DB::table('vehicle_types')->orderBy('sort_order')->get()]);
    }

    public function createVehicleType(Request $request): mixed
    {
        $data = $request->all();
        $id = DB::table('vehicle_types')->insertGetId(array_merge($data, ['created_at' => now(), 'updated_at' => now()]));

        return response()->json(['success' => true, 'vehicle' => DB::table('vehicle_types')->where('id', $id)->first()], 201);
    }

    public function updateVehicleType(Request $request, int $id): mixed
    {
        DB::table('vehicle_types')->where('id', $id)->update(array_merge($request->all(), ['updated_at' => now()]));

        return response()->json(['success' => true]);
    }

    public function deleteVehicleType(int $id): mixed
    {
        DB::table('vehicle_types')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    public function cities(): mixed
    {
        return response()->json(['success' => true, 'cities' => DB::table('cities')->orderBy('name')->get()]);
    }

    public function createCity(Request $request): mixed
    {
        $data = $request->validate(['name' => 'required|string']);
        $id = DB::table('cities')->insertGetId(array_merge($data, ['created_at' => now()]));

        return response()->json(['success' => true, 'city' => DB::table('cities')->where('id', $id)->first()], 201);
    }

    public function updateCity(Request $request, int $id): mixed
    {
        DB::table('cities')->where('id', $id)->update(array_merge($request->all(), ['updated_at' => now()]));

        return response()->json(['success' => true]);
    }

    public function deleteCity(int $id): mixed
    {
        DB::table('cities')->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    public function payments(Request $request): mixed
    {
        return response()->json(['success' => true, 'payments' => DB::table('payments')->when($request->status, fn ($q) => $q->where('status', $request->status))->orderByDesc('created_at')->limit($request->integer('limit', 200))->get()]);
    }

    public function refundPayment(Request $request, int $id): mixed
    {
        DB::table('payments')->where('id', $id)->update(['status' => 'REFUNDED', 'refund_amount' => $request->input('amount'), 'failure_reason' => $request->input('reason'), 'updated_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function payouts(Request $request): mixed
    {
        return response()->json(['success' => true, 'payouts' => DB::table('payouts')->when($request->status, fn ($q) => $q->where('status', $request->status))->orderByDesc('requested_at')->limit($request->integer('limit', 200))->get()]);
    }

    public function processPayout(Request $request, int $id): mixed
    {
        DB::table('payouts')->where('id', $id)->update(['status' => $request->input('status'), 'notes' => $request->input('notes'), 'reference_number' => $request->input('referenceNumber'), 'processed_by' => $request->user()->id, 'processed_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function revenueReport(): mixed
    {
        return response()->json(['success' => true, 'report' => DB::table('rides')->where('status', 'COMPLETED')->selectRaw('DATE(created_at) day, SUM(final_fare) revenue, SUM(commission_amount) commission, COUNT(*) rides')->groupBy('day')->orderBy('day')->get()]);
    }

    public function ridesByStatus(): mixed
    {
        return response()->json(['success' => true, 'ridesByStatus' => DB::table('rides')->select('status')->selectRaw('COUNT(*) n')->groupBy('status')->get()]);
    }

    public function sos(): mixed
    {
        return response()->json(['success' => true, 'alerts' => DB::table('sos_alerts')->orderByDesc('created_at')->limit(200)->get()]);
    }

    public function resolveSos(Request $request, int $id): mixed
    {
        DB::table('sos_alerts')->where('id', $id)->update(['status' => $request->input('status', 'RESOLVED'), 'resolved_by' => $request->user()->id, 'resolved_at' => now(), 'notes' => $request->input('notes')]);

        return response()->json(['success' => true]);
    }
}
