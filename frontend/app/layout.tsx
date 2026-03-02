import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FolkLore AI - Preserving Voices',
  description: 'A dedicated platform for preserving cultural heritage through voice.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-primary text-white py-6 text-center mt-12 border-t border-highlight/20">
          <p className="font-serif italic opacity-80">&copy; {new Date().getFullYear()} FolkLore AI. Preserving the past for the future.</p>
        </footer>
      </body>
    </html>
  );
}
