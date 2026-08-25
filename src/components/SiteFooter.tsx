import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-3xl tracking-tight">Atlas</p>
          <p className="mt-2 max-w-sm text-sm text-paper/70">
            Clothing, electronics, and home essentials — curated for everyday living.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm uppercase tracking-[0.12em] text-paper/75">
          <Link href="/" className="hover:text-paper">
            Home
          </Link>
          <Link href="/category/1" className="hover:text-paper">
            Clothing
          </Link>
          <Link href="/category/2" className="hover:text-paper">
            Electronics
          </Link>
          <Link href="/category/3" className="hover:text-paper">
            Home & Living
          </Link>
        </div>
      </div>
      <div className="border-t border-paper/15 px-4 py-4 text-center text-xs text-paper/50 sm:px-6">
        © {new Date().getFullYear()} Atlas. Built for demonstration.
      </div>
    </footer>
  );
}
