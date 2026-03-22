"use client";

import Link from 'next/link';

export default function Navbar() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#faf9f4]/80 dark:bg-[#1b1c19]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(27,28,25,0.06)] flex justify-between items-center px-8 py-6 max-w-none">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-2xl font-bold tracking-tight text-[#154212] dark:text-[#d0e8c2]">FolkLore AI</span>
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-10">
        <Link className="font-headline font-semibold text-sm tracking-wide text-[#1b1c19]/60 dark:text-[#faf9f4]/60 hover:text-[#154212] transition-all duration-500 ease-in-out" href="/archive">Archive</Link>
        <Link className="font-headline font-semibold text-sm tracking-wide text-[#1b1c19]/60 dark:text-[#faf9f4]/60 hover:text-[#154212] transition-all duration-500 ease-in-out" href="#">Stories</Link>
        <Link className="font-headline font-semibold text-sm tracking-wide text-[#1b1c19]/60 dark:text-[#faf9f4]/60 hover:text-[#154212] transition-all duration-500 ease-in-out" href="#">Oral Histories</Link>
        <Link className="font-headline font-semibold text-sm tracking-wide text-[#1b1c19]/60 dark:text-[#faf9f4]/60 hover:text-[#154212] transition-all duration-500 ease-in-out" href="#">Collections</Link>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface-container/50 dark:hover:bg-[#2d2e2a]/50 transition-all duration-500 ease-in-out scale-95 active:scale-90" aria-label="Toggle theme">
          <span className="material-symbols-outlined text-[#154212] dark:text-[#d0e8c2] block dark:hidden" style={{ fontVariationSettings: "'FILL' 0" }}>dark_mode</span>
          <span className="material-symbols-outlined text-[#154212] dark:text-[#d0e8c2] hidden dark:block" style={{ fontVariationSettings: "'FILL' 0" }}>light_mode</span>
        </button>
      </div>
    </nav>
  );
}
