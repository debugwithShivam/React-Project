<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Payment;
use App\Services\Wallet;
use Illuminate\Http\Request;
use Throwable;

class PaymentController extends Controller
{
    public function config()
    {
        return response()->json([
            'success' => true,
            'enabled' => Payment::isEnabled(),
            'keyId' => Payment::isEnabled() ? (string) env('RAZORPAY_KEY_ID') : null,
        ]);
    }

    public function createOrder(Request $request)
    {
        try {
            $order = Payment::createOrder(
                $request->user()->id,
                (float) $request->input('amount'),
                (string) $request->input('purpose', 'RIDE'),
                $request->input('rideId') ? (int) $request->input('rideId') : null,
                (array) $request->input('notes', [])
            );

            return response()->json(['success' => true, 'order' => $order], 201);
        } catch (Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function verify(Request $request)
    {
        $orderId = $request->input('orderId');
        $razorpayPaymentId = $request->input('razorpayPaymentId');
        $signature = $request->input('signature');
        if (! $orderId || ! $razorpayPaymentId || ! $signature) {
            return response()->json(['success' => false, 'message' => 'orderId, razorpayPaymentId, signature required'], 400);
        }
        try {
            $result = Payment::verify($request->user()->id, $orderId, $razorpayPaymentId, $signature, (bool) $request->input('creditWallet', false));

            return response()->json(array_merge(['success' => true], $result));
        } catch (Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function history(Request $request)
    {
        return response()->json(['success' => true, 'payments' => Payment::listForUser($request->user()->id)]);
    }

    public function wallet(Request $request)
    {
        return response()->json(['success' => true, 'wallet' => Wallet::get($request->user()->id)]);
    }

    public function walletTransactions(Request $request)
    {
        return response()->json(['success' => true, 'transactions' => Wallet::transactions($request->user()->id, (int) $request->query('limit', 50))]);
    }

    public function webhook(Request $request)
    {
        Payment::webhook($request->all());

        return response()->json(['received' => true]);
    }
}
