<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Support\Auth;
use App\Support\Database;
use App\Support\OrderStatusHistory;
use App\Support\PaymentSchema;
use App\Support\ProductExtrasSchema;
use App\Support\Response;
use App\Support\View;

final class PosController
{
    public function index(): void
    {
        Auth::requireAdmin();
        ProductExtrasSchema::ensure();
        $stmt = Database::connection()->prepare(
            "select products.id, products.name, products.price, products.discount_price, products.stock, products.tax_percent,
                    products.vendor_id, products.zone_id, vendors.shop_name
             from products
             join vendors on vendors.id=products.vendor_id and vendors.module_key='medical' and vendors.status='approved'
             where products.status=1 and products.provider_visibility=1 and products.module_key='medical'" . Auth::zoneWhere('products') . '
             order by products.name asc'
        );
        $stmt->execute(Auth::zoneParams());
        $products = $stmt->fetchAll();
        View::render('admin/pos', ['title' => 'POS', 'products' => $products]);
    }

    public function store(): void
    {
        Auth::requireAdmin();
        ProductExtrasSchema::ensure();
        PaymentSchema::ensure();
        OrderStatusHistory::ensure();
        $productIds = array_values(array_map('intval', is_array($_POST['product_id'] ?? null) ? $_POST['product_id'] : []));
        $quantities = array_values(is_array($_POST['quantity'] ?? null) ? $_POST['quantity'] : []);
        $requested = [];
        foreach ($productIds as $index => $productId) {
            if ($productId < 1) continue;
            $requested[$productId] = ($requested[$productId] ?? 0) + max(1, (int) ($quantities[$index] ?? 1));
        }
        if ($requested === [] || count($requested) > 100) {
            Response::redirect('/admin/medical/pos');
        }
        $db = Database::connection();
        $placeholders = implode(',', array_fill(0, count($requested), '?'));
        $stmt = $db->prepare("select * from products where id in ($placeholders) and status=1 and provider_visibility=1 and module_key='medical'");
        $stmt->execute(array_keys($requested));
        $products = $stmt->fetchAll();
        if (count($products) !== count($requested)) Response::redirect('/admin/medical/pos');
        $subtotal = 0.0; $taxTotal = 0.0; $zones = []; $vendors = [];
        foreach ($products as &$product) {
            $quantity = $requested[(int) $product['id']];
            if ((int) $product['stock'] < $quantity) Response::redirect('/admin/medical/pos');
            $product['pos_quantity'] = $quantity;
            $product['pos_price'] = (float) ($product['discount_price'] ?: $product['price']);
            $product['pos_total'] = round($product['pos_price'] * $quantity, 2);
            $subtotal += $product['pos_total'];
            $taxTotal += round(($product['pos_total'] * (float) ($product['tax_percent'] ?? 0)) / 100, 2);
            if ((int) ($product['zone_id'] ?? 0) > 0) $zones[(int) $product['zone_id']] = true;
            if ((int) ($product['vendor_id'] ?? 0) > 0) $vendors[(int) $product['vendor_id']] = true;
        }
        unset($product);
        if (count($zones) > 1) Response::redirect('/admin/medical/pos');
        $total = round($subtotal + $taxTotal, 2);
        $orderNumber = 'MEDPOS' . date('ymdHis') . random_int(10, 99);
        $guestId = 'pos-' . strtolower($orderNumber);
        $paymentMethod = in_array($_POST['payment_method'] ?? '', ['pos_cash','pos_card','pos_upi'], true) ? (string) $_POST['payment_method'] : 'pos_cash';
        try {
            $db->beginTransaction();
            $order = $db->prepare(
                "insert into orders (module_key,zone_id,vendor_id,order_number,guest_id,customer_name,customer_phone,address,order_amount,tax_total,shipping_cost,payment_method,payment_status,order_status,order_note,created_at,updated_at)
                 values ('medical',:zone_id,:vendor_id,:order_number,:guest_id,:customer_name,:customer_phone,'Medical POS Counter',:order_amount,:tax_total,0,:payment_method,'paid','delivered',:order_note,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)"
            );
            $order->execute([
                'zone_id' => $zones ? array_key_first($zones) : null,
                'vendor_id' => count($vendors) === 1 ? array_key_first($vendors) : null,
                'order_number' => $orderNumber,
                'guest_id' => $guestId,
                'customer_name' => trim($_POST['customer_name'] ?? 'Walk-in Customer'),
                'customer_phone' => trim($_POST['customer_phone'] ?? ''),
                'order_amount' => $total,
                'tax_total' => $taxTotal,
                'payment_method' => $paymentMethod,
                'order_note' => trim($_POST['order_note'] ?? 'Medical POS sale'),
            ]);
            $orderId = (int) $db->lastInsertId();
            $item = $db->prepare(
                'insert into order_items (order_id, vendor_id, product_id, product_name, quantity, price, total, status, created_at, updated_at)
                 values (:order_id, :vendor_id, :product_id, :product_name, :quantity, :price, :total, \'delivered\', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
            );
            $stock = $db->prepare('update products set stock = stock - :quantity, updated_at = CURRENT_TIMESTAMP where id = :id and stock >= :quantity');
            foreach ($products as $product) {
                $item->execute(['order_id'=>$orderId,'vendor_id'=>$product['vendor_id'] ?: null,'product_id'=>$product['id'],'product_name'=>$product['name'],'quantity'=>$product['pos_quantity'],'price'=>$product['pos_price'],'total'=>$product['pos_total']]);
                $stock->execute(['quantity'=>$product['pos_quantity'],'id'=>$product['id']]);
                if ($stock->rowCount() !== 1) throw new \RuntimeException('Stock changed during checkout.');
            }
            $payment = $db->prepare("insert into payment_transactions (module_key,order_id,guest_id,customer_name,customer_phone,payment_method,amount,reference,note,status,created_at,updated_at) values ('medical',:order,:guest,:name,:phone,:method,:amount,:reference,:note,'paid',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
            $payment->execute(['order'=>$orderId,'guest'=>$guestId,'name'=>trim($_POST['customer_name']??'Walk-in Customer'),'phone'=>trim($_POST['customer_phone']??''),'method'=>$paymentMethod,'amount'=>$total,'reference'=>trim($_POST['payment_reference']??'')?:null,'note'=>'Paid at medical POS']);
            OrderStatusHistory::record($orderId, null, 'delivered', 'admin', 'POS', 'POS order completed');
            $db->commit();
        } catch (\Throwable) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::redirect('/admin/medical/pos');
        }

        Response::redirect('/admin/medical/orders/' . $orderId . '/invoice');
    }
}
