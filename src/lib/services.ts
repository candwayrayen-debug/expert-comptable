/**
 * Liste de repli des services proposés dans le formulaire de contact.
 *
 * La référence est désormais la collection « Expertises » éditable depuis
 * /admin (voir `getServiceNames` dans `src/lib/content.ts`). Cette constante
 * sert uniquement de filet de sécurité lorsque la base est injoignable :
 * mieux vaut accepter une demande avec un intitulé connu que la rejeter.
 */
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

/** Option toujours proposée, même si elle n'est pas dans le contenu éditable. */
export const OTHER_SERVICE = "Autre demande";
