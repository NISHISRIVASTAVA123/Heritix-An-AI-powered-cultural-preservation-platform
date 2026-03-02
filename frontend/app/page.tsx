import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Hero Section */}
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-8 leading-tight">
          Preserving Voices, Stories,<br />and Wisdom for Future Generations
        </h1>
        <p className="text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto font-light leading-relaxed">
          Share and explore traditional knowledge through simple voice recordings.
          Our AI helps organize and translate cultural wisdom to keep it alive.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="relative mb-20 group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
        <Link
          href="/capture"
          className="relative z-10 flex flex-col items-center justify-center w-40 h-40 md:w-56 md:h-56 bg-primary text-white rounded-full shadow-2xl hover:bg-amber-800 hover:scale-105 transition-all duration-300"
        >
          <span className="text-5xl md:text-6xl mb-2">🎙️</span>
          <span className="text-lg md:text-xl font-bold uppercase tracking-wider">Record<br />Knowledge</span>
        </Link>

        <div className="mt-8">
          <Link href="/archive" className="text-primary font-bold text-lg hover:underline underline-offset-4 decoration-2">
            Or Explore the Archive →
          </Link>
        </div>
      </div>

      {/* Feature Icons */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-6xl mx-auto">
        <div className="p-8 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-5xl mb-6">🗣️</div>
          <h3 className="text-2xl font-serif font-bold mb-3 text-text-charcoal">Voice First</h3>
          <p className="text-stone-600 leading-relaxed">Simply speak to record stories. No typing required. We handle transcription and translation.</p>
        </div>
        <div className="p-8 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-5xl mb-6">🧠</div>
          <h3 className="text-2xl font-serif font-bold mb-3 text-text-charcoal">AI Understanding</h3>
          <p className="text-stone-600 leading-relaxed">Our agents analyze content to extract cultural context, morals, and educational value.</p>
        </div>
        <div className="p-8 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-5xl mb-6">🌿</div>
          <h3 className="text-2xl font-serif font-bold mb-3 text-text-charcoal">Living Archive</h3>
          <p className="text-stone-600 leading-relaxed">A permanent, searchable home for local traditions, accessible to the next generation.</p>
        </div>
      </div>
    </div>
  );
}
