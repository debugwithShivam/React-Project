<section class="card">
    <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <div><h2>Medical Point of Sale</h2><p>Create a paid walk-in pharmacy sale with multiple medicines. Stock is deducted only if the complete transaction succeeds.</p></div>
        <a class="btn secondary" href="/admin/medical/orders">Medical orders</a>
    </div>
    <?php if (($products ?? []) === []): ?><div class="alert error">No approved medical inventory is available for POS.</div><?php else: ?>
    <form method="post" action="/admin/medical/pos" id="medical-pos-form">
        <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
        <div class="row">
            <div><label>Customer name</label><input name="customer_name" value="Walk-in Customer" required></div>
            <div><label>Customer phone</label><input name="customer_phone" inputmode="tel"></div>
            <div><label>Payment method</label><select name="payment_method"><option value="pos_cash">Cash</option><option value="pos_upi">UPI</option><option value="pos_card">Card</option></select></div>
        </div>
        <label>Payment reference (optional for cash)</label><input name="payment_reference" maxlength="190">
        <h3>Sale items</h3>
        <div id="pos-lines"><div class="row pos-line">
            <div style="flex:3"><label>Medicine</label><select name="product_id[]" required><?php foreach ($products as $product): ?><option value="<?= (int) $product['id'] ?>" data-price="<?= (float) ($product['discount_price'] ?: $product['price']) ?>"><?= htmlspecialchars($product['name']) ?> · <?= htmlspecialchars($product['shop_name'] ?? 'Pharmacy') ?> · ₹<?= number_format((float) ($product['discount_price'] ?: $product['price']), 2) ?> · stock <?= (int) $product['stock'] ?></option><?php endforeach; ?></select></div>
            <div><label>Quantity</label><input name="quantity[]" type="number" min="1" value="1" required></div>
            <div style="align-self:end"><button class="btn danger remove-pos-line" type="button">Remove</button></div>
        </div></div>
        <button class="btn secondary" id="add-pos-line" type="button">Add another medicine</button>
        <label>Order note</label><textarea name="order_note">Medical POS sale</textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:16px"><strong id="pos-estimate">Estimated subtotal: ₹0.00</strong><button>Create Paid Sale & Invoice</button></div>
    </form>
    <script>
    (()=>{const lines=document.getElementById('pos-lines'),template=lines.querySelector('.pos-line').cloneNode(true),estimate=()=>{let total=0;lines.querySelectorAll('.pos-line').forEach(line=>{const select=line.querySelector('select'),qty=line.querySelector('input[type=number]');total+=Number(select.selectedOptions[0]?.dataset.price||0)*Number(qty.value||0)});document.getElementById('pos-estimate').textContent=`Estimated subtotal: ₹${total.toFixed(2)} plus tax`;};document.getElementById('add-pos-line').onclick=()=>{lines.appendChild(template.cloneNode(true));estimate();};lines.addEventListener('click',event=>{if(!event.target.classList.contains('remove-pos-line'))return;if(lines.children.length>1)event.target.closest('.pos-line').remove();estimate();});lines.addEventListener('change',estimate);lines.addEventListener('input',estimate);estimate();})();
    </script>
    <?php endif; ?>
</section>
