import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BookOpenCheck, Building2, Check, Clock,
  Eye, Landmark, Mail, MapPin, Phone, Quote, Scale, ShieldCheck,
  Sparkles, TrendingUp, Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";

const services = [
  {
    icon: BookOpenCheck,
    title: "Tenue de comptabilité",
    text: "Votre comptabilité tenue avec rigueur, dans le respect du Plan Comptable Tunisien, avec un interlocuteur unique et des états de situation mensuels.",
    points: ["Saisie et rapprochements", "États financiers et annexes", "Établissements de gestion"],
  },
  {
    icon: Scale,
    title: "Fiscalité & conformité",
    text: "Déclarations, optimisation et assistance en contrôle fiscal : nous sécurisons votre position fiscale tout en préservant votre marge.",
    points: ["TVA, IS, patente et IRPP", "El Fatooura et conformité", "Assistance contrôle fiscal"],
  },
  {
    icon: ShieldCheck,
    title: "Audit & commissariat aux comptes",
    text: "Révision légale des comptes, due diligence et audit contractuel pour asseoir vos décisions et rassurer vos partenaires.",
    points: ["Commissariat aux comptes", "Due diligence financière", "Audit contractuel"],
  },
  {
    icon: Building2,
    title: "Création d’entreprise",
    text: "De l’étude de faisabilité à l’immatriculation au registre de commerce : nous construisons des structures qui durent.",
    points: ["SARL, SA et SCI", "Business plan et financement", "Régimes incitatifs et offshore"],
  },
  {
    icon: Users,
    title: "Paie & social",
    text: "Une gestion sociale sans erreur : bulletins, cotisations et déclarations trimestrielles traités par nos équipes dédiées.",
    points: ["Bulletins de paie", "CNSS et CNAM", "Déclarations sociales"],
  },
  {
    icon: TrendingUp,
    title: "Conseil & externalisation",
    text: "Tableaux de bord, restructuration, évaluation d’entreprise : un regard extérieur pour piloter sereinement votre croissance.",
    points: ["Externalisation comptable", "Restructuration et M&A", "Tableaux de bord de pilotage"],
  },
];

const team = [
  {
    initials: "MB",
    color: "#dde9d9",
    name: "Mounir Ben Salem",
    role: "Expert-Comptable · Associé fondateur",
    bio: "Plus de 20 ans d’expérience en expertise comptable et commissariat aux comptes. Membre de l’OECT depuis 2005.",
  },
  {
    initials: "ST",
    color: "#f0e6d6",
    name: "Salma Trabelsi",
    role: "Commissaire aux Comptes · Associée",
    bio: "Spécialiste des audits de groupes et de la consolidation. Intervient également en restructuration financière.",
  },
  {
    initials: "YG",
    color: "#e5e8f0",
    name: "Yassine Gharbi",
    role: "Conseiller fiscal principal",
    bio: "Fiscalité nationale et internationale, avec une expertise des régimes incitatifs et des projets offshore.",
  },
];

const values = [
  { icon: Eye, title: "Indépendance", text: "Des conseils qui vous appartiennent, jamais conditionnés." },
  { icon: Landmark, title: "Rigueur", text: "Chaque chiffre est vérifié avant d’être remis entre vos mains." },
  { icon: Users, title: "Proximité", text: "Un interlocuteur unique, joignable, qui connaît votre métier." },
  { icon: ShieldCheck, title: "Confidentialité", text: "Vos documents et vos décisions restent strictement protégés." },
];

const steps = [
  { num: "01", title: "Premier échange", text: "Un entretien de 30 minutes, offert, pour comprendre votre activité et vos enjeux." },
  { num: "02", title: "Analyse de votre situation", text: "Nous examinons vos comptes, vos obligations et vos marges de manœuvre." },
  { num: "03", title: "Devis clair et ferme", text: "Une proposition écrite et détaillée. Vous ne payez que ce qui y est écrit." },
  { num: "04", title: "Prise en charge & suivi", text: "Nous reprenons vos dossiers et vous accompagnons, avec un bilan trimestriel." },
];

