import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-amber-900 text-amber-50 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold font-serif">
          HERITIX
        </Link>
        <div className="space-x-6">
          <Link href="/capture" className="hover:text-amber-200 transition">Capture</Link>
          <Link href="/archive" className="hover:text-amber-200 transition">Archive</Link>
          <Link href="/dashboard" className="hover:text-amber-200 transition">Learn</Link>
        </div>
      </div>
    </nav>
  );
}
