<?php

declare(strict_types=1);

namespace App\Controllers\Admin\Ecommerce;

use App\Support\Auth;
use App\Support\CustomerIdentity;
use App\Support\Database;
use App\Support\NotificationLog;
use App\Support\NotificationSchema;
use App\Support\PaymentGatewayClient;
use App\Support\ProductExtrasSchema;
use App\Support\RefundSchema;
use App\Support\RefundState;
use App\Support\Response;
use App\Support\View;
use App\Support\WalletService;
use App\Support\WalletSchema;

final class RefundController
{
    public function __construct(
        private readonly string $moduleKey = 'ecommerce',
        private readonly string $basePath = '/admin/ecommerce/refunds',
        private readonly string $moduleLabel = 'Refunds'
    ) {
    }

    public function index(): void
    {
        Auth::requireAdmin();
        ProductExtrasSchema::ensure();
        RefundSchema::ensure();
        $stmt = Database::connection()->prepare(
            'select refund_requests.*, orders.order_number, order_items.product_name, vendors.shop_name as vendor_name
             from refund_requests
             join orders on orders.id = refund_requests.order_id
             left join order_items on order_items.id = refund_requests.order_item_id
             left join vendors on vendors.id = refund_requests.vendor_id
             where orders.module_key = :module_key' . Auth::zoneWhere('orders') . '
             order by refund_requests.id desc'
        );
        $stmt->execute(Auth::zoneParams(['module_key' => $this->moduleKey]));
        View::render('admin/refunds', ['title' => $this->moduleLabel, 'refunds' => $stmt->fetchAll(), 'basePath' => $this->basePath]);
    }

