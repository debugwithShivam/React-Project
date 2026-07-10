import { ArrowRight, Headphones } from "lucide-react";

// lucide-react dropped brand/logo icons in newer versions (trademark reasons),
// so the social icons are simple inline SVGs instead of a lucide import.
const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.6 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1Z" />
  </svg>
);

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.5 21v-7.5H16l.4-3H13.5V8.4c0-.9.2-1.5 1.5-1.5h1.6V4.3C16.3 4.2 15.3 4 14.2 4c-2.4 0-4 1.5-4 4.1V10.5H7.7v3h2.5V21h3.3Z" />
  </svg>
);

const Youtube = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="2.5" y="6" width="19" height="12" rx="3" />
    <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#8b5cf6] via-[#6d28d9] to-[#0f0a1f] text-white">
      {/* soft glow accents to echo the hero background */}
      <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8 sm:px-10 lg:px-16">
        {/* Top: brand + newsletter */}
        <div className="flex flex-col gap-10 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <Headphones className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-2xl font-semibold tracking-wide">MCODE</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Minimal design with powerful smart features, built for daily
              travel and mobility. Portable luxury, wherever you go.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-sm"
          >
            <label className="mb-2 block text-sm font-medium text-white/80">
              Get product drops in your inbox
            </label>
            <div className="flex items-center rounded-full bg-white/10 p-1.5 backdrop-blur-md ring-1 ring-white/15">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-white/40 outline-none"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-purple-700 transition hover:bg-white/90"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Middle: link columns */}
        <div className="grid grid-cols-2 gap-10 py-12 sm:grid-cols-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Shop</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li><a href="#" className="transition hover:text-white">Home</a></li>
              <li><a href="#" className="transition hover:text-white">Product</a></li>
              <li><a href="#" className="transition hover:text-white">Order</a></li>
              <li><a href="#" className="transition hover:text-white">Setting</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li><a href="#" className="transition hover:text-white">Features</a></li>
              <li><a href="#" className="transition hover:text-white">Specs</a></li>
              <li><a href="#" className="transition hover:text-white">Warranty</a></li>
              <li><a href="#" className="transition hover:text-white">Reviews</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Support</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li><a href="#" className="transition hover:text-white">Track Order</a></li>
              <li><a href="#" className="transition hover:text-white">Shipping</a></li>
              <li><a href="#" className="transition hover:text-white">Returns</a></li>
              <li><a href="#" className="transition hover:text-white">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li><a href="#" className="transition hover:text-white">About</a></li>
              <li><a href="#" className="transition hover:text-white">Careers</a></li>
              <li><a href="#" className="transition hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom: copyright + socials */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} MCODE. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition hover:bg-white hover:text-purple-700"
                aria-label="social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
