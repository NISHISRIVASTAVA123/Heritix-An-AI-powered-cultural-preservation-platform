import ProtectedLink from '@/components/ProtectedLink';
import { MandalaIcon } from '@/components/Icons';

export default function Home() {
  return (
    <div className="bg-indian-dark bg-indian-pattern min-h-screen relative overflow-hidden">
      
      {/* Background ambient watermarks */}
      <MandalaIcon className="absolute left-[-150px] top-[20%] w-[600px] h-[600px] text-indian-gold/15 animate-[spin_240s_linear_infinite] pointer-events-none z-0" />
      <MandalaIcon className="absolute right-[-150px] top-[60%] w-[600px] h-[600px] text-indian-gold/15 animate-[spin_180s_linear_infinite] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="w-full text-indian-cream border-b border-indian-gold/15 relative overflow-hidden min-h-[600px] lg:min-h-[750px] flex items-center bg-indian-dark z-10">
        {/* Background Image Collage */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/indian-storytelling.jpg')" }}></div>
        {/* Transparent dark overlay for collage visibility & contrast */}
        <div className="absolute inset-0 bg-black/45 z-0"></div>
        {/* Subtle decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] z-0"></div>
        
        <div className="px-8 md:px-20 lg:px-32 py-24 lg:py-36 max-w-7xl mx-auto relative z-10 w-full">
          {/* Glassmorphic text container overlaying the background collage with Tanjore double border */}
          <div className="max-w-2xl bg-black/35 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl space-y-8 border-tanjore">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-indian-cream leading-[1.2]">
              Preserving <span className="font-display italic text-gold-gradient">Voices</span>, <span className="font-display italic text-gold-gradient">Stories</span>, and <span className="font-display italic text-gold-gradient">Wisdom</span>
            </h1>
            <p className="text-lg md:text-xl text-indian-bronze max-w-xl leading-relaxed font-body">
              A sanctuary for our cultural heritage.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <ProtectedLink href="/capture" className="w-full sm:w-auto px-10 py-5 bg-gold-gradient hover:opacity-95 text-indian-dark border border-indian-gold/30 rounded-full font-headline font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer">
                <span className="material-symbols-outlined text-indian-dark" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                Record Knowledge
              </ProtectedLink>
              <ProtectedLink href="/archive" className="w-full sm:w-auto px-10 py-5 bg-transparent border border-indian-gold/50 text-indian-cream hover:text-indian-gold hover:border-indian-gold rounded-full font-headline font-bold text-lg hover:bg-white/5 transition-all duration-500 flex items-center justify-center gap-2 cursor-pointer">
                Explore Archive
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </ProtectedLink>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-indian-emerald bg-indian-pattern text-indian-cream py-32 px-8 md:px-20 lg:px-32 rounded-t-[3rem] lg:rounded-t-[5rem] relative overflow-hidden border-t border-indian-gold/15 z-20">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#faf5ec_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <MandalaIcon className="absolute left-[-150px] top-[10%] w-[500px] h-[500px] text-indian-cream/15 pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 space-y-4">
            <span className="text-indian-gold font-bold tracking-[0.2em] uppercase text-sm font-headline">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-indian-cream">Built for Longevity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            <div className="space-y-6 group p-8 rounded-2xl bg-indian-dark/30 border border-indian-gold/15 hover:border-indian-gold/35 transition-all duration-500 shadow-emerald-glow backdrop-blur-md">
              <div className="w-20 h-20 bg-indian-emerald/60 border border-indian-gold/25 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500">
                <span className="material-symbols-outlined text-4xl text-indian-gold" style={{ fontVariationSettings: "'FILL' 1" }}>settings_voice</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gold-gradient">Record</h3>
              <p className="text-indian-bronze leading-relaxed text-lg">
                Effortless voice capture designed with elder accessibility in mind. No complex menus—just natural conversation transformed into lasting records.
              </p>
            </div>
            <div className="space-y-6 group p-8 rounded-2xl bg-indian-dark/30 border border-indian-gold/15 hover:border-indian-gold/35 transition-all duration-500 shadow-emerald-glow backdrop-blur-md">
              <div className="w-20 h-20 bg-indian-emerald/60 border border-indian-gold/25 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500">
                <span className="material-symbols-outlined text-4xl text-indian-gold" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gold-gradient">Understand</h3>
              <p className="text-indian-bronze leading-relaxed text-lg">
                Our AI identifies cultural nuances, dialects, and forgotten contexts, ensuring the true spirit of the story is captured beyond just the words.
              </p>
            </div>
            <div className="space-y-6 group p-8 rounded-2xl bg-indian-dark/30 border border-indian-gold/15 hover:border-indian-gold/35 transition-all duration-500 shadow-emerald-glow backdrop-blur-md">
              <div className="w-20 h-20 bg-indian-emerald/60 border border-indian-gold/25 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500">
                <span className="material-symbols-outlined text-4xl text-indian-gold" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gold-gradient">Preserve</h3>
              <p className="text-indian-bronze leading-relaxed text-lg">
                Stored in a digital ledger, your family's wisdom is encrypted and archived for centuries, resistant to time and technological decay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Story Highlight */}
      <section className="w-full py-32 px-8 md:px-20 lg:px-32 bg-indian-prussian bg-indian-pattern text-indian-cream border-t border-indian-gold/15 relative overflow-hidden z-20">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#faf5ec_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <MandalaIcon className="absolute right-[-150px] top-[-10%] w-[600px] h-[600px] text-indian-gold/15 animate-[spin_180s_linear_infinite] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="w-full lg:w-1/2 relative">
            <div className="bg-indian-wine/30 backdrop-blur-md rounded-2xl p-8 md:p-12 rotate-2 group hover:rotate-0 transition-all duration-700 border border-indian-gold/25 shadow-wine-glow">
              <div className="aspect-square bg-indian-dark/50 border-tanjore rounded-lg overflow-hidden shadow-inner mb-8 p-3 backdrop-blur-sm">
                <img className="w-full h-full object-cover rounded" alt="Ancient weathered leather book cover with gold detailing" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ouNcFVISpXNpshRrF5SxBIh0u43PM3tR1XhWS_rHdR9PZJ8RzIn_9C1ASRE2nPAzTP0U5XrqpMTEzrE0eeOwiG9MkwXnTGX-n5aqoYnsh--XTvxmDAklHzUJP9M5LX7cK736Wfe-4x5ZfDLQu2dgQirKtvZcCxY2b_F2YnOFADUPLea_5GYavLoYlGfvvV_RJ-_ZMIiAs_j_1FoUDaC1bjuWScVQ3M6JJuy0zcumZ0zH3qrSLpAv1a6EXE8lD_OMHCAIionlyV8d" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-[1px] bg-indian-gold"></span>
                  <span className="text-indian-gold font-bold uppercase tracking-widest text-xs font-headline">Featured Entry</span>
                </div>
                <p className="font-serif italic text-2xl text-indian-cream leading-snug">
                  "The way my grandmother spoke of the river wasn't just geography; it was an ancestor. I never wanted to lose that rhythm."
                </p>
                <p className="text-indian-bronze font-body">— Elder Sarah Chen</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-8 lg:pl-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gold-gradient leading-tight">A Library that Breathes</h2>
            <p className="text-xl text-indian-bronze leading-relaxed font-body">
              Heritix is not a database; it is a sanctuary. We prioritize the human element of archiving, using technology to bridge the gap between generations rather than replace the intimacy of storytelling.
            </p>
            <div className="pt-4">
              <ProtectedLink href="/archive" className="inline-flex items-center gap-4 text-indian-gold hover:text-indian-cream font-bold text-lg group transition-colors duration-300">
                Explore the Archive
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
              </ProtectedLink>
            </div>
          </div>
        </div>
      </section>

      {/* Audio-Visual Pill Component (CTA Section) */}
      <section className="w-full bg-indian-dark bg-indian-pattern pt-20 pb-40 px-8 md:px-20 lg:px-32 border-t border-indian-gold/15 relative overflow-hidden z-20">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#faf5ec_1px,transparent_1px)] [background-size:30px_30px]"></div>
        <div className="max-w-5xl mx-auto bg-indian-wine/25 backdrop-blur-md p-4 md:p-6 rounded-3xl md:rounded-full flex flex-col md:flex-row items-center justify-between gap-6 border-tanjore shadow-wine-glow relative z-10">
          <div className="flex items-center gap-6 px-4">
            <div className="w-16 h-16 bg-gold-gradient text-indian-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-lg hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </div>
            <div>
              <p className="font-serif font-bold text-indian-cream text-lg">Listen to the Archive</p>
              <p className="text-indian-bronze text-sm">Sample: The Loom Workers of Lyon (1942)</p>
            </div>
          </div>
          <div className="hidden md:flex flex-grow px-8 items-center gap-2">
            <div className="h-1 flex-grow bg-indian-gold/20 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-indian-gold rounded-full"></div>
            </div>
            <span className="text-xs font-mono text-indian-gold font-bold">04:22 / 12:45</span>
          </div>
          <ProtectedLink href="/capture" className="px-8 py-4 bg-gold-gradient text-indian-dark hover:opacity-95 border border-indian-gold/30 rounded-full font-headline font-bold transition-all hover:scale-105 active:scale-95 text-center cursor-pointer">
            Start Your Story
          </ProtectedLink>
        </div>
      </section>
    </div>
  );
}
