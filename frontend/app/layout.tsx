import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Heritix - Cultural Preservation',
  description: 'AI-powered cultural knowledge preservation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-stone-900 text-stone-400 p-4 text-center mt-8">
            <p>&copy; {new Date().getFullYear()} Heritix. Preserving the past for the future.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
