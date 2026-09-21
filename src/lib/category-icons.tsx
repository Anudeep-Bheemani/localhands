import {
  Zap, Droplet, Hammer, Brush, Wind, Sparkles, ChefHat, Truck, Car, Dog, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  droplet: Droplet,
  hammer: Hammer,
  brush: Brush,
  wind: Wind,
  sparkles: Sparkles,
  "chef-hat": ChefHat,
  truck: Truck,
  car: Car,
  dog: Dog,
};

export function getCategoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? Wrench;
}
