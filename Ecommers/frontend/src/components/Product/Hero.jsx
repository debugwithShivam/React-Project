export default function Hero() {
  let data = new Date().getDate()
  return (
    <div className="min-h-scree n bg-[#f7f6f3] text-[#d65a3a] px-6 md:px-10  p-4">
      
      <nav className="flex items-center justify-between py-6">
        <div className="text-sm uppercase tracking-wide cursor-pointer">
          MENU <span className="ml-1">{data}</span>
        </div>

        <div className="text-2xl font-medium tracking-tight">
          detox *
        </div>

        <div className="flex items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#D75A3C"><path d="M480-427ZM240-120q-50 0-85-35t-35-85v-240q0-24 9-46t26-39l240-240q17-18 39.5-26.5T480-840q23 0 45 8.5t40 26.5l240 240q17 17 26 39t9 46v240q0 50-35 85t-85 35H240Zm0-80h480q17 0 28.5-11.5T760-240v-240q0-8-3-15t-9-13L595-662l-59 58 144 144v180H280v-180l258-258-30-30q-8-8-15.5-10t-12.5-2q-5 0-12.5 2T452-748L212-508q-6 6-9 13t-3 15v240q0 17 11.5 28.5T240-200Zm120-160h240v-67L480-547 360-427v67Z"/></svg>
          

          <button className="bg-[#d65a3a] text-white px-4 py-2 text-sm uppercase">
            Use For Free
          </button>
        </div>
      </nav>

      <section className="mt-20 flex flex-col md:flex-row justify-between items-start gap-10">
        
        <div className="max-w-3xl">
          <h1 className="text-[70px] md:text-[120px] leading-[0.9] font-light tracking-tight">
            fresh, daily,
            <br />
            mindful
          </h1>
        </div>

        <div className="max-w-xs mt-4 md:mt-16">
          <p className="text-sm md:text-base leading-relaxed border-b border-dashed pb-2">
            cold-pressed juices, smoothies & bowls — served daily from 8 am to 8 pm at 123 green street, brooklyn.
          </p>
        </div>
      </section>
    </div>
  );
}