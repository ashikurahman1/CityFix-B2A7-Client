import { cn } from "@/lib/utils";

const rules = [
  { test: (v: string) => v.length >= 8, label: "8+ characters" },
  { test: (v: string) => /[A-Za-z]/.test(v), label: "A letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "A number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v) || v.length >= 12, label: "Symbol or 12+ chars" },
];

/** Live checklist of the API's password rules (the last one is a recommendation). */
export function PasswordStrength({ value }: { value: string }) {
  const passed = rules.filter((r) => r.test(value)).length;
  return (
    <div aria-live="polite" className="space-y-2">
      <div className="flex gap-1" aria-hidden="true">
        {rules.map((r, i) => (
          <span
            key={r.label}
            className={cn(
              "h-1 flex-1 rounded-full bg-muted transition-colors",
              i < passed && (passed <= 2 ? "bg-destructive" : passed === 3 ? "bg-warning" : "bg-success"),
            )}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {rules.map((r) => (
          <li key={r.label} className={r.test(value) ? "text-success" : "text-muted-foreground"}>
            {r.test(value) ? "✓" : "•"} {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
