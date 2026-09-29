import { ICON_NAMES } from "@/lib/icons";
import { isUploadPath } from "@/lib/upload-rules";

/**
 * Description déclarative du contenu éditorial. Ce fichier est la source de
 * vérité unique : il alimente à la fois le rendu du site public, la
 * validation à l'écriture et les formulaires générés dans /admin.
 * Ajouter un champ se fait donc ici, sans toucher aux écrans d'édition.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "list"
  | "boolean"
  | "color"
  | "icon"
  | "select"
  | "image";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  hint?: string;
  required?: boolean;
  maxLength?: number;
  options?: readonly string[];
  /** Valeur par défaut utilisée par le script de seed. */
  fallback?: string | boolean;
};

export type CollectionKey =
  | "services"
  | "values"
  | "team"
  | "steps"
  | "plans"
  | "testimonials"
  | "faqs"
  | "stats"
  | "gallery";

export type CollectionDef = {
  key: CollectionKey;
  /** Libellé pluriel affiché dans la navigation. */
  label: string;
  /** Libellé singulier utilisé pour les boutons d'action. */
  singular: string;
  description: string;
  /** Champ servant de titre dans la liste et le fil d'Ariane. */
  titleField: string;
  fields: readonly FieldDef[];
};

export const COLLECTIONS: Record<CollectionKey, CollectionDef> = {
  services: {
    key: "services",
    label: "Expertises",
    singular: "une expertise",
    description:
      "Les six cartes de la section « Nos expertises ». L'ordre détermine l'ordre d'affichage.",
    titleField: "title",
    fields: [
      { name: "icon", label: "Icône", type: "icon", fallback: "BookOpenCheck" },
      { name: "title", label: "Titre", type: "text", required: true, maxLength: 80, fallback: "Nouvelle expertise" },
      { name: "text", label: "Description", type: "textarea", required: true, maxLength: 400 },
      {
        name: "points",
        label: "Points clés",
        type: "list",
        hint: "Une ligne par point. Trois points rendent le mieux.",
      },
    ],
  },
  values: {
    key: "values",
    label: "Valeurs",
    singular: "une valeur",
    description: "Les quatre vignettes « Indépendance, Rigueur, Proximité, Confidentialité ».",
    titleField: "title",
    fields: [
      { name: "icon", label: "Icône", type: "icon", fallback: "Sparkles" },
      { name: "title", label: "Titre", type: "text", required: true, maxLength: 40 },
      { name: "text", label: "Description", type: "textarea", required: true, maxLength: 200 },
    ],
  },
  team: {
    key: "team",
    label: "Équipe",
    singular: "un membre",
    description: "Les fiches des associés et collaborateurs présentés sur la page d'accueil.",
    titleField: "name",
    fields: [
      { name: "initials", label: "Monogramme", type: "text", required: true, maxLength: 3, hint: "Deux ou trois lettres, ex. MB." },
      { name: "color", label: "Couleur du monogramme", type: "color", fallback: "#dde9d9" },
      { name: "name", label: "Nom complet", type: "text", required: true, maxLength: 120 },
      { name: "role", label: "Fonction", type: "text", required: true, maxLength: 120 },
      { name: "bio", label: "Biographie", type: "textarea", required: true, maxLength: 400 },
    ],
  },
  steps: {
    key: "steps",
    label: "Parcours",
    singular: "une étape",
    description: "Les étapes du parcours client, affichées dans le bandeau vert foncé.",
    titleField: "title",
    fields: [
      { name: "num", label: "Numéro", type: "text", required: true, maxLength: 3, hint: "Format « 01 », « 02 »…" },
      { name: "title", label: "Titre", type: "text", required: true, maxLength: 80 },
      { name: "text", label: "Description", type: "textarea", required: true, maxLength: 300 },
    ],
  },
  plans: {
    key: "plans",
    label: "Formules",
    singular: "une formule",
    description: "Les offres tarifaires. Une seule formule peut être mise en avant.",
    titleField: "name",
    fields: [
      { name: "name", label: "Nom", type: "text", required: true, maxLength: 40 },
      { name: "price", label: "Prix mensuel (DT)", type: "text", maxLength: 12, hint: "Chiffres uniquement. Laisser vide affiche « Sur devis »." },
      { name: "desc", label: "Accroche", type: "textarea", required: true, maxLength: 200 },
      { name: "features", label: "Prestations incluses", type: "list", hint: "Une ligne par prestation." },
      { name: "featured", label: "Mettre en avant", type: "boolean", hint: "Applique le fond vert foncé et le badge « La plus choisie »." },
    ],
  },
  testimonials: {
    key: "testimonials",
    label: "Témoignages",
    singular: "un témoignage",
    description: "Les citations clients. Vérifiez que vous disposez de l'accord des personnes citées.",
    titleField: "name",
    fields: [
      { name: "quote", label: "Citation", type: "textarea", required: true, maxLength: 500 },
      { name: "name", label: "Nom", type: "text", required: true, maxLength: 80 },
      { name: "company", label: "Société et ville", type: "text", required: true, maxLength: 120 },
    ],
  },
  faqs: {
    key: "faqs",
    label: "FAQ",
    singular: "une question",
    description: "Les questions fréquentes affichées en accordéon.",
    titleField: "q",
    fields: [
      { name: "q", label: "Question", type: "text", required: true, maxLength: 200 },
      { name: "a", label: "Réponse", type: "textarea", required: true, maxLength: 1200 },
    ],
  },
  gallery: {
    key: "gallery",
    label: "Galerie",
    singular: "une image",
    description:
      "Les photos de la section « En images » : locaux, équipe, événements. La première image est mise en avant dans la mosaïque.",
    titleField: "caption",
    fields: [
      {
        name: "src",
        label: "Image",
        type: "image",
        required: true,
        hint: "JPEG, PNG, WebP ou AVIF · 5 Mo maximum · 1600 px de large suffisent.",
      },
      {
        name: "caption",
        label: "Légende",
        type: "text",
        required: true,
        maxLength: 120,
        hint: "Affichée sous l’image, en petit.",
      },
      {
        name: "alt",
        label: "Description pour l’accessibilité",
        type: "textarea",
        required: true,
        maxLength: 200,
        hint: "Décrivez ce que montre l’image : c’est ce que liront les lecteurs d’écran et ce qui s’affichera si l’image ne charge pas.",
      },
    ],
  },
  stats: {
    key: "stats",
    label: "Chiffres clés",
    singular: "un chiffre clé",
    description:
      "Le bandeau de chiffres sous le hero. Quatre chiffres tiennent sur une ligne ; au-delà, la mise en page reste correcte mais moins dense.",
    titleField: "label",
    fields: [
      { name: "value", label: "Valeur affichée", type: "text", required: true, maxLength: 12, hint: "Ex. « 20+ », « 1 400+ », « 98 % »." },
      { name: "label", label: "Légende", type: "text", required: true, maxLength: 80, hint: "Ex. « années d’expérience »." },
    ],
  },
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS) as CollectionKey[];

