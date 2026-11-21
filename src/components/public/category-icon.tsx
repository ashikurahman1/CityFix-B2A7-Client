import {
  Construction,
  Droplets,
  FileBadge,
  Lightbulb,
  type LucideIcon,
  PlugZap,
  Trash2,
  Truck,
  Waves,
  Wrench,
} from "lucide-react";

const RULES: [RegExp, LucideIcon][] = [
  [/pothole|road/i, Construction],
  [/light/i, Lightbulb],
  [/bulk|pickup/i, Truck],
  [/garbage|waste/i, Trash2],
  [/drain|sewer/i, Waves],
  [/connection/i, PlugZap],
  [/water|leak/i, Droplets],
  [/licen[cs]e|permit|certificate/i, FileBadge],
];

/** Picks a recognisable icon from the category name; admins can add categories freely. */
export function categoryIcon(name: string): LucideIcon {
  return RULES.find(([re]) => re.test(name))?.[1] ?? Wrench;
}
