import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { getServices, readSettings } from "@/lib/content";
import { telHref } from "@/lib/format";

/**
 * Le pied de page lit lui-même ses données plutôt que de les recevoir en
 * props : il est ainsi utilisable tel quel sur les pages légales et la page
 * 404, et ne peut pas diverger de la page d'accueil. Les lectures ont un repli
 * sur le contenu livré avec le site si la base est indisponible.
 */
export async function SiteFooter() {
  const [settings, services] = await Promise.all([readSettings(), getServices()]);

  const { contact_address: address, contact_phone: phone, contact_email: email, contact_hours: hours } = settings;
  const mapsQuery = encodeURIComponent(address);

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
            {settings.footer_blurb && <p>{settings.footer_blurb}</p>}
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
            {services.slice(0, 6).map((service) => <span key={service.id}>{service.title}</span>)}
          </div>
          <div className="footer-contact">
            <h3>Le cabinet</h3>
            <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer"><MapPin size={15} /> {address}</a>
            <a href={telHref(phone)}><Phone size={15} /> {phone}</a>
            <a href={`mailto:${email}`}><Mail size={15} /> {email} <ArrowUpRight size={11} /></a>
            <span className="footer-hours">{hours}</span>
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
