"use client";

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import ProtectedLink from './ProtectedLink';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-indian-dark/65 border-b border-indian-gold/20 backdrop-blur-xl shadow-lg flex justify-between items-center px-8 py-6 max-w-none">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-2xl font-serif font-bold tracking-widest text-gold-gradient">Heritix</span>
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-2">
        {[
          { name: 'Home', href: '/' },
          { name: 'Archive', href: '/archive' },
          { name: 'Heritage Map', href: '/explore' },
          { name: 'Record Stories', href: '/capture' }
        ].map((link, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <ProtectedLink
              key={link.name}
              href={link.href}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative px-4 py-2 rounded-full transition-all duration-300"
            >
              {isHovered && (
                <motion.div
                  layoutId="navbar-pill"
                  className="absolute inset-0 bg-indian-gold/15 rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <span className={`relative z-10 font-headline font-semibold text-sm tracking-wide transition-colors duration-300 ${isHovered ? 'text-indian-gold' : 'text-indian-cream/80'}`}>
                {link.name}
              </span>
            </ProtectedLink>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 flex items-center justify-center rounded-full hover:bg-indian-dark/50 transition-all duration-500 ease-in-out scale-95 active:scale-90" aria-label="Toggle theme">
          {mounted && theme === 'dark' ? (
            <Moon className="w-5 h-5 text-indian-gold" />
          ) : mounted ? (
            <Sun className="w-5 h-5 text-indian-gold" />
          ) : (
            <div className="w-5 h-5" />
          )}
        </button>
 
        {!isSignedIn && isLoaded && (
          <SignInButton mode="modal">
            <button className="bg-gold-gradient hover:opacity-95 text-indian-dark border border-indian-gold/30 px-5 py-2 rounded-full font-headline font-bold text-sm transition-all duration-300 shadow-md active:scale-95 cursor-pointer">
              Sign In
            </button>
          </SignInButton>
        )}
 
        {isSignedIn && isLoaded && (
          <UserButton afterSwitchSessionUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9 border border-indian-gold/20 shadow-sm" } }} />
        )}
      </div>
    </nav>
  );
}
