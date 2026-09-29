/**
 * État renvoyé par les actions de formulaire pilotées par `useActionState`.
 * `errors` porte les messages par champ, `error` un message global.
 */
export type FormState = {
  error?: string;
  errors?: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = {};
