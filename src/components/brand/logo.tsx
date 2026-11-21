import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9 21.5V13l7-4.5 7 4.5v8.5"
        className="stroke-primary-foreground"
        strokeWidth="2.2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="m12.8 17.6 2.4 2.4 4.4-4.6"
        className="stroke-warning"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 rounded-md font-heading text-lg font-semibold", className)}
      aria-label="CityFix home"
    >
      <LogoMark />
      <span>
        City<span className="text-primary">Fix</span>
      </span>
    </Link>
  );
}