const plans = [
  {
    name: "Essentiel",
    price: "450",
    desc: "Pour les micro-entreprises et professions libérales.",
    features: ["Tenue comptable simplifiée", "Déclarations fiscales", "Assistance téléphonique", "1 rendez-vous par trimestre"],
    featured: false,
  },
  {
    name: "Croissance",
    price: "950",
    desc: "Pour les PME qui externalisent leur comptabilité.",
    features: ["Tenue comptable complète", "Paie et déclarations sociales", "Conseil fiscal mensuel", "Tableau de bord trimestriel", "Interlocuteur dédié"],
    featured: true,
  },
  {
    name: "Sur mesure",
    price: null,
    desc: "Pour les groupes, audits et opérations sensibles.",
    features: ["Commissariat aux comptes", "Due diligence et M&A", "Restructuration fiscale", "Accompagnement offshore"],
    featured: false,
  },
];

const testimonials = [
  {
    quote: "Depuis que le cabinet gère notre comptabilité, je dors mieux. Les échéances fiscales sont traitées avant le jour J et j’ai enfin des chiffres que je comprends.",
    name: "Leïla Mansour",
    company: "Dirigeante, société de textile — La Goulette",
  },
  {
    quote: "Ils nous ont accompagnés de la création de notre SARL jusqu’à la levée de fonds. Leur travail sur le business plan a fait la différence auprès de nos investisseurs.",
    name: "Karim Haddad",
    company: "Fondateur, startup SaaS — Tunis",
  },
  {
    quote: "Un contrôle fiscal difficile, une équipe qui a été là du début à la fin. Résultat : un redressement minimal et beaucoup de sérénité retrouvée.",
    name: "Hafedh Bouazizi",
    company: "Directeur général, groupe industriel — Sfax",
  },
];

