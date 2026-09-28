import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cabinet Ben Salem — Expert-Comptable à Tunis",
    template: "%s",
  },
  description: "Cabinet d’expertise comptable à Tunis : tenue de comptabilité, fiscalité, audit, création d’entreprise, paie et conseil. Premier rendez-vous offert, devis gratuit.",
  openGraph: {
    title: "Cabinet Ben Salem — Expert-Comptable à Tunis",
    description: "Comptabilité, fiscalité, audit et conseil pour les entreprises tunisiennes et les investisseurs, depuis 2005.",
    locale: "fr_TN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
