import type { LucideIcon } from "lucide-react";
import {
  Award, BadgeCheck, Banknote, BarChart3, BookOpenCheck, Briefcase, Building2, Calculator,
  Clock, Eye, Factory, FileSpreadsheet, Globe, GraduationCap, HandCoins, Handshake,
  HeartHandshake, Landmark, Lightbulb, LineChart, Lock, Mail, MapPin, Percent, Phone,
  PieChart, PiggyBank, Receipt, Rocket, Scale, ShieldCheck, Sparkles, Star, Store,
  Target, TrendingUp, Umbrella, Users, Wallet,
} from "lucide-react";

/**
 * Icônes proposées dans l'éditeur de contenu. La liste est volontairement
 * fermée : elle évite qu'un nom d'icône invalide saisi en base ne fasse
 * planter le rendu de la page d'accueil (import dynamique impossible avec
 * un bundler côté serveur).
 */
export const ICONS = {
  Award, BadgeCheck, Banknote, BarChart3, BookOpenCheck, Briefcase, Building2, Calculator,
  Clock, Eye, Factory, FileSpreadsheet, Globe, GraduationCap, HandCoins, Handshake,
  HeartHandshake, Landmark, Lightbulb, LineChart, Lock, Mail, MapPin, Percent, Phone,
  PieChart, PiggyBank, Receipt, Rocket, Scale, ShieldCheck, Sparkles, Star, Store,
  Target, TrendingUp, Umbrella, Users, Wallet,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in ICONS;
}

export function resolveIcon(value: unknown, fallback: IconName = "Sparkles"): LucideIcon {
  return isIconName(value) ? ICONS[value] : ICONS[fallback];
}
