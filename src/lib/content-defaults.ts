import type { CollectionKey } from "@/lib/content-schema";

/**
 * Contenu livré avec le site. Il sert de valeur initiale au script de seed
 * (`npm run db:seed`) et de repli si la base ne contient encore aucun
 * contenu, afin que la page d'accueil ne puisse jamais s'afficher vide.
 */
export const DEFAULT_CONTENT: Record<CollectionKey, Record<string, unknown>[]> = {
  services: [
    {
      icon: "BookOpenCheck",
      title: "Tenue de comptabilité",
      text: "Votre comptabilité tenue avec rigueur, dans le respect du Plan Comptable Tunisien, avec un interlocuteur unique et des états de situation mensuels.",
      points: ["Saisie et rapprochements", "États financiers et annexes", "Établissements de gestion"],
    },
    {
      icon: "Scale",
      title: "Fiscalité & conformité",
      text: "Déclarations, optimisation et assistance en contrôle fiscal : nous sécurisons votre position fiscale tout en préservant votre marge.",
      points: ["TVA, IS, patente et IRPP", "El Fatooura et conformité", "Assistance contrôle fiscal"],
    },
    {
      icon: "ShieldCheck",
      title: "Audit & commissariat aux comptes",
      text: "Révision légale des comptes, due diligence et audit contractuel pour asseoir vos décisions et rassurer vos partenaires.",
      points: ["Commissariat aux comptes", "Due diligence financière", "Audit contractuel"],
    },
    {
      icon: "Building2",
      title: "Création d’entreprise",
      text: "De l’étude de faisabilité à l’immatriculation au registre de commerce : nous construisons des structures qui durent.",
      points: ["SARL, SA et SCI", "Business plan et financement", "Régimes incitatifs et offshore"],
    },
    {
      icon: "Users",
      title: "Paie & social",
      text: "Une gestion sociale sans erreur : bulletins, cotisations et déclarations trimestrielles traités par nos équipes dédiées.",
      points: ["Bulletins de paie", "CNSS et CNAM", "Déclarations sociales"],
    },
    {
      icon: "TrendingUp",
      title: "Conseil & externalisation",
      text: "Tableaux de bord, restructuration, évaluation d’entreprise : un regard extérieur pour piloter sereinement votre croissance.",
      points: ["Externalisation comptable", "Restructuration et M&A", "Tableaux de bord de pilotage"],
    },
  ],
  values: [
    { icon: "Eye", title: "Indépendance", text: "Des conseils qui vous appartiennent, jamais conditionnés." },
    { icon: "Landmark", title: "Rigueur", text: "Chaque chiffre est vérifié avant d’être remis entre vos mains." },
    { icon: "Users", title: "Proximité", text: "Un interlocuteur unique, joignable, qui connaît votre métier." },
    { icon: "ShieldCheck", title: "Confidentialité", text: "Vos documents et vos décisions restent strictement protégés." },
  ],
  team: [
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
  ],
  // La galerie n'a pas de contenu livré : la section reste masquée tant
  // qu'aucune photo n'a été téléversée depuis l'administration.
  gallery: [],
  stats: [
    { value: "20+", label: "années d’expérience" },
    { value: "240", label: "entreprises accompagnées" },
    { value: "1 400+", label: "déclarations par an" },
    { value: "98 %", label: "de clients qui nous restent" },
  ],
  steps: [
    { num: "01", title: "Premier échange", text: "Un entretien de 30 minutes, offert, pour comprendre votre activité et vos enjeux." },
    { num: "02", title: "Analyse de votre situation", text: "Nous examinons vos comptes, vos obligations et vos marges de manœuvre." },
    { num: "03", title: "Devis clair et ferme", text: "Une proposition écrite et détaillée. Vous ne payez que ce qui y est écrit." },
    { num: "04", title: "Prise en charge & suivi", text: "Nous reprenons vos dossiers et vous accompagnons, avec un bilan trimestriel." },
  ],
  plans: [
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
      price: "",
      desc: "Pour les groupes, audits et opérations sensibles.",
      features: ["Commissariat aux comptes", "Due diligence et M&A", "Restructuration fiscale", "Accompagnement offshore"],
      featured: false,
    },
  ],
  testimonials: [
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
  ],
  faqs: [
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
  ],
};
