<div style="min-height:100vh;display:grid;place-items:center;padding:24px;">
    <form class="card" method="post" action="/vendor/login" style="width:min(420px,100%);">
        <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
        <h1 style="margin-top:0;">Pharmacy Login</h1>
        <p style="color:var(--muted);">Approved pharmacy partners can manage medicines and orders here.</p>
        <?php if (!empty($error)): ?><div class="error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        <label>Module</label>
        <select name="module_key" required>
            <option value="medical">AIMEDIX MEDS Pharmacy</option>
        </select>
        <label>Phone</label>
        <input name="phone" required>
        <label>Password</label>
        <input name="password" type="password" required>
        <div style="height:14px;"></div>
        <button style="width:100%;">Login</button>
        <div style="height:10px;"></div>
        <a class="btn secondary" style="width:100%;text-align:center;" href="/admin/login">Admin Login</a>
    </form>
</div>
