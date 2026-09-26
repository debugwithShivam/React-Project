<?php
$browserMapsKey = trim((string) ($publicSettings['medical_google_maps_browser_api_key'] ?? ''));
?>
<main class="service-page">
  <section class="service-hero" style="grid-template-columns:minmax(0,1fr) minmax(320px,.8fr)">
    <div>
      <span class="pill">Healthcare partner onboarding</span>
      <h1>Serve patients through AIMEDIX MEDS</h1>
      <p>Register your pharmacy, diagnostic laboratory or clinic. Select the exact premises location so we can verify its service area before administrator review.</p>
      <div class="notice">Your account remains pending until the licence and business details are verified by an administrator.</div>
    </div>
    <div class="service-symbol">+</div>
  </section>

  <section class="section" style="max-width:1100px;margin-inline:auto">
    <h2 class="section-title">Partner registration</h2>
    <p class="section-copy">Fields marked required must be completed. Your entered details are preserved if a recoverable error occurs.</p>

    <form id="partner-registration" style="display:grid;gap:16px;margin-top:28px">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px">
        <label>Partner type
          <select name="provider_type" required>
            <option value="pharmacy">Pharmacy / medical store</option>
            <option value="lab">Diagnostic laboratory</option>
            <option value="doctor">Doctor / clinic</option>
          </select>
        </label>
        <label>Owner / doctor name<input name="name" required maxlength="190" autocomplete="name"></label>
        <label>Business / clinic name<input name="business_name" required maxlength="190" autocomplete="organization"></label>
        <label>Phone number<input name="phone" required maxlength="20" inputmode="tel" autocomplete="tel"></label>
        <label>Email<input name="email" type="email" maxlength="190" autocomplete="email"></label>
        <label>Licence / registration number<input name="license_number" required maxlength="120"></label>
        <label id="speciality-field" hidden>Speciality<input name="speciality" maxlength="120"></label>
        <label>Password<input name="password" type="password" required minlength="8" autocomplete="new-password"></label>
      </div>

      <div>
        <h3>Premises location</h3>
        <?php if ($browserMapsKey === ''): ?>
          <div class="notice" role="alert">Website location selection is not configured yet. Ask the administrator to add the Website Google Maps browser key in Medical Settings.</div>
        <?php else: ?>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
            <input id="map-search" placeholder="Search area, landmark or address" style="flex:1;min-width:240px">
            <button class="btn btn-outline" id="map-search-button" type="button">Search</button>
            <button class="btn btn-outline" id="map-current-button" type="button">Use my location</button>
          </div>
          <div id="partner-map" style="height:390px;border-radius:22px;border:1px solid var(--border-hairline);overflow:hidden" aria-label="Select premises on map"></div>
          <p id="selected-location" class="section-copy" aria-live="polite">Tap the map to select your premises.</p>
        <?php endif; ?>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px">
        <label>Shop / clinic number and building<input name="address_line" required maxlength="190"></label>
        <label>Floor (optional)<input name="floor" maxlength="80"></label>
        <label>Nearby landmark (optional)<input name="landmark" maxlength="190"></label>
      </div>
      <label style="display:flex;gap:10px;align-items:flex-start"><input name="terms" type="checkbox" required style="width:auto;margin-top:5px"> I confirm these details are correct and agree to the <a href="/terms" style="color:var(--brand-blue)">partner terms</a>.</label>
      <div id="registration-status" role="status" aria-live="polite"></div>
      <button class="btn btn-dark" type="submit" <?= $browserMapsKey === '' ? 'disabled' : '' ?>>Submit for verification</button>
    </form>
  </section>
</main>

