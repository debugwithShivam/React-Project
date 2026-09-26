<section class="card">
  <h2>Prescription quote requests</h2>
  <p>Assign each uploaded prescription to one approved pharmacy. Only that pharmacy can access the prescription and submit an itemised quote.</p>
  <?php if (!$pharmacies): ?>
    <div class="notice">No approved pharmacy Partner account exists. Approve or create one under <a href="/admin/medical/providers">Labs, Doctors &amp; Partners</a> before assigning requests.</div>
  <?php endif; ?>
  <table>
    <thead><tr><th>Request</th><th>Patient</th><th>Prescription</th><th>Assigned pharmacy</th><th>Quote</th><th>Action</th></tr></thead>
    <tbody>
    <?php foreach ($requests as $item): ?>
      <?php
        $locked = !empty($item['accepted_quote_id']) || in_array((string) ($item['status'] ?? ''), ['payment_pending', 'paid', 'fulfilled', 'completed', 'cancelled', 'rejected'], true);
        $assignedName = trim((string) ($item['pharmacy_business_name'] ?? '')) ?: trim((string) ($item['pharmacy_name'] ?? ''));
      ?>
      <tr>
        <td><strong>#<?= (int) $item['id'] ?></strong><br><span class="pill"><?= htmlspecialchars((string) $item['status']) ?></span><br><small><?= htmlspecialchars((string) $item['created_at']) ?></small></td>
        <td><strong><?= htmlspecialchars((string) $item['customer_name']) ?></strong><br><small><?= htmlspecialchars((string) $item['customer_phone']) ?></small><br><small><?= htmlspecialchars((string) ($item['substitution_preference'] ?? 'contact_me')) ?></small></td>
        <td>
          <a class="btn secondary" href="/api/v1/medical/documents/prescription-request/<?= (int) $item['id'] ?>" target="_blank" rel="noopener">Open prescription</a>
          <?php if (trim((string) ($item['note'] ?? '')) !== ''): ?><div style="margin-top:8px"><?= nl2br(htmlspecialchars((string) $item['note'])) ?></div><?php endif; ?>
        </td>
        <td><?= $assignedName !== '' ? htmlspecialchars($assignedName) : '<span class="pill">Awaiting assignment</span>' ?></td>
        <td>
          <?php if (!empty($item['quote_id'])): ?>
            <strong>₹<?= number_format((float) $item['quote_total'], 2) ?></strong><br><small><?= htmlspecialchars((string) $item['quote_status']) ?></small>
          <?php else: ?>—<?php endif; ?>
        </td>
        <td>
          <?php if ($locked): ?>
            <span class="pill">Assignment locked</span>
          <?php elseif (!$pharmacies): ?>
            <span class="pill">Add a pharmacy first</span>
          <?php else: ?>
            <form method="post" action="/admin/medical/prescription-requests/<?= (int) $item['id'] ?>/assign">
              <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
              <select name="pharmacy_id" required>
                <option value="">Choose pharmacy</option>
                <?php foreach ($pharmacies as $pharmacy): ?>
                  <option value="<?= (int) $pharmacy['id'] ?>" <?= (int) ($item['pharmacy_id'] ?? 0) === (int) $pharmacy['id'] ? 'selected' : '' ?>>
                    <?= htmlspecialchars((string) ($pharmacy['business_name'] ?: $pharmacy['name'])) ?><?= trim((string) ($pharmacy['city'] ?? '')) !== '' ? ' — ' . htmlspecialchars((string) $pharmacy['city']) : '' ?><?= trim((string) ($pharmacy['shop_name'] ?? '')) !== '' ? ' / ' . htmlspecialchars((string) $pharmacy['shop_name']) : ' / store will be linked automatically' ?>
                  </option>
                <?php endforeach; ?>
              </select>
              <button><?= $assignedName !== '' ? 'Reassign' : 'Assign securely' ?></button>
            </form>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$requests): ?><tr><td colspan="6">No prescription quote requests have been uploaded yet.</td></tr><?php endif; ?>
    </tbody>
  </table>
</section>
