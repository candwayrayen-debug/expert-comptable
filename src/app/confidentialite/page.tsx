import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Comment le cabinet Ben Salem traite les informations transmises via son formulaire de contact.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <div className="container legal-container">
          <Link href="/" className="legal-back"><ArrowLeft size={17} /> Retour à l’accueil</Link>
          <span className="eyebrow"><span className="eyebrow-dot" /> À PROPOS DE VOS INFORMATIONS</span>
          <h1>Votre confiance<br /><em>compte pour nous.</em></h1>
          <p className="legal-lead">Voici, simplement, ce qui se passe lorsque vous utilisez le formulaire de contact du cabinet Ben Salem.</p>
          <div className="legal-content">
            <section>
              <h2>Les informations que nous collectons</h2>
              <p>Lors de l’envoi du formulaire, nous collectons uniquement les éléments que vous saisissez : nom, société, adresse e-mail, numéro de téléphone, service concerné et contenu de votre message. Nous ne collectons aucune autre donnée et ne sollicitons pas de données sensibles (comptes bancaires, identifiants, données de santé).</p>
            </section>
            <section>
              <h2>Utilisation de ces informations</h2>
              <p>Vos informations sont utilisées exclusivement pour vous recontacter, préparer une première analyse et convenir d’un éventuel rendez-vous. Elles ne sont ni cédées, ni vendues, ni transmises à des tiers, et ne servent à aucune prospection commerciale. Les messages sont conservés au maximum 12 mois, sauf si une mission débute, auquel cas ils sont traités dans le cadre du secret professionnel comptable.</p>
            </section>
            <section>
              <h2>Vos droits</h2>
              <p>Conformément à la loi n° 2004-63 relative à la protection des données à caractère personnel, vous disposez d’un droit d’accès, de rectification et d’opposition sur les données vous concernant. Une demande écrite à contact@benselem-ec.tn suffit ; nous y répondons sous 30 jours.</p>
            </section>
          </div>
          <div className="legal-note"><ShieldCheck size={20} /><p>Conseil : ne renseignez pas d’informations financières sensibles dans votre premier message. Nous convenons ensemble du canal adapté lors de notre premier échange.</p></div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