<?php if ($browserMapsKey !== ''): ?>
<script>
(() => {
  const form = document.getElementById('partner-registration');
  const status = document.getElementById('registration-status');
  const role = form.elements.provider_type;
  const speciality = document.getElementById('speciality-field');
  let map, marker, geocoder, selected = null;

  const setStatus = (message, ok = false) => {
    status.className = ok ? 'pill' : 'notice';
    status.textContent = message;
  };
  const friendlyError = (error) => {
    if (!navigator.onLine) return 'You appear to be offline. Check your connection and try again.';
    return error && error.message ? error.message : 'We could not complete the request. Please try again.';
  };
  role.addEventListener('change', () => {
    speciality.hidden = role.value !== 'doctor';
    speciality.querySelector('input').required = role.value === 'doctor';
  });

  async function selectPoint(position) {
    marker.setPosition(position);
    map.panTo(position);
    selected = null;
    document.getElementById('selected-location').textContent = 'Checking this service area…';
    const location = {latitude: position.lat(), longitude: position.lng()};
    const addressResult = await new Promise((resolve) => geocoder.geocode({location: position}, (results, code) => resolve(code === 'OK' ? results[0] : null)));
    const components = addressResult ? addressResult.address_components : [];
    const component = type => {
      const found = components.find(item => item.types.includes(type));
      return found ? found.long_name : '';
    };
    const metadata = {
      address: addressResult ? addressResult.formatted_address : 'Selected premises',
      city: component('locality') || component('administrative_area_level_3'),
      state: component('administrative_area_level_1'),
      pincode: component('postal_code')
    };
    const response = await fetch('/api/v1/zones/resolve', {
      method: 'POST', headers: {'Accept':'application/json','Content-Type':'application/json'},
      body: JSON.stringify({...location, pincode: metadata.pincode, city: metadata.city})
    });
    const payload = await response.json();
    const zone = payload && payload.data ? payload.data.zone : null;
    if (!response.ok || !zone) {
      document.getElementById('selected-location').textContent = 'This premises is outside our active service areas. Choose another location.';
      return;
    }
    selected = {...location, ...metadata, zone_id: Number(zone.id)};
    document.getElementById('selected-location').textContent = `${metadata.address} · Service zone: ${zone.name}`;
  }

  window.initPartnerMap = () => {
    const initial = {lat: 28.6139, lng: 77.2090};
    map = new google.maps.Map(document.getElementById('partner-map'), {center: initial, zoom: 12, streetViewControl: false, mapTypeControl: false});
    marker = new google.maps.Marker({map, position: initial, draggable: true});
    geocoder = new google.maps.Geocoder();
    map.addListener('click', event => selectPoint(event.latLng).catch(error => setStatus(friendlyError(error))));
    marker.addListener('dragend', event => selectPoint(event.latLng).catch(error => setStatus(friendlyError(error))));
    document.getElementById('map-search-button').addEventListener('click', () => {
      const address = document.getElementById('map-search').value.trim();
      if (address.length < 3) return setStatus('Enter at least three characters to search.');
      geocoder.geocode({address, region:'IN'}, (results, code) => {
        if (code !== 'OK' || !results[0]) return setStatus('No matching address was found. Try a nearby landmark.');
        selectPoint(results[0].geometry.location).catch(error => setStatus(friendlyError(error)));
      });
    });
    document.getElementById('map-current-button').addEventListener('click', () => {
      if (!navigator.geolocation) return setStatus('Location is not supported by this browser. Search for the address instead.');
      navigator.geolocation.getCurrentPosition(
        value => selectPoint(new google.maps.LatLng(value.coords.latitude, value.coords.longitude)).catch(error => setStatus(friendlyError(error))),
        () => setStatus('Location permission was not granted. Search for the address or allow location in browser settings.'),
        {enableHighAccuracy:true, timeout:12000}
      );
    });
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!selected) return setStatus('Select and verify the premises location on the map.');
    const submit = form.querySelector('button[type=submit]');
    submit.disabled = true;
    submit.textContent = 'Submitting…';
    try {
      const values = Object.fromEntries(new FormData(form).entries());
      delete values.terms;
      const response = await fetch('/api/v1/providers/register', {
        method:'POST', headers:{'Accept':'application/json','Content-Type':'application/json'},
        body:JSON.stringify({...values, ...selected})
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Registration could not be submitted.');
      form.reset(); selected = null;
      setStatus(payload.message || 'Registration submitted for administrator verification.', true);
    } catch (error) {
      setStatus(friendlyError(error));
    } finally {
      submit.disabled = false;
      submit.textContent = 'Submit for verification';
    }
  });
})();
</script>
<script async src="https://maps.googleapis.com/maps/api/js?key=<?= rawurlencode($browserMapsKey) ?>&loading=async&callback=initPartnerMap"></script>
<?php endif; ?>
