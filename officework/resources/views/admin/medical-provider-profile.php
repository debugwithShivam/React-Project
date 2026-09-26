<?php $type=(string)$provider['provider_type']; ?>
<section class="grid">
  <div class="card stat"><span>Partner type</span><strong><?= htmlspecialchars(ucfirst($type)) ?></strong></div>
  <div class="card stat"><span>Status</span><strong><?= htmlspecialchars(ucfirst($provider['status'])) ?></strong></div>
  <div class="card stat"><span>Patient activity</span><strong><?= count($activity) ?></strong></div>
  <?php if($type==='doctor'): ?><div class="card stat"><span>Consultation fee</span><strong>₹<?= number_format((float)$provider['consultation_fee'],2) ?></strong></div><?php endif; ?>
  <?php if($type==='lab'): ?><div class="card stat"><span>Lab tests</span><strong><?= count($labTests) ?></strong></div><?php endif; ?>
</section>
<section class="card">
  <h2>Profile, credentials and pricing</h2>
  <form method="post" action="/admin/medical/providers/<?= (int)$provider['id'] ?>/update">
    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
    <div class="grid grid-3">
      <label>Provider type<select name="provider_type"><?php foreach(['pharmacy','lab','doctor'] as $v): ?><option value="<?= $v ?>" <?= $type===$v?'selected':'' ?>><?= ucfirst($v) ?></option><?php endforeach; ?></select></label>
      <label>Owner / doctor name<input name="name" required value="<?= htmlspecialchars($provider['name']) ?>"></label>
      <label>Business / clinic name<input name="business_name" value="<?= htmlspecialchars($provider['business_name']??'') ?>"></label>
      <label>Phone<input name="phone" required value="<?= htmlspecialchars($provider['phone']) ?>"></label>
      <label>Email<input name="email" type="email" value="<?= htmlspecialchars($provider['email']??'') ?>"></label>
      <label>Licence / registration<input name="license_number" value="<?= htmlspecialchars($provider['license_number']??'') ?>"></label>
      <label>Speciality<input name="speciality" value="<?= htmlspecialchars($provider['speciality']??'') ?>"></label>
      <label>Qualification<input name="qualification" value="<?= htmlspecialchars($provider['qualification']??'') ?>"></label>
      <label>Experience years<input name="experience_years" type="number" min="0" value="<?= (int)$provider['experience_years'] ?>"></label>
      <label>Doctor consultation fee ₹<input name="consultation_fee" type="number" min="0" step="0.01" value="<?= htmlspecialchars((string)$provider['consultation_fee']) ?>"></label>
      <label>Service modes<input name="service_modes" placeholder="online,clinic,home" value="<?= htmlspecialchars($provider['service_modes']??'') ?>"></label>
      <label>Availability<input name="availability_text" placeholder="Mon-Sat, 10 AM-6 PM" value="<?= htmlspecialchars($provider['availability_text']??'') ?>"></label>
      <label>Opening hours<input name="opening_hours" value="<?= htmlspecialchars($provider['opening_hours']??'') ?>"></label>
      <label>Service radius km<input name="service_radius_km" type="number" min="0" step="0.1" value="<?= htmlspecialchars((string)$provider['service_radius_km']) ?>"></label>
      <label>Home collection fee ₹<input name="home_collection_fee" type="number" min="0" step="0.01" value="<?= htmlspecialchars((string)$provider['home_collection_fee']) ?>"></label>
      <label>Pharmacy delivery fee ₹<input name="default_delivery_fee" type="number" min="0" step="0.01" value="<?= htmlspecialchars((string)$provider['default_delivery_fee']) ?>"></label>
      <?php if($type==='pharmacy'): ?><div><span>Medicine store account</span><strong><?= $store ? htmlspecialchars($store['shop_name']).' ('.htmlspecialchars($store['status']).')' : ($provider['status']==='approved' ? 'Will be created when this profile is saved' : 'Created automatically after approval') ?></strong><small>This store belongs to this pharmacy and cannot be linked to another partner.</small></div><?php endif; ?>
      <label>City<input name="city" value="<?= htmlspecialchars($provider['city']??'') ?>"></label>
      <label>State<input name="state" value="<?= htmlspecialchars($provider['state']??'') ?>"></label>
      <label>Pincode<input name="pincode" value="<?= htmlspecialchars($provider['pincode']??'') ?>"></label>
      <label>Shop / building<input name="address_line" value="<?= htmlspecialchars($provider['address_line']??'') ?>"></label>
      <label>Floor<input name="floor" value="<?= htmlspecialchars($provider['floor']??'') ?>"></label>
      <label>Landmark<input name="landmark" value="<?= htmlspecialchars($provider['landmark']??'') ?>"></label>
      <label>Zone ID<input name="zone_id" type="number" min="1" required value="<?= (int)($provider['zone_id']??0) ?: '' ?>"></label>
      <label>Status<select name="status"><?php foreach(['pending','approved','suspended','rejected'] as $v): ?><option value="<?= $v ?>" <?= $provider['status']===$v?'selected':'' ?>><?= ucfirst($v) ?></option><?php endforeach; ?></select></label>
    </div>
    <label>Address<textarea name="address"><?= htmlspecialchars($provider['address']??'') ?></textarea></label>
    <?php if((float)($provider['latitude']??0)!==0.0 && (float)($provider['longitude']??0)!==0.0): ?>
      <p><strong>Verified map location:</strong> <?= htmlspecialchars((string)$provider['latitude']) ?>, <?= htmlspecialchars((string)$provider['longitude']) ?> · <a href="https://www.google.com/maps?q=<?= rawurlencode((string)$provider['latitude'].','.(string)$provider['longitude']) ?>" target="_blank" rel="noopener noreferrer">Open in Google Maps</a></p>
    <?php else: ?><p class="error">No verified map location is saved for this partner.</p><?php endif; ?>
    <label>Public profile description<textarea name="description"><?= htmlspecialchars($provider['description']??'') ?></textarea></label>
    <button>Save partner profile</button>
  </form>