const faqs = [
  {
    q: "Comment se déroule le premier rendez-vous ?",
    a: "Il est offert et sans engagement, au cabinet ou par visioconférence. Nous prenons 30 minutes pour comprendre votre activité, vos obligations et ce qui ne fonctionne pas aujourd’hui. Vous repartez avec des recommandations concrètes.",
  },
  {
    q: "Comment sont calculés vos honoraires ?",
    a: "Ils dépendent du volume de pièces, du type de structure et des services retenus. Après l’analyse de votre situation, vous recevez un devis écrit, détaillé et ferme. Aucun frais caché, aucune surprise.",
  },
  {
    q: "Puis-je changer d’expert-comptable à tout moment ?",
    a: "Oui. Vous pouvez changer de cabinet à tout moment. Nous assurons la reprise de votre dossier en douceur : récupération des éléments auprès de votre ancien cabinet, rapprochement des comptes et reprise sans rupture dans vos obligations.",
  },
  {
    q: "Assistez-vous aux contrôles fiscaux ?",
    a: "Oui. Nous vous représentons ou vous assistons pendant tout le contrôle : préparation du dossier, réponses aux mises en demeure et négociation. C’est l’une des missions pour lesquelles nos clients nous font le plus confiance.",
  },
  {
    q: "Proposez-vous un accompagnement pour investir en Tunisie ?",
    a: "Oui. Création de structure, étude des régimes incitatifs (offshore, zones franches, incitations régionales), domiciliation : nous accompagnons investisseurs nationaux et internationaux à chaque étape.",
  },
  {
    q: "Que couvre l’obligation El Fatooura ?",
    a: "L’électrofacturation est obligatoire pour toute entreprise soumise à la TVA et à l’IS. Nous prenons en charge l’activation de votre espace, la facturation conforme et l’archivage, et nous formons vos équipes si nécessaire.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> CABINET D’EXPERTISE COMPTABLE · TUNIS · DEPUIS 2005</div>
              <h1>Des chiffres clairs, des décisions <em>sereines.</em></h1>
              <p className="hero-description">Le cabinet Ben Salem accompagne les entreprises tunisiennes et les investisseurs en comptabilité, fiscalité, audit et conseil — avec la rigueur d’un grand cabinet et la proximité d’une équipe à taille humaine.</p>
              <div className="hero-actions">
                <Link href="/#contact" className="button button-dark">Demander un devis gratuit <ArrowRight size={18} /></Link>
                <a href="tel:+21671902345" className="hero-phone"><Phone size={18} /> +216 71 902 345</a>
              </div>
              <div className="hero-trust">
                <span><i /> Expert-comptable inscrit à l’OECT</span>
                <span><i /> Premier rendez-vous offert</span>
                <span><i /> Devis écrit et ferme</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap">
                <Image src="/images/hero-accounting.jpg" alt="Mounir Ben Salem à l’échange avec une dirigeante autour de documents financiers" fill priority sizes="(max-width: 900px) 100vw, 47vw" className="hero-image" />
              </div>
              <div className="hero-floating-card"><span className="hero-floating-icon"><Sparkles size={20} strokeWidth={1.9} /></span><span><strong>Premier rendez-vous offert</strong><small>30 minutes pour parler de votre projet</small></span><span className="hero-floating-check"><Check size={15} strokeWidth={2.6} /></span></div>
              <div className="hero-photo-caption">UN ÉCHANGE QUI FAIT AVANCER <span aria-hidden="true">↗</span></div>
            </div>
          </div>
          <div className="container stats-band">
            <div className="stat-item"><strong>20+</strong><span>années d’expérience</span></div>
            <div className="stat-item"><strong>240</strong><span>entreprises accompagnées</span></div>
            <div className="stat-item"><strong>1 400+</strong><span>déclarations par an</span></div>
            <div className="stat-item"><strong>98 %</strong><span>de clients qui nous restent</span></div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> NOS EXPERTISES</span><h2>Six expertises,<br /><em>un seul interlocuteur.</em></h2></div>
              <p>De la tenue quotidienne aux opérations sensibles, nous couvrons l’ensemble des besoins de votre entreprise — et vous déchargeons de ce qui ne l’est pas.</p>
            </div>
            <div className="services-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <span className="service-icon"><service.icon size={26} strokeWidth={1.55} /></span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <ul>{service.points.map((point) => <li key={point}><Check size={14} strokeWidth={2.4} />{point}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section" id="cabinet">
          <div className="container about-grid">
            <div className="about-copy">
              <span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> LE CABINET</span>
              <h2>Une équipe à taille humaine, <em>au service de votre croissance.</em></h2>
              <p>Fondé en 2005 par Mounir Ben Salem, le cabinet Ben Salem est né d’une conviction simple : une entreprise est mieux servie par des conseils clairs que par de la bureaucratie. Trois experts, une quarantaine de collaborateurs et une seule exigence — que nos clients prennent de meilleures décisions.</p>
              <div className="values-grid">
                {values.map((value) => (
                  <div className="value-item" key={value.title}>
                    <span className="value-icon"><value.icon size={19} strokeWidth={1.7} /></span>
                    <div><strong>{value.title}</strong><p>{value.text}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-team">
              {team.map((member) => (
                <article className="team-card" key={member.name}>
                  <span className="team-monogram" style={{ backgroundColor: member.color }}>{member.initials}</span>
                  <div className="team-info">
                    <h3>{member.name}</h3>
                    <span className="team-role">{member.role}</span>
                    <p>{member.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section">
          <div className="container">
            <div className="process-heading">
              <span className="eyebrow process-eyebrow"><span className="eyebrow-line" /> VOTRE PARCOURS</span>
              <h2>Quatre étapes, <em>zéro friction.</em></h2>
            </div>
            <div className="process-grid">
              {steps.map((step) => (
                <article className="process-card" key={step.num}>
                  <span className="process-num">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="plans-section" id="formules">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> NOS FORMULES</span><h2>Un accompagnement, <em>à la mesure de votre activité.</em></h2></div>
              <p>Trois formules pensées pour les réalités du terrain tunisien. Chacune fait l’objet d’un devis écrit après analyse de votre situation.</p>
            </div>
            <div className="plans-grid">
              {plans.map((plan) => (
                <article className={plan.featured ? "plan-card plan-featured" : "plan-card"} key={plan.name}>
                  {plan.featured && <span className="plan-badge">La plus choisie</span>}
                  <h3>{plan.name}</h3>
                  <p className="plan-desc">{plan.desc}</p>
                  <div className="plan-price">{plan.price ? <><strong>{plan.price} DT</strong><span>/ mois, à partir de</span></> : <><strong>Sur devis</strong><span>étude personnalisée</span></>}</div>
                  <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} strokeWidth={2.4} />{feature}</li>)}</ul>
                  <Link href="/#contact" className={plan.featured ? "button button-lime plan-button" : "plan-link"}>
                    {plan.featured ? <>Demander cette formule <ArrowUpRight size={17} /></> : <>Demander un devis <ArrowRight size={16} /></>}
                  </Link>
                </article>
              ))}
            </div>
            <p className="plans-note">Montants indicatifs, hors taxes, pour une SARL standard. Le devis final dépend du volume de pièces et des options retenues.</p>
          </div>
        </section>

        <section className="testimonials-section" id="temoignages">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> TÉMOIGNAGES</span><h2>La preuve par <em>nos clients.</em></h2></div>
              <p>Dirigeants de PME, fondateurs, industriels : ce qu’ils disent de travailler avec nous, en leurs propres mots.</p>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((item) => (
                <figure className="testimonial-card" key={item.name}>
                  <Quote size={26} strokeWidth={1.6} className="testimonial-mark" />
                  <blockquote>{item.quote}</blockquote>
                  <figcaption><strong>{item.name}</strong><span>{item.company}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container faq-layout">
            <div className="faq-intro">
              <span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> BON À SAVOIR</span>
              <h2>Vos questions, <em>nos réponses.</em></h2>
              <p>Quelques réponses pour démarrer sereinement. Pour le reste, appelez-nous : nous répondons vite.</p>
              <a href="tel:+21671902345" className="faq-oect-link"><Phone size={16} /> +216 71 902 345</a>
            </div>
            <div className="faq-list">
              {faqs.map((item) => (
                <details key={item.q}><summary>{item.q} <span>+</span></summary><p>{item.a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container contact-grid">
            <div className="contact-info">
              <span className="eyebrow section-eyebrow"><span className="eyebrow-line" /> PRENDRE RENDEZ-VOUS</span>
              <h2>Parlons de <em>votre projet.</em></h2>
              <p>Décrivez votre besoin, nous revenons vers vous sous 24 heures ouvrées avec une première analyse et, si vous le souhaitez, un rendez-vous au cabinet.</p>
              <div className="contact-rows">
                <a className="contact-row" href="https://www.google.com/maps/search/?api=1&query=avenue%20Habib%20Bourguiba%20Tunis%201003" target="_blank" rel="noopener noreferrer"><span className="contact-row-icon"><MapPin size={18} /></span><div><strong>Le cabinet</strong><small>Résidence El Kheireddine, av. Habib Bourguiba, Tunis 1003</small></div><ArrowUpRight size={16} /></a>
                <a className="contact-row" href="tel:+21671902345"><span className="contact-row-icon"><Phone size={18} /></span><div><strong>Téléphone</strong><small>+216 71 902 345</small></div><ArrowUpRight size={16} /></a>
                <a className="contact-row" href="mailto:contact@benselem-ec.tn"><span className="contact-row-icon"><Mail size={18} /></span><div><strong>E-mail</strong><small>contact@benselem-ec.tn</small></div><ArrowUpRight size={16} /></a>
                <div className="contact-row contact-row-static"><span className="contact-row-icon"><Clock size={18} /></span><div><strong>Horaires</strong><small>Lundi – Vendredi · 9 h à 17 h 30</small></div></div>
              </div>
              <div className="contact-reassure"><ShieldCheck size={18} /><p>Réponse garantie sous 24 h ouvrées. Vos informations restent confidentielles et ne sont jamais partagées.</p></div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
