export const SERVICES = [
  "Tenue de comptabilité",
  "Fiscalité & conformité",
  "Audit & commissariat aux comptes",
  "Création d'entreprise",
  "Paie & social",
  "Conseil & externalisation",
  "Autre demande",
] as const;

export type Service = (typeof SERVICES)[number];
