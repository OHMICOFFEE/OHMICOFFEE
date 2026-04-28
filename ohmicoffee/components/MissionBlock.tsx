export default function MissionBlock({ meals, story }: { meals: number, story: string }) {
  return (
    <section className="grid grid-cols-2 min-h-[55vh]">
      <div className="bg-red px-10 py-16 flex flex-col justify-end relative overflow-hidden">
        <div className="absolute top-0 left-0 font-cond font-black text-[9rem] text-black/10 leading-none uppercase pointer-events-none whitespace-nowrap">
          FROM OUR CUP
        </div>
        <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-white/60 font-bold mb-4 relative z-10">
          The OHMI Foundation
        </p>
        <h2 className="font-cond font-black uppercase text-[4.2rem] leading-[0.85] text-white relative z-10 mb-5">
          FROM<br/>OUR CUP<br/><span className="opacity-50">TO<br/>THEIR<br/>CUP</span>
        </h2>
        <p className="text-white/65 text-[12.5px] leading-[2] font-light max-w-[420px] mb-6 relative z-10">{story}</p>
        <button className="bg-white text-black font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-7 py-3 w-fit hover:opacity-90 transition-opacity relative z-10">
          Learn More
        </button>
      </div>
      <div className="grid grid-cols-2 gap-px bg-white/[0.05]">
        {[
          [meals.toString(), 'Meals Served'],
          ['20%', 'Profits Donated'],
          ['6', 'Partner Kitchens'],
          ['∞', 'Children Impacted'],
        ].map(([n, l]) => (
          <div key={l} className="bg-[#141414] flex flex-col justify-end p-8">
            <div className="font-cond font-black text-[3.8rem] text-red leading-none">{n}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/25 mt-2">{l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
