import Link from 'next/link';

export default function Home() {
  return (
    <div className="pt-32">
      {/* Hero Section */}
      <section className="px-8 md:px-20 lg:px-32 py-20 lg:py-40 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-10">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-primary leading-[1.1]">
              Preserving Voices, Stories, and Wisdom for Future Generations
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl leading-relaxed font-body">
              A digital sanctuary dedicated to the living ledger of our cultural heritage. FolkLore AI helps families and communities document oral histories with the dignity they deserve.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <Link href="/capture" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full font-headline font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                Record Knowledge
              </Link>
              <Link href="/archive" className="w-full sm:w-auto px-10 py-5 bg-secondary-fixed text-on-secondary-fixed rounded-full font-headline font-bold text-lg hover:bg-secondary-container transition-all duration-500 flex items-center justify-center gap-2">
                Explore Archive
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-4 hidden lg:block">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 rounded-xl blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <img className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-1000" alt="Close up of elderly hands holding a vintage photograph" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByGhz_I7gC-YOiistrEm_vx0bVs2VolV0i4igD22hI3koLN-n_8rbvUH-fWh8XMaWMim6LQvMdz33rGrX51kcm7UbjenzBQYtXLntFucqEJ3WX3A8bI0r_9QWcTga662NebWIh2824hz8PtDZGW1HGg3fuSk0BvkOoKG2hWhcKrPWaEHRcDl0ncb9yFwjVvl9sVoR-b7u0TCFaGDjPH5ehKOMNDVFOj-jKjJeuCZf7wTtxF1gU8I93CGzSIveM5JcRannqgBIqfAOo" fetchPriority="high" decoding="sync" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-container py-32 px-8 md:px-20 lg:px-32 rounded-t-[3rem] lg:rounded-t-[5rem]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 space-y-4">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-bold text-on-surface">Built for Longevity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            <div className="space-y-6 group">
              <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500">
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>settings_voice</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface">Record</h3>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                Effortless voice capture designed with elder accessibility in mind. No complex menus—just natural conversation transformed into lasting records.
              </p>
            </div>
            <div className="space-y-6 group">
              <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500">
                <span className="material-symbols-outlined text-4xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface">Understand</h3>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                Our AI identifies cultural nuances, dialects, and forgotten contexts, ensuring the true spirit of the story is captured beyond just the words.
              </p>
            </div>
            <div className="space-y-6 group">
              <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500">
                <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface">Preserve</h3>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                Stored in a decentralized digital ledger, your family's wisdom is encrypted and archived for centuries, resistant to time and technological decay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Story Highlight */}
      <section className="py-32 px-8 md:px-20 lg:px-32 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="w-full lg:w-1/2 relative">
            <div className="bg-surface-container-high rounded-lg p-8 md:p-12 rotate-2 group hover:rotate-0 transition-all duration-700">
              <div className="aspect-square bg-surface-container-lowest rounded-lg overflow-hidden shadow-inner mb-8">
                <img className="w-full h-full object-cover" alt="Ancient weathered leather book cover with gold detailing" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ouNcFVISpXNpshRrF5SxBIh0u43PM3tR1XhWS_rHdR9PZJ8RzIn_9C1ASRE2nPAzTP0U5XrqpMTEzrE0eeOwiG9MkwXnTGX-n5aqoYnsh--XTvxmDAklHzUJP9M5LX7cK736Wfe-4x5ZfDLQu2dgQirKtvZcCxY2b_F2YnOFADUPLea_5GYavLoYlGfvvV_RJ-_ZMIiAs_j_1FoUDaC1bjuWScVQ3M6JJuy0zcumZ0zH3qrSLpAv1a6EXE8lD_OMHCAIionlyV8d" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-[1px] bg-primary"></span>
                  <span className="text-primary font-bold uppercase tracking-widest text-xs">Featured Entry</span>
                </div>
                <p className="font-headline italic text-2xl text-on-surface leading-snug">
                  "The way my grandmother spoke of the river wasn't just geography; it was an ancestor. I never wanted to lose that rhythm."
                </p>
                <p className="text-on-surface-variant font-body">— Elder Sarah Chen</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-8 lg:pl-12">
            <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">A Library that Breathes</h2>
            <p className="text-xl text-on-surface-variant leading-relaxed font-body">
              FolkLore AI is not a database; it is a sanctuary. We prioritize the human element of archiving, using technology to bridge the gap between generations rather than replace the intimacy of storytelling.
            </p>
            <div className="pt-4">
              <Link href="/archive" className="inline-flex items-center gap-4 text-primary font-bold text-lg group">
                Explore the Archive
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Audio-Visual Pill Component (CTA Section) */}
      <section className="pb-40 px-8 md:px-20 lg:px-32">
        <div className="max-w-5xl mx-auto bg-tertiary-container/10 p-4 md:p-6 rounded-full flex flex-col md:flex-row items-center justify-between gap-6 border border-tertiary-container/20">
          <div className="flex items-center gap-6 px-4">
            <div className="w-16 h-16 bg-tertiary-container text-on-tertiary rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface text-lg">Listen to the Archive</p>
              <p className="text-on-surface-variant text-sm">Sample: The Loom Workers of Lyon (1942)</p>
            </div>
          </div>
          <div className="hidden md:flex flex-grow px-8 items-center gap-2">
            <div className="h-1 flex-grow bg-tertiary-container/20 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-tertiary-container rounded-full"></div>
            </div>
            <span className="text-xs font-mono text-tertiary-container font-bold">04:22 / 12:45</span>
          </div>
          <Link href="/capture" className="px-8 py-4 bg-tertiary text-on-tertiary rounded-full font-bold hover:bg-tertiary/90 transition-all text-center">
            Start Your Story
          </Link>
        </div>
      </section>
    </div>
  );
}
