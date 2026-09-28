import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const expertises = [
  "Tenue de comptabilité",
  "Fiscalité & conformité",
  "Audit & commissariat aux comptes",
  "Création d'entreprise",
  "Paie & social",
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand-column">
            <Link href="/" className="brand footer-brand" aria-label="Cabinet Ben Salem, retour à l’accueil">
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
            <p>Cabinet d’expertise comptable à Tunis. Nous accompagnons les entreprises tunisiennes et les investisseurs avec rigueur et proximité depuis 2005.</p>
          </div>
          <div className="footer-links-column">
            <h3>Navigation</h3>
            <Link href="/#services">Nos expertises</Link>
            <Link href="/#cabinet">Le cabinet</Link>
            <Link href="/#formules">Formules</Link>
            <Link href="/#temoignages">Témoignages</Link>
            <Link href="/#contact">Contact</Link>
          </div>
          <div className="footer-links-column">
            <h3>Expertises</h3>
            {expertises.map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="footer-contact">
            <h3>Le cabinet</h3>
            <a href="https://www.google.com/maps/search/?api=1&query=avenue%20Habib%20Bourguiba%20Tunis%201003" target="_blank" rel="noopener noreferrer"><MapPin size={15} /> Résidence El Kheireddine, av. Habib Bourguiba, Tunis 1003</a>
            <a href="tel:+21671902345"><Phone size={15} /> +216 71 902 345</a>
            <a href="mailto:contact@benselem-ec.tn"><Mail size={15} /> contact@benselem-ec.tn <ArrowUpRight size={11} /></a>
            <span className="footer-hours">Lundi – Vendredi · 9 h – 17 h 30</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Cabinet Ben Salem — Expert-comptable inscrit à l’OECT.</span>
          <Link href="/confidentialite">Confidentialité <span aria-hidden="true">✳</span></Link>
        </div>
      </div>
    </footer>
  );
}
