import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <defs>
        <linearGradient id="cf-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14a39a" />
          <stop offset="1" stopColor="#0b5f63" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#cf-logo-gradient)" />
      <path
        d="M9 21.5V13l7-4.5 7 4.5v8.5"
        stroke="#fff"
        strokeWidth="2.4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="m12.6 17.4 2.6 2.6 4.6-4.8" stroke="#ffc24b" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", className, inverted }: { href?: string; className?: string; inverted?: boolean }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 rounded-md font-heading text-lg font-semibold", className)}
      aria-label="CityFix home"
    >
      <LogoMark className={inverted ? "rounded-[9px] ring-1 ring-white/30" : undefined} />
      <span className={inverted ? "text-white" : undefined}>
        City<span className={inverted ? "text-warning" : "text-primary"}>Fix</span>
      </span>
    </Link>
  );
}