export function isCollectionKey(value: unknown): value is CollectionKey {
  return typeof value === "string" && value in COLLECTIONS;
}

/* ------------------------------------------------------------------ */
/* Réglages scalaires (une valeur par clé)                             */
/* ------------------------------------------------------------------ */

export type SettingsGroup = "Accueil" | "Cabinet" | "Coordonnées" | "Pied de page";

export type SettingDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "list";
  group: SettingsGroup;
  hint?: string;
  maxLength?: number;
  fallback: string;
};

export const SETTINGS: readonly SettingDef[] = [
  {
    key: "hero_eyebrow", group: "Accueil", type: "text", maxLength: 120,
    label: "Sur-titre du hero",
    fallback: "CABINET D’EXPERTISE COMPTABLE · TUNIS · DEPUIS 2005",
  },
  {
    key: "hero_title", group: "Accueil", type: "text", maxLength: 120,
    label: "Titre principal (première partie)",
    hint: "Le texte affiché avant la partie en italique.",
    fallback: "Des chiffres clairs, des décisions",
  },
  {
    key: "hero_title_em", group: "Accueil", type: "text", maxLength: 60,
    label: "Titre principal (partie en italique)",
    fallback: "sereines.",
  },
  {
    key: "hero_description", group: "Accueil", type: "textarea", maxLength: 500,
    label: "Paragraphe d’introduction",
    fallback:
      "Le cabinet Ben Salem accompagne les entreprises tunisiennes et les investisseurs en comptabilité, fiscalité, audit et conseil — avec la rigueur d’un grand cabinet et la proximité d’une équipe à taille humaine.",
  },
  {
    key: "hero_trust", group: "Accueil", type: "list",
    label: "Arguments de réassurance",
    hint: "Une ligne par argument, affichés sous les boutons du hero.",
    fallback: "Expert-comptable inscrit à l’OECT\nPremier rendez-vous offert\nDevis écrit et ferme",
  },
  {
    key: "hero_cta_label", group: "Accueil", type: "text", maxLength: 60,
    label: "Libellé du bouton principal",
    fallback: "Demander un devis gratuit",
  },
  {
    key: "about_copy", group: "Cabinet", type: "textarea", maxLength: 900,
    label: "Texte de présentation du cabinet",
    fallback:
      "Fondé en 2005 par Mounir Ben Salem, le cabinet Ben Salem est né d’une conviction simple : une entreprise est mieux servie par des conseils clairs que par de la bureaucratie. Trois experts, une quarantaine de collaborateurs et une seule exigence — que nos clients prennent de meilleures décisions.",
  },
  {
    key: "plans_note", group: "Cabinet", type: "text", maxLength: 300,
    label: "Mention sous les formules",
    fallback:
      "Montants indicatifs, hors taxes, pour une SARL standard. Le devis final dépend du volume de pièces et des options retenues.",
  },
  {
    key: "contact_address", group: "Coordonnées", type: "text", maxLength: 200,
    label: "Adresse du cabinet",
    fallback: "Résidence El Kheireddine, av. Habib Bourguiba, Tunis 1003",
  },
  {
    key: "contact_phone", group: "Coordonnées", type: "text", maxLength: 40,
    label: "Téléphone",
    hint: "Affiché tel quel et utilisé pour le lien d’appel.",
    fallback: "+216 71 902 345",
  },
  {
    key: "contact_email", group: "Coordonnées", type: "text", maxLength: 180,
    label: "Adresse e-mail",
    fallback: "contact@benselem-ec.tn",
  },
  {
    key: "contact_hours", group: "Coordonnées", type: "text", maxLength: 120,
    label: "Horaires",
    fallback: "Lundi – Vendredi · 9 h à 17 h 30",
  },
  {
    key: "footer_blurb", group: "Pied de page", type: "textarea", maxLength: 400,
    label: "Texte de présentation du pied de page",
    fallback:
      "Cabinet d’expertise comptable à Tunis. Nous accompagnons les entreprises tunisiennes et les investisseurs avec rigueur et proximité depuis 2005.",
  },
];

