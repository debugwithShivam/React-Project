<section class="dashboard-hero">
    <div class="hero-panel">
        <h2>AIMEDIX healthcare operations</h2>
        <p>Monitor medicine orders, partner verification, prescriptions, diagnostic labs and doctor consultations from one medical console.</p>
        <div class="hero-actions">
            <a class="btn" href="/admin/medical/orders">Review medical orders</a>
            <a class="btn secondary" href="/admin/medical/providers">Partner approvals</a>
            <?php if (!empty($isSuperAdmin)): ?>
            <a class="btn secondary" href="/admin/health">Production Health</a>
            <?php endif; ?>
        </div>
    </div>
    <div class="focus-panel">
        <h2>Today’s Focus</h2>
        <div class="focus-list">
            <a class="focus-item" href="/admin/medical/orders"><span>Medical orders</span><span class="pill"><?= (int) $stats['orders'] ?></span></a>
            <a class="focus-item" href="/admin/medical/products"><span>Low medicine stock</span><span class="pill"><?= (int) $stats['low_stock'] ?></span></a>
            <a class="focus-item" href="/admin/medical/providers"><span>Pending partners</span><span class="pill"><?= (int) $stats['pending_partners'] ?></span></a>
        </div>
    </div>
</section>

<section class="grid">
    <div class="card stat"><span>Medicine categories</span><strong><?= $stats['categories'] ?></strong></div>
    <div class="card stat"><span>Medicines</span><strong><?= $stats['products'] ?></strong></div>
    <div class="card stat"><span>Medical orders</span><strong><?= $stats['orders'] ?></strong></div>
    <div class="card stat"><span>Approved doctors</span><strong><?= $stats['doctors'] ?></strong></div>
    <div class="card stat"><span>Approved labs</span><strong><?= $stats['labs'] ?></strong></div>
    <div class="card stat"><span>Approved pharmacies</span><strong><?= $stats['pharmacies'] ?></strong></div>
</section>

<section class="card">
    <h2>Recent Orders</h2>
    <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($orders as $order): ?>
            <tr>
                <td><?= htmlspecialchars($order['order_number']) ?></td>
                <td><?= htmlspecialchars($order['customer_name']) ?><br><small><?= htmlspecialchars($order['customer_phone']) ?></small></td>
                <td>₹<?= number_format((float) $order['order_amount'], 2) ?></td>
                <td><span class="pill"><?= htmlspecialchars($order['order_status']) ?></span></td>
                <td><a class="btn secondary" href="/admin/medical/orders/<?= $order['id'] ?>">View</a></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</section>
