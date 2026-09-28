"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/#services", label: "Nos expertises" },
  { href: "/#cabinet", label: "Le cabinet" },
  { href: "/#formules", label: "Formules" },
  { href: "/#temoignages", label: "Témoignages" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Cabinet Ben Salem, retour à l’accueil" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-bar brand-bar-one" />
            <span className="brand-bar brand-bar-two" />
            <span className="brand-bar brand-bar-three" />
          </span>
          <span className="brand-text">
            <span className="brand-word">Cabinet Ben Salem</span>
            <span className="brand-sub">EXPERT-COMPTABLE · TUNIS</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigation principale">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>

        <Link href="/#contact" className="header-cta">
          Devis gratuit <ArrowUpRight size={17} strokeWidth={2.1} aria-hidden="true" />
        </Link>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuOpen && (
        <nav className="mobile-nav" aria-label="Navigation mobile">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
          <Link href="/#contact" className="mobile-nav-cta" onClick={() => setMenuOpen(false)}>Devis gratuit <ArrowUpRight size={18} /></Link>
        </nav>
      )}
    </header>
  );
}
