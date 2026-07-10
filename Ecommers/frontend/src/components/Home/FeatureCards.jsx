import FeatureCardsImg from './FeatureCards.png' 
export default function FeatureCards() {
  return (
    <section className="bg-white px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Card 1 - light, larger, with image */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ece9f7] to-[#dcd6f2] p-8">
          <h3 className="max-w-[70%] text-2xl font-semibold text-[#1c1730]">
            Capital that grows
          </h3>
          <p className="mt-4 max-w-[65%] text-sm leading-relaxed text-[#1c1730]/60">
            Earn passive income as your stablecoins are deployed into
            high-performing DeFi protocols.
          </p>

          <div className="pointer-events-none absolute  right-0  bottom-0 top-0 flex w-80 items-center justify-center">
            <img src={FeatureCardsImg} alt="" className="h-50 w-full " />
          </div>
        </div>

        <div className="rounded-3xl bg-[#1c1730] p-8">
          <h3 className="text-xl font-semibold leading-snug text-white">
            Always liquid,
            <br />
            always stable
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Stay fully dollar-pegged with instant access to your funds — no
            lockups or delays.
          </p>
        </div>

        {/* Card 3 - dark with expand icon */}
        <div className="relative rounded-3xl bg-[#1c1730] p-8">
          <h3 className="text-xl font-semibold leading-snug text-white">
            100%
            <br />
            hands-free
          </h3>
          <p className="mt-4 max-w-[80%] text-sm leading-relaxed text-white/50">
            No need to manage strategies manually. USD Bloom works in the
            background for you.
          </p>

          <button
            aria-label="Expand"
            className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M9 15 3 21M3 21v-5M3 21h5" />
              <path d="M15 9l6-6M21 3v5M21 3h-5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
