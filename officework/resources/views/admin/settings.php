<?php
$value = static fn(string $key, string $default=''): string => htmlspecialchars((string)($settings[$key] ?? $default), ENT_QUOTES);
$medical = static fn(string $key, string $default=''): string => htmlspecialchars((string)($settings['medical_'.$key] ?? $settings[$key] ?? $default), ENT_QUOTES);
$checked = static fn(string $key, string $default='0'): string => (($settings['medical_'.$key] ?? $settings[$key] ?? $default)==='1')?'checked':'';
$hasFirebaseServiceAccount = trim((string)($settings['medical_firebase_service_account_json'] ?? $settings['firebase_service_account_json'] ?? '')) !== '';
$hasFirebaseServerKey = trim((string)($settings['medical_firebase_server_key'] ?? $settings['firebase_server_key'] ?? '')) !== '';
$hasAdminMapsKey = trim((string)($settings['medical_google_maps_server_api_key'] ?? '')) !== '';
$hasEnvironmentMapsKey = trim((string)\App\Support\Env::get('GOOGLE_MAPS_SERVER_API_KEY', '')) !== '';
?>
<section class="card">
  <h2>AIMEDIX MEDS application settings</h2>
  <p>Only the medical customer app, Partner app and healthcare storefront are configured here.</p>
  <form method="post" action="/admin/settings">
    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
    <input type="hidden" name="settings_scope" value="modules">
    <div class="grid grid-3">
      <label>Application name<input name="medical_app_name" value="<?= $medical('app_name','AIMEDIX MEDS') ?>"></label>
      <label>Currency<input name="medical_currency" value="<?= $medical('currency','INR') ?>"></label>
      <label>Currency symbol<input name="medical_currency_symbol" value="<?= $medical('currency_symbol','₹') ?>"></label>
      <label>Minimum medicine order<input name="medical_minimum_order_amount" type="number" min="0" step="0.01" value="<?= $medical('minimum_order_amount','0') ?>"></label>
      <label>Default delivery charge<input name="medical_delivery_charge" type="number" min="0" step="0.01" value="<?= $medical('delivery_charge','0') ?>"></label>
      <label>Supported locales<input name="medical_supported_locales" value="<?= $medical('supported_locales','en,hi') ?>"></label>
      <label><input type="checkbox" name="medical_cod_enabled" value="1" <?= $checked('cod_enabled','1') ?>> Cash on delivery</label>
      <label><input type="checkbox" name="medical_online_payment_enabled" value="1" <?= $checked('online_payment_enabled','1') ?>> Online payments</label>
      <label><input type="checkbox" name="medical_manual_payment_enabled" value="1" <?= $checked('manual_payment_enabled','1') ?>> Manual payment</label>
      <label><input type="checkbox" name="medical_wallet_payment_enabled" value="1" <?= $checked('wallet_payment_enabled','1') ?>> Wallet payments</label>
      <label><input type="checkbox" name="medical_maintenance_mode" value="1" <?= $checked('maintenance_mode') ?>> Maintenance mode</label>
      <label>Maintenance message<input name="medical_maintenance_message" value="<?= $medical('maintenance_message') ?>"></label>
      <label>Latest app version<input name="medical_latest_app_version" value="<?= $medical('latest_app_version','1.0.0') ?>"></label>
      <label>Force-update version<input name="medical_force_update_version" value="<?= $medical('force_update_version') ?>"></label>
    </div>

    <h2>Firebase Cloud Messaging</h2>
    <p>Firebase provides customer phone OTP and notifications. The Android <code>google-services.json</code> files remain inside their respective app flavors and are not uploaded here.</p>
    <div class="grid grid-3">
      <label><input type="checkbox" name="medical_firebase_auth_enabled" value="1" <?= $checked('firebase_auth_enabled','1') ?>> Enable Firebase customer login</label>
      <label><input type="checkbox" name="medical_firebase_phone_auth_enabled" value="1" <?= $checked('firebase_phone_auth_enabled','1') ?>> Enable phone OTP login</label>
      <label><input type="checkbox" name="medical_firebase_push_enabled" value="1" <?= $checked('firebase_push_enabled') ?>> Enable medical push notifications</label>
      <label>Firebase project ID<input name="medical_firebase_project_id" value="<?= $medical('firebase_project_id') ?>" placeholder="aimedix-meds"></label>
      <label>Firebase sender ID<input name="medical_firebase_sender_id" value="<?= $medical('firebase_sender_id') ?>" inputmode="numeric"></label>
      <label style="grid-column:span 3">Firebase service-account JSON
        <textarea name="medical_firebase_service_account_json" rows="7" autocomplete="off" placeholder="Paste the complete service-account JSON. Leave blank to keep the saved credential."></textarea>
        <small><?= $hasFirebaseServiceAccount ? 'A service-account credential is saved. Paste a new JSON only to replace it.' : 'No service-account credential is currently saved.' ?></small>
      </label>
      <label style="grid-column:span 3">Legacy FCM server key (optional)
        <input type="password" name="medical_firebase_server_key" autocomplete="new-password" placeholder="Leave blank to keep the saved key">
        <small><?= $hasFirebaseServerKey ? 'A legacy server key is saved. HTTP v1 service-account JSON is preferred.' : 'No legacy server key is saved. Use service-account JSON for HTTP v1.' ?></small>
      </label>
    </div>

    <h2>Google Maps server routing</h2>
    <p>This private key is used by the backend for Geocoding API and Routes API requests, highlighted delivery polylines, distance, ETA and rerouting. It does not replace the build-time Android Maps SDK keys already configured in the apps.</p>
    <label>Private Google Maps server API key
      <input type="password" name="medical_google_maps_server_api_key" autocomplete="new-password" placeholder="Leave blank to keep the saved key">
      <small><?php if ($hasAdminMapsKey): ?>A server key is saved in Medical Settings.<?php elseif ($hasEnvironmentMapsKey): ?>The Hostinger environment fallback key is active; saving a key here will take priority.<?php else: ?>No server key is configured. Enable both Routes API and Geocoding API for this key.<?php endif; ?></small>
    </label>
    <label>Website Google Maps browser key
      <input name="medical_google_maps_browser_api_key" value="<?= $medical('google_maps_browser_api_key') ?>" autocomplete="off" placeholder="Browser key restricted to aimedixmeds.com">
      <small>Used only by website map pickers. Restrict this key to your website domain and enable Maps JavaScript API.</small>
    </label>

    <h2>Medical payment gateway</h2>
    <div class="grid grid-3">
      <label>Gateway<select name="medical_online_payment_gateway"><?php $current=(string)($settings['medical_online_payment_gateway']??'manual'); foreach(['manual','razorpay','cashfree','phonepe','payu','stripe','custom'] as $gateway): ?><option value="<?= $gateway ?>" <?= $current===$gateway?'selected':'' ?>><?= ucfirst($gateway) ?></option><?php endforeach; ?></select></label>
      <label>Environment<select name="medical_online_payment_environment"><option value="test" <?= $medical('online_payment_environment','test')==='test'?'selected':'' ?>>Test</option><option value="live" <?= $medical('online_payment_environment')==='live'?'selected':'' ?>>Live</option></select></label>
      <label>Public key<input name="medical_online_payment_public_key" value="<?= $medical('online_payment_public_key') ?>"></label>
      <label>Secret key<input type="password" name="medical_online_payment_secret_key" placeholder="Leave blank to keep current secret"></label>
      <label>Webhook secret<input type="password" name="medical_online_payment_webhook_secret" placeholder="Leave blank to keep current secret"></label>
      <label>Merchant ID<input name="medical_online_payment_merchant_id" value="<?= $medical('online_payment_merchant_id') ?>"></label>
      <label>Capture URL<input name="medical_online_payment_capture_url" value="<?= $medical('online_payment_capture_url') ?>"></label>
      <label>Status URL<input name="medical_online_payment_status_url" value="<?= $medical('online_payment_status_url') ?>"></label>
      <label>Refund URL<input name="medical_online_payment_refund_url" value="<?= $medical('online_payment_refund_url') ?>"></label>
    </div>

    <h2>Public business and medical policies</h2>
    <div class="grid grid-3">
      <label>Public business name<input name="public_business_name" value="<?= $value('public_business_name','AIMEDIX MEDS') ?>"></label>
      <label>Legal entity<input name="public_legal_entity" value="<?= $value('public_legal_entity','AIMEDIX MEDS') ?>"></label>
      <label>Support email<input name="public_support_email" type="email" value="<?= $value('public_support_email','support@aimedixmeds.in') ?>"></label>
      <label>Support phone<input name="public_support_phone" value="<?= $value('public_support_phone') ?>"></label>
      <label>Business address<textarea name="public_business_address"><?= $value('public_business_address') ?></textarea></label>
      <label><input type="checkbox" name="public_whatsapp_enabled" value="1" <?= (($settings['public_whatsapp_enabled']??'0')==='1')?'checked':'' ?>> Show WhatsApp button</label>
      <label>WhatsApp number with country code<input name="public_whatsapp_number" value="<?= $value('public_whatsapp_number') ?>" placeholder="919876543210"></label>
      <label>WhatsApp opening message<input name="public_whatsapp_message" value="<?= $value('public_whatsapp_message') ?>"></label>
      <label>Instagram URL<input name="public_instagram_url" value="<?= $value('public_instagram_url') ?>"></label>
      <label>Facebook URL<input name="public_facebook_url" value="<?= $value('public_facebook_url') ?>"></label>
      <label>YouTube URL<input name="public_youtube_url" value="<?= $value('public_youtube_url') ?>"></label>
      <label>X / Twitter URL<input name="public_x_url" value="<?= $value('public_x_url') ?>"></label>
      <label>LinkedIn URL<input name="public_linkedin_url" value="<?= $value('public_linkedin_url') ?>"></label>
      <label>Medical invoice prefix<input name="medical_invoice_prefix" value="<?= $value('medical_invoice_prefix','AIMEDIX') ?>" maxlength="30"></label>
      <label>GSTIN / tax registration<input name="medical_invoice_gstin" value="<?= $value('medical_invoice_gstin') ?>" maxlength="30"></label>
    </div>
    <label>Invoice footer / terms<textarea name="medical_invoice_terms"><?= $value('medical_invoice_terms') ?></textarea></label>
    <label>Prescription fulfilment policy<textarea name="medical_prescription_policy"><?= $value('medical_prescription_policy') ?></textarea></label>
    <label>About AIMEDIX MEDS<textarea name="medical_about_us"><?= $medical('about_us') ?></textarea></label>
    <label>Medical terms<textarea name="medical_terms_conditions"><?= $medical('terms_conditions') ?></textarea></label>
    <label>Medical privacy policy<textarea name="medical_privacy_policy"><?= $medical('privacy_policy') ?></textarea></label>
    <label>Medical refund policy<textarea name="medical_refund_policy"><?= $medical('refund_policy') ?></textarea></label>
    <label>Medical support content<textarea name="medical_support_content"><?= $medical('support_content') ?></textarea></label>
    <button>Save medical settings</button>
  </form>
