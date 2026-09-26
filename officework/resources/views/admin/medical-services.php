<section class="card">
  <h2>Create approved partner account</h2>
  <p>Create the login used by a pharmacy, laboratory or doctor in the AIMEDIX Partner app. An approved pharmacy receives its own medicine store and inventory account automatically.</p>
  <form method="post" action="/admin/medical/providers" class="grid grid-3">
    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
    <label>Role<select name="provider_type"><option value="pharmacy">Pharmacy</option><option value="lab">Laboratory</option><option value="doctor">Doctor</option></select></label>
    <label>Owner / doctor name<input name="name" required></label>
    <label>Business / clinic name<input name="business_name"></label>
    <label>Phone (login)<input name="phone" required></label>
    <label>Email<input name="email" type="email"></label>
    <label>Temporary password<input name="password" type="password" minlength="8" required></label>
    <label>Licence / registration<input name="license_number"></label>
    <label>Speciality<input name="speciality"></label>
    <label>Qualification<input name="qualification"></label>
    <label>Doctor consultation fee ₹<input name="consultation_fee" type="number" min="0" step="0.01"></label>
    <label>Doctor service modes<input name="service_modes" placeholder="online,clinic,home"></label>
    <label>Zone<select name="zone_id" required><option value="">Choose zone</option><?php foreach($zones as $zone): ?><option value="<?= (int)$zone['id'] ?>"><?= htmlspecialchars($zone['name']) ?></option><?php endforeach; ?></select></label>
    <div><button>Create approved account</button></div>
  </form>
</section>
<section class="card">
  <h2>Healthcare partner applications</h2>
  <p>Verify the relevant pharmacy licence, laboratory accreditation or practitioner registration before approval.</p>
  <table><thead><tr><th>Role</th><th>Partner</th><th>Contact</th><th>Credential</th><th>Status</th><th>Action</th></tr></thead><tbody>
  <?php foreach ($providers as $provider): ?><tr>
    <td><span class="pill"><?= htmlspecialchars(ucfirst($provider['provider_type'])) ?></span></td>
    <td><strong><?= htmlspecialchars($provider['business_name'] ?: $provider['name']) ?></strong><br><small><?= htmlspecialchars($provider['speciality'] ?? '') ?></small><br><a href="/admin/medical/providers/<?= (int)$provider['id'] ?>">View and configure profile</a></td>
    <td><?= htmlspecialchars($provider['phone']) ?><br><small><?= htmlspecialchars($provider['email'] ?? '') ?></small></td>
    <td><?= htmlspecialchars($provider['license_number'] ?? '') ?></td>
    <td><span class="pill"><?= htmlspecialchars($provider['status']) ?></span></td>
    <td><form method="post" action="/admin/medical/providers/<?= (int)$provider['id'] ?>/status"><input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>"><select name="status"><?php foreach(['pending','approved','suspended','rejected'] as $status): ?><option value="<?= $status ?>" <?= $provider['status']===$status?'selected':'' ?>><?= ucfirst($status) ?></option><?php endforeach; ?></select><button>Save</button></form></td>
  </tr><?php endforeach; ?>
  <?php if (!$providers): ?><tr><td colspan="6">No provider applications yet.</td></tr><?php endif; ?>
  </tbody></table>
</section>
<section class="card">
  <h2>Add lab test</h2>
  <form method="post" action="/admin/medical/lab-tests" class="grid grid-3">
    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
    <label>Test name<input name="name" required></label><label>Code<input name="code"></label><label>Price ₹<input name="price" type="number" min="0" step="0.01" required></label>
    <label>Lab partner<select name="provider_id"><option value="">Assign later</option><?php foreach($providers as $p): if($p['provider_type']!=='lab'||$p['status']!=='approved')continue; ?><option value="<?= (int)$p['id'] ?>"><?= htmlspecialchars($p['business_name'] ?: $p['name']) ?></option><?php endforeach; ?></select></label>
    <label>Zone<select name="zone_id" required><option value="">Choose zone</option><?php foreach($zones as $zone): ?><option value="<?= (int)$zone['id'] ?>"><?= htmlspecialchars($zone['name']) ?></option><?php endforeach; ?></select></label>
    <label>Report hours<input name="report_hours" type="number" min="1" value="24"></label><label><input name="home_collection" type="checkbox" value="1" checked> Home collection</label>
    <label>Preparation<input name="preparation"></label><label>Description<textarea name="description"></textarea></label><div><button>Add test</button></div>
  </form>
  <table><thead><tr><th>Test</th><th>Code</th><th>Lab</th><th>Price</th><th>Report</th></tr></thead><tbody><?php foreach($labTests as $test): ?><tr><td><?= htmlspecialchars($test['name']) ?></td><td><?= htmlspecialchars($test['code']??'') ?></td><td><?= htmlspecialchars($test['provider_name']??'Unassigned') ?></td><td>₹<?= number_format((float)$test['price'],2) ?></td><td><?= (int)$test['report_hours'] ?> hours</td></tr><?php endforeach; ?></tbody></table>
</section>
