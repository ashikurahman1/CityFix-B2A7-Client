import { STATUS_META } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComplaintStatus } from "@/types/api";

export interface TimelineItem {
  id: string;
  status: ComplaintStatus;
  at: string;
  note?: string | null;
  by?: string | null;
}

/** Vertical status history. Server-renderable (no hooks). */
export function StatusTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-6 border-s-2 border-border ps-6">
      {items.map((item, i) => {
        const meta = STATUS_META[item.status];
        const last = i === items.length - 1;
        return (
          <li key={item.id} className="relative">
            <span
              className={cn(
                "absolute -start-[33px] top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-background",
                last ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/40",
              )}
              aria-hidden="true"
            />
            <p className="text-sm font-medium">{meta.label}</p>
            <p className="text-xs text-muted-foreground">
              <time dateTime={item.at}>{formatDateTime(item.at)}</time>
              {item.by ? ` · ${item.by}` : null}
            </p>
            {item.note ? <p className="mt-1.5 rounded-lg bg-muted/60 px-3 py-2 text-sm">{item.note}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
