import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white py-4 shadow-lg border-b-4 border-highlight/30 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="text-2xl font-bold font-serif tracking-wide hover:text-highlight transition-colors flex items-center gap-2">
          <span>🌿</span> FolkLore AI
        </Link>
        <div className="flex gap-8 font-medium">
          <Link href="/capture" className="hover:text-highlight transition-colors flex items-center gap-1">
            <span>🎙️</span> Record
          </Link>
          <Link href="/archive" className="hover:text-highlight transition-colors flex items-center gap-1">
            <span>📚</span> Archive
          </Link>
        </div>
      </div>
    </nav>
  );
}
