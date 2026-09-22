<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Complaint;
use App\Services\Coupon;
use App\Services\DynamicPage;
use App\Services\Notification;
use App\Services\Payout;
use App\Services\Rating;
use Illuminate\Http\Request;
use Throwable;

class MiscController extends Controller
{
    private function fail(Throwable $e, int $status = 400)
    {
        return response()->json(['success' => false, 'message' => $e->getMessage()], $status);
    }

    // ---------- coupons ----------
    public function validateCoupon(Request $request)
    {
        try {
            $result = Coupon::validate(
                (string) $request->input('code'),
                $request->user()->id,
                (float) $request->input('fare', 0),
                $request->input('vehicleType'),
                $request->user()->role === 'DRIVER' ? 'DRIVER' : 'USER'
            );

            return response()->json(array_merge(['success' => true], $result));
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function myCoupons(Request $request)
    {
        $coupons = Coupon::listForUser(
            $request->user()->id,
            (float) $request->query('fare', 0),
            $request->query('vehicleType'),
            $request->user()->role === 'DRIVER' ? 'DRIVER' : 'USER'
        );

        return response()->json(['success' => true, 'coupons' => $coupons]);
    }

    // ---------- ratings ----------
    public function submitRating(Request $request)
    {
        try {
            $result = Rating::submit(
                (int) $request->input('rideId'),
                $request->user()->id,
                $request->user()->role === 'DRIVER' ? 'DRIVER' : 'USER',
                (int) $request->input('rating'),
                $request->input('comment')
            );

            return response()->json(['success' => true, 'rating' => $result], 201);
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function myRatings(Request $request)
    {
        return response()->json(['success' => true, 'ratings' => Rating::listForUser($request->user()->id)]);
    }

    // ---------- complaints ----------
    public function createComplaint(Request $request)
    {
        try {
            $result = Complaint::create(
                $request->user()->id,
                $request->input('rideId') ? (int) $request->input('rideId') : null,
                (string) $request->input('subject'),
                (string) $request->input('description'),
                (string) $request->input('category', 'GENERAL'),
                (string) $request->input('priority', 'MEDIUM')
            );

            return response()->json(['success' => true, 'complaint' => $result], 201);
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function myComplaints(Request $request)
    {
        return response()->json(['success' => true, 'complaints' => Complaint::listForUser($request->user()->id)]);
    }

    // ---------- notifications ----------
    public function listNotifications(Request $request)
    {
        $items = Notification::listForUser(
            $request->user()->id,
            $request->query('unreadOnly') === 'true',
            (int) $request->query('limit', 50)
        );

        return response()->json(['success' => true, 'notifications' => $items]);
    }

    public function markRead(Request $request, int $id)
    {
        Notification::markRead($request->user()->id, $id);

        return response()->json(['success' => true]);
    }

    public function markAllRead(Request $request)
    {
        Notification::markAllRead($request->user()->id);

        return response()->json(['success' => true]);
    }

    public function deleteNotification(Request $request, int $id)
    {
        Notification::delete($request->user()->id, $id);

        return response()->json(['success' => true]);
    }

    // ---------- public dynamic pages ----------
    public function publicPages()
    {
        return response()->json(['success' => true, 'pages' => DynamicPage::listAll()]);
    }

    public function publicPage(string $slug)
    {
        $p = DynamicPage::bySlug($slug);
        if (! $p) {
            return response()->json(['success' => false, 'message' => 'Page not found'], 404);
        }

        return response()->json(['success' => true, 'page' => $p]);
    }

    // ---------- payouts (driver) ----------
    public function requestPayout(Request $request)
    {
        try {
            $result = Payout::request($request->user()->id, (float) $request->input('amount'), $request->input('upi'));

            return response()->json(['success' => true, 'payout' => $result], 201);
        } catch (Throwable $e) {
            return $this->fail($e);
        }
    }

    public function myPayouts(Request $request)
    {
        return response()->json(['success' => true, 'payouts' => Payout::listForDriver($request->user()->id)]);
    }
}
