import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#efeee9] dark:bg-[#121311] w-full rounded-t-[3rem] mt-20 flex flex-col md:flex-row justify-between items-center px-12 py-16">
      <div className="space-y-4 mb-8 md:mb-0 text-center md:text-left">
        <p className="font-headline font-bold text-on-surface text-xl">Heritix</p>
        <p className="font-body text-sm leading-relaxed tracking-normal text-on-surface/70">© 2024 Heritix. Preserving the Living Ledger.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-8 items-center">
        <Link className="font-body text-sm leading-relaxed tracking-normal text-on-surface/70 hover:text-primary underline-offset-4 hover:underline transition-opacity duration-300" href="#">Terms of Service</Link>
        <Link className="font-body text-sm leading-relaxed tracking-normal text-on-surface/70 hover:text-primary underline-offset-4 hover:underline transition-opacity duration-300" href="#">Privacy Policy</Link>
        <Link className="font-body text-sm leading-relaxed tracking-normal text-on-surface/70 hover:text-primary underline-offset-4 hover:underline transition-opacity duration-300" href="#">Accessibility</Link>
        <Link className="font-body text-sm leading-relaxed tracking-normal text-primary underline-offset-4 hover:underline transition-opacity duration-300 font-bold" href="#">Archive Ethics</Link>
      </div>
    </footer>
  );
}