</section>
<?php if($type==='lab'): ?>
<section class="card"><h2>Lab test catalogue and prices</h2>
<?php foreach($labTests as $test): ?><form method="post" action="/admin/medical/lab-tests/<?= (int)$test['id'] ?>/update" style="padding:14px 0;border-bottom:1px solid var(--line)"><input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>"><input type="hidden" name="provider_id" value="<?= (int)$provider['id'] ?>"><div class="grid grid-3"><label>Test<input name="name" value="<?= htmlspecialchars($test['name']) ?>"></label><label>Code<input name="code" value="<?= htmlspecialchars($test['code']??'') ?>"></label><label>Price ₹<input name="price" type="number" step="0.01" value="<?= htmlspecialchars((string)$test['price']) ?>"></label><label>Report hours<input name="report_hours" type="number" value="<?= (int)$test['report_hours'] ?>"></label><label>Preparation<input name="preparation" value="<?= htmlspecialchars($test['preparation']??'') ?>"></label><label>Status<select name="status"><option value="active" <?= $test['status']==='active'?'selected':'' ?>>Active</option><option value="inactive" <?= $test['status']==='inactive'?'selected':'' ?>>Inactive</option></select></label></div><label><input type="checkbox" name="home_collection" value="1" <?= $test['home_collection']?'checked':'' ?>> Home collection</label><label>Description<textarea name="description"><?= htmlspecialchars($test['description']??'') ?></textarea></label><button>Update test</button></form><?php endforeach; ?>
</section>
<?php endif; ?>
<?php if($type==='pharmacy'): ?>
<section class="card"><h2>Medicine catalogue</h2>
  <?php if(!(int)($provider['vendor_id']??0)): ?><p>The medicine store and inventory account will be created automatically when this pharmacy is approved.</p>
  <?php else: ?><p>The pharmacy can update price, discount, stock and availability from the Partner app. Full product details remain available under <a href="/admin/medical/products">Medicines</a>.</p>
  <table><thead><tr><th>Medicine</th><th>Unit</th><th>Price</th><th>Offer</th><th>Stock</th><th>Status</th></tr></thead><tbody>
  <?php foreach($products as $product): ?><tr><td><?= htmlspecialchars($product['name']) ?></td><td><?= htmlspecialchars($product['unit']??'') ?></td><td>₹<?= number_format((float)$product['price'],2) ?></td><td><?= $product['discount_price']!==null?'₹'.number_format((float)$product['discount_price'],2):'—' ?></td><td><?= (int)$product['stock'] ?></td><td><span class="pill"><?= $product['status']?'Active':'Inactive' ?></span></td></tr><?php endforeach; ?>
  <?php if(!$products): ?><tr><td colspan="6">No medicines belong to this store yet.</td></tr><?php endif; ?></tbody></table><?php endif; ?>
</section>
<?php endif; ?>
<section class="card"><h2>Recent patient activity</h2><table><thead><tr><th>Patient</th><th>Phone</th><th>Status</th><th>Scheduled / created</th><th>Payment</th><th>Action</th></tr></thead><tbody><?php foreach($activity as $item): ?><tr><td><?= htmlspecialchars($item['customer_name']??'') ?></td><td><?= htmlspecialchars($item['customer_phone']??'') ?></td><td><span class="pill"><?= htmlspecialchars($item['status']??'') ?></span></td><td><?= htmlspecialchars($item['scheduled_at']??$item['created_at']??'') ?></td><td><?= htmlspecialchars($item['payment_status']??'') ?></td><td><?php if(in_array($type,['lab','doctor'],true) && isset($item['id'])): ?><form method="post" action="/admin/medical/payments/<?= $type==='lab'?'lab_booking':'consultation' ?>/<?= (int)$item['id'] ?>"><input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>"><select name="payment_status"><option value="pending">Pending</option><option value="verified">Verify paid</option><option value="rejected">Reject</option><option value="refunded">Refunded</option></select><button>Save payment</button></form><?php endif; ?></td></tr><?php endforeach; ?><?php if(!$activity): ?><tr><td colspan="6">No patient activity yet.</td></tr><?php endif; ?></tbody></table></section>