    public function status(int $id): void
    {
        Auth::requireAdmin();
        ProductExtrasSchema::ensure();
        RefundSchema::ensure();
        NotificationSchema::ensure();
        $allowed = ['pending', 'approved', 'rejected', 'refunded'];
        $status = (string) ($_POST['status'] ?? '');
        if (!in_array($status, $allowed, true)) {
            Response::json(['message' => 'Invalid refund status.'], 422);
            return;
        }

        $db = Database::connection();
        $lookup = $db->prepare('select refund_requests.*, orders.order_number, orders.payment_method, orders.payment_status, orders.customer_id order_customer_id, orders.guest_id order_guest_id, orders.zone_id from refund_requests join orders on orders.id = refund_requests.order_id where refund_requests.id = :id and orders.module_key = :module_key' . Auth::zoneWhere('orders') . ' limit 1');
        $lookup->execute(Auth::zoneParams(['id' => $id, 'module_key' => $this->moduleKey]));
        $refund = $lookup->fetch();
        if (!$refund) {
            Response::redirect($this->basePath);
            return;
        }

        $current = (string) $refund['status'];
        if ($status === $current) {
            Response::redirect($this->basePath);
            return;
        }
        if (!RefundState::canRequest($current, $status)) {
            Response::json(['message' => 'Invalid refund transition from ' . $current . ' to ' . $status . '.'], 409);
            return;
        }
        if ($status === 'refunded' && !in_array((string) $refund['payment_status'], ['paid', 'verified', 'refund_pending'], true)) {
            Response::json(['message' => 'Only a paid refund can be completed.'], 409);
            return;
        }

        if ($status !== 'refunded') {
            $stmt = $db->prepare('update refund_requests set status = :status, admin_note = :admin_note, updated_at = CURRENT_TIMESTAMP where id = :id and status = :current');
            $stmt->execute(['id' => $id, 'status' => $status, 'current' => $current, 'admin_note' => trim((string) ($_POST['admin_note'] ?? '')) ?: null]);
            if ($stmt->rowCount() !== 1) {
                Response::json(['message' => 'Refund state changed. Refresh before trying again.'], 409);
                return;
            }
            NotificationLog::record('customer', null, (string) $refund['guest_id'], 'Refund status updated', 'Refund for ' . $refund['order_number'] . ' is now ' . $status . '.', (int) $refund['order_id'], $this->moduleKey);
            Response::redirect($this->basePath);
            return;
        }

        WalletSchema::ensure();
        $reserve = $db->prepare("update refund_requests set status = 'processing', refund_attempted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP where id = :id and status in ('approved','refund_failed')");
        $reserve->execute(['id' => $id]);
        if ($reserve->rowCount() !== 1) {
            Response::json(['message' => 'Refund is already being processed or completed.'], 409);
            return;
        }

        $paymentLookup = $db->prepare('select * from payment_transactions where order_id = :order_id and module_key = :module_key order by id desc limit 1');
        $paymentLookup->execute(['order_id' => (int) $refund['order_id'], 'module_key' => $this->moduleKey]);
        $payment = $paymentLookup->fetch() ?: [];
        $paymentMethod = (string) ($payment['payment_method'] ?? $refund['payment_method'] ?? '');
        $gatewayResult = $paymentMethod === 'online_payment'
            ? PaymentGatewayClient::refund($this->moduleKey, $refund, $payment + $refund)
            : null;
        $gatewayJson = $gatewayResult === null ? null : (json_encode($gatewayResult, JSON_UNESCAPED_SLASHES) ?: '{}');
        if ($gatewayResult !== null && ($gatewayResult['ok'] ?? false) !== true) {
            $db->prepare("update refund_requests set status = 'refund_failed', gateway_response = :gateway_response, admin_note = :admin_note, updated_at = CURRENT_TIMESTAMP where id = :id and status = 'processing'")
                ->execute(['id' => $id, 'gateway_response' => $gatewayJson, 'admin_note' => trim((string) ($_POST['admin_note'] ?? '') . "\nGateway: " . ($gatewayResult['message'] ?? 'refund failed'))]);
            Response::redirect($this->basePath);
            return;
        }

        try {
            $db->beginTransaction();
            $complete = $db->prepare("update refund_requests set status = 'refunded', gateway_response = :gateway_response, admin_note = :admin_note, refunded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP where id = :id and status = 'processing'");
            $complete->execute(['id' => $id, 'gateway_response' => $gatewayJson, 'admin_note' => trim((string) ($_POST['admin_note'] ?? '')) ?: null]);
            if ($complete->rowCount() !== 1) {
                throw new \RuntimeException('Refund state changed before completion.');
            }
            $db->prepare("update orders set payment_status = 'refunded', updated_at = CURRENT_TIMESTAMP where id = :id and module_key = :module_key")
                ->execute(['id' => (int) $refund['order_id'], 'module_key' => $this->moduleKey]);
            $db->prepare("update payment_transactions set status = 'refunded', gateway_response = :gateway_response, reconciled_at = CURRENT_TIMESTAMP, reconciled_by = :reconciled_by, updated_at = CURRENT_TIMESTAMP where order_id = :order_id and module_key = :module_key")
                ->execute(['order_id' => (int) $refund['order_id'], 'module_key' => $this->moduleKey, 'gateway_response' => $gatewayJson, 'reconciled_by' => $_SESSION['admin_name'] ?? 'Admin']);
            if (RefundState::creditsWallet($paymentMethod)) {
                $customerId = (int) ($refund['customer_id'] ?? $refund['order_customer_id'] ?? 0);
                $ownerKey = $customerId > 0 ? CustomerIdentity::guestId($customerId) : (string) ($refund['order_guest_id'] ?? $refund['guest_id'] ?? '');
                if ($ownerKey !== '') {
                    WalletService::credit('customer', $ownerKey, (float) $refund['amount'], 'refund_credit', 'refund:' . $id, 'Refund credited to wallet for ' . $refund['order_number']);
                }
            }
            $db->commit();
        } catch (\Throwable $error) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            $db->prepare("update refund_requests set status = 'refund_failed', admin_note = :admin_note, updated_at = CURRENT_TIMESTAMP where id = :id and status = 'processing'")
                ->execute(['id' => $id, 'admin_note' => $error->getMessage()]);
            Response::json(['message' => 'Refund could not be completed and is ready to retry.'], 500);
            return;
        }

        NotificationLog::record('customer', null, (string) ($refund['order_guest_id'] ?? $refund['guest_id']), 'Refund status updated', 'Refund for ' . $refund['order_number'] . ' is now refunded.', (int) $refund['order_id'], $this->moduleKey);
        Response::redirect($this->basePath);
    }
}
