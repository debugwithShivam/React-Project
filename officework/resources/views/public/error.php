<main class="service-page">
  <section class="service-hero" style="grid-template-columns:1fr;min-height:440px;text-align:center">
    <div style="max-width:760px;margin:auto">
      <span class="pill">Temporary problem</span>
      <h1>We could not load this page</h1>
      <p>Your information is safe. Please try again in a moment. If the problem continues, share reference <strong><?= htmlspecialchars((string)($errorReference ?? ''), ENT_QUOTES) ?></strong> with support.</p>
      <div class="hero-actions" style="justify-content:center">
        <a class="btn btn-orange" href="javascript:location.reload()">Try again</a>
        <a class="btn btn-outline" href="/">Return home</a>
        <a class="btn btn-outline" href="/contact">Contact support</a>
      </div>
    </div>
  </section>
</main>
