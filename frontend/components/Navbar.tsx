"use client";

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#faf9f4]/80 dark:bg-[#1b1c19]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(27,28,25,0.06)] flex justify-between items-center px-8 py-6 max-w-none">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-2xl font-bold tracking-tight text-[#154212] dark:text-[#d0e8c2]">FolkLore AI</span>
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-2">
        {[
          { name: 'Home', href: '/' },
          { name: 'Archive', href: '/archive' },
          { name: 'Record Stories', href: '/capture' }
        ].map((link, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <Link
              key={link.name}
              href={link.href}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative px-4 py-2 rounded-full transition-all duration-300"
            >
              {isHovered && (
                <motion.div
                  layoutId="navbar-pill"
                  className="absolute inset-0 bg-[#154212]/10 dark:bg-[#d0e8c2]/10 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <span className={`relative z-10 font-headline font-semibold text-sm tracking-wide transition-colors duration-300 ${isHovered ? 'text-[#154212] dark:text-[#d0e8c2]' : 'text-[#1b1c19]/60 dark:text-[#faf9f4]/60'}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 flex items-center justify-center rounded-full hover:bg-surface-container/50 dark:hover:bg-[#2d2e2a]/50 transition-all duration-500 ease-in-out scale-95 active:scale-90" aria-label="Toggle theme">
          {mounted && theme === 'dark' ? (
            <Moon className="w-5 h-5 text-[#d0e8c2]" />
          ) : mounted ? (
            <Sun className="w-5 h-5 text-[#154212]" />
          ) : (
            <div className="w-5 h-5" />
          )}
        </button>
      </div>
    </nav>
  );
}
