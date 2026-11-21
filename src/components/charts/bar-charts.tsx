"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export interface Datum {
  label: string;
  value: number;
}

/**
 * Horizontal bars for categorical magnitude (one series, one hue). Values are printed at the
 * bar end, so the chart never relies on colour contrast alone.
 */
export function HBarChart({
  data,
  seriesLabel,
  color = "var(--chart-1)",
  className,
}: {
  data: Datum[];
  seriesLabel: string;
  color?: string;
  className?: string;
}) {
  const config = { value: { label: seriesLabel, color } } satisfies ChartConfig;
  const height = Math.max(120, data.length * 36 + 16);

  return (
    <ChartContainer config={config} className={cn("w-full", className)} style={{ height }}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 40, top: 4, bottom: 4 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} strokeDasharray="0" className="stroke-border" />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={128}
          tick={{ fontSize: 12 }}
          tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)}
        />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltipContent hideIndicator={false} />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} maxBarSize={22}>
          <LabelList dataKey="value" position="right" className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/** Vertical columns for change over discrete periods (weeks). */
export function ColumnChart({
  data,
  seriesLabel,
  color = "var(--chart-1)",
  className,
}: {
  data: Datum[];
  seriesLabel: string;
  color?: string;
  className?: string;
}) {
  const config = { value: { label: seriesLabel, color } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className={cn("h-56 w-full", className)}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 20, bottom: 0 }}>
        <CartesianGrid vertical={false} className="stroke-border" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} fontSize={12} />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} maxBarSize={36}>
          <LabelList dataKey="value" position="top" className="fill-foreground" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