</section>

<section class="card">
  <h2>Medical Google Maps connection test</h2>
  <?php if (!empty($mapsResult)): ?><div class="<?= !empty($mapsResult['ok'])?'pill':'error' ?>"><?= htmlspecialchars($mapsResult['message']??'') ?><?php if (!empty($mapsResult['place'])): ?><br><small><?= htmlspecialchars($mapsResult['place']) ?></small><?php endif; ?></div><?php endif; ?>
  <form method="post" action="/admin/settings/maps-test">
    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
    <label>Test location<input name="maps_test_query" value="<?= htmlspecialchars((string)($mapsTestQuery ?? 'Lucknow, Uttar Pradesh')) ?>"></label>
    <button>Test Geocoding connection</button>
  </form>
</section>

<section class="card">
  <h2>Medical Firebase notification test</h2>
  <?php if (!empty($pushResult)): ?><div class="<?= !empty($pushResult['ok'])?'pill':'error' ?>"><?= htmlspecialchars($pushResult['message']??'') ?></div><?php endif; ?>
  <form method="post" action="/admin/settings/firebase-test">
    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars(\App\Support\Auth::csrfToken()) ?>">
    <input type="hidden" name="module_key" value="medical">
    <label>Test device token<input name="firebase_test_device_token" value="<?= $medical('firebase_test_device_token') ?>"></label>
    <label>Title<input name="title" value="AIMEDIX MEDS test"></label>
    <label>Message<input name="message" value="Medical notification test from admin."></label>
    <button>Send test notification</button>
  </form>
</section>
