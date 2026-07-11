import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-container-high/60 dark:bg-indian-dark w-full border-t border-on-surface/5 rounded-t-[3rem] mt-20 flex flex-col md:flex-row justify-between items-center px-12 py-16">
      <div className="space-y-4 mb-8 md:mb-0 text-center md:text-left">
        <p className="font-serif font-bold text-indian-terracotta dark:text-indian-gold text-xl tracking-widest">Heritix</p>
        <p className="font-body text-sm leading-relaxed tracking-normal text-on-surface/70">© 2025 Heritix. Preserving the Living Ledger.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-8 items-center">
        <Link className="font-body text-sm leading-relaxed tracking-normal text-on-surface/70 hover:text-indian-terracotta dark:hover:text-indian-gold underline-offset-4 hover:underline transition-colors duration-300" href="#">Terms of Service</Link>
        <Link className="font-body text-sm leading-relaxed tracking-normal text-on-surface/70 hover:text-indian-terracotta dark:hover:text-indian-gold underline-offset-4 hover:underline transition-colors duration-300" href="#">Privacy Policy</Link>
        <Link className="font-body text-sm leading-relaxed tracking-normal text-on-surface/70 hover:text-indian-terracotta dark:hover:text-indian-gold underline-offset-4 hover:underline transition-colors duration-300" href="#">Accessibility</Link>
        <Link className="font-body text-sm leading-relaxed tracking-normal text-indian-terracotta dark:text-indian-gold underline-offset-4 hover:underline transition-colors duration-300 font-bold" href="#">Archive Ethics</Link>
      </div>
    </footer>
  );
}
