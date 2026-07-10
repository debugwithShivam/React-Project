// Dark, minimal footer to pair with the product page.
// Same tone as the hero panel: charcoal bg, quiet type, one accent (blue) on hover.

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
  </svg>
);
const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.1 4.1 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.8A8.2 8.2 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1Z" />
  </svg>
);
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LINK_GROUPS = [
  {
    title: "Shop",
    links: ["Books", "Shoes", "New Arrivals", "Best Sellers"],
  },
  {
    title: "Support",
    links: ["Track Order", "Shipping Info", "Returns", "FAQs"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact", "Privacy Policy"],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#22252b] text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:px-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="text-lg font-semibold tracking-tight text-white">
            URBANY<span className="text-blue-500">.</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
            Curated books and footwear for the everyday man — quality picked
            over quantity.
          </p>
          <div className="mt-5 flex items-center gap-4 text-neutral-400">
            <FacebookIcon className="h-4 w-4 cursor-pointer hover:text-white" />
            <TwitterIcon className="h-4 w-4 cursor-pointer hover:text-white" />
            <InstagramIcon className="h-4 w-4 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Link groups */}
        {LINK_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {group.title}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {group.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-neutral-400 transition hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter */}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Newsletter
          </p>
          <p className="mt-4 text-sm text-neutral-400">
            Get offers before anyone else.
          </p>
          <form className="mt-3 flex overflow-hidden rounded-full border border-neutral-600">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-transparent px-4 py-2 text-sm text-white placeholder:text-neutral-500 outline-none"
            />
            <button className="bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-neutral-500 sm:flex-row lg:px-10">
          <span>© {new Date().getFullYear()} Urbany. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-neutral-300">Terms</a>
            <a href="#" className="hover:text-neutral-300">Privacy</a>
            <a href="#" className="hover:text-neutral-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
