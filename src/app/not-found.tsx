import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="notfound-page">
        <div className="container notfound-content">
          <span className="notfound-icon"><SearchX size={35} strokeWidth={1.5} /></span>
          <span className="eyebrow">ERREUR 404 · PAGE INTROUVABLE</span>
          <h1>Cette page n’existe pas.<br /><em>Le cabinet, si.</em></h1>
          <p>L’adresse que vous cherchez a peut-être changé. Retrouvez-nous sur la page d’accueil ou demandez directement un rendez-vous.</p>
          <div className="notfound-actions">
            <Link href="/" className="button button-dark">Retour à l’accueil <ArrowRight size={18} /></Link>
            <Link href="/#contact" className="notfound-link">Demander un devis</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
