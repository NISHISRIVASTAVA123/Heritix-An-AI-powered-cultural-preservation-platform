import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-5xl font-serif font-bold text-amber-900 mb-6">Preserve Cultural Heritage with AI</h1>
      <p className="text-xl text-stone-700 max-w-2xl mb-10">
        Heritix allows you to capture oral histories, traditions, and knowledge using voice.
        Our AI agents categorize and extract wisdom to keep culture alive for future generations.
      </p>

      <div className="flex gap-6">
        <Link href="/capture" className="bg-amber-800 hover:bg-amber-900 text-white px-8 py-4 rounded-lg text-lg font-semibold transition shadow-lg">
          Start Recording
        </Link>
        <Link href="/archive" className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-8 py-4 rounded-lg text-lg font-semibold transition shadow-md">
          Explore Archive
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl">
        <div className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-amber-800">Voice Capture</h3>
          <p className="text-stone-600">Simply speak to record stories. We handle the transcription and translation automatically.</p>
        </div>
        <div className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-amber-800">AI Analysis</h3>
          <p className="text-stone-600">Our agents identify key entities, cultural context, and generate educational summaries.</p>
        </div>
        <div className="p-6 border border-stone-200 rounded-xl bg-white shadow-sm">
          <h3 className="text-xl font-bold mb-2 text-amber-800">Living Archive</h3>
          <p className="text-stone-600">A searchable database of cultural knowledge, accessible to everyone.</p>
        </div>
      </div>
    </div>
  );
}