export const SETTINGS_GROUPS: readonly SettingsGroup[] = ["Accueil", "Cabinet", "Coordonnées", "Pied de page"];

export const SETTINGS_BY_GROUP = SETTINGS_GROUPS.map((group) => ({
  group,
  fields: SETTINGS.filter((field) => field.group === group),
}));

export function getSettingDef(key: string): SettingDef | undefined {
  return SETTINGS.find((field) => field.key === key);
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type ValidationResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errors: Record<string, string> };

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Valide et normalise les champs d'un élément de contenu soumis par l'éditeur. */
export function validateItemData(collection: CollectionKey, form: FormData): ValidationResult {
  const def = COLLECTIONS[collection];
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of def.fields) {
    const raw = clean(form.get(field.name));

    switch (field.type) {
      case "boolean": {
        data[field.name] = form.get(field.name) === "true";
        break;
      }
      case "list": {
        const items = raw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        if (field.required && items.length === 0) {
          errors[field.name] = "Ajoutez au moins une ligne.";
          break;
        }
        data[field.name] = items;
        break;
      }
      case "icon": {
        if (!ICON_NAMES.includes(raw as never)) {
          errors[field.name] = "Choisissez une icône dans la liste.";
          break;
        }
        data[field.name] = raw;
        break;
      }
      case "color": {
        if (!/^#[0-9a-fA-F]{6}$/.test(raw)) {
          errors[field.name] = "Format attendu : #rrggbb.";
          break;
        }
        data[field.name] = raw.toLowerCase();
        break;
      }
      case "select": {
        if (!field.options?.includes(raw)) {
          errors[field.name] = "Valeur non autorisée.";
          break;
        }
        data[field.name] = raw;
        break;
      }
      case "image": {
        if (raw.length === 0) {
          if (field.required) {
            errors[field.name] = "Choisissez une image.";
            break;
          }
          data[field.name] = null;
          break;
        }
        if (!isUploadPath(raw)) {
          errors[field.name] = "Cette image n’est pas gérée par le cabinet.";
          break;
        }
        data[field.name] = raw;
        break;
      }
      default: {
        if (field.required && raw.length === 0) {
          errors[field.name] = "Ce champ est obligatoire.";
          break;
        }
        if (field.maxLength && raw.length > field.maxLength) {
          errors[field.name] = `${field.maxLength} caractères maximum.`;
          break;
        }
        // Un champ facultatif vide devient null plutôt qu'une chaîne vide,
        // pour que le rendu puisse tester la valeur simplement.
        data[field.name] = raw.length === 0 ? null : raw;
        break;
      }
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}

/** Lit une valeur de réglage soumise, en respectant le type déclaré. */
export function normalizeSetting(def: SettingDef, raw: string): string {
  const value = raw.replace(/\r\n/g, "\n").trim();
  if (def.type === "list") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }
  return value;
}
