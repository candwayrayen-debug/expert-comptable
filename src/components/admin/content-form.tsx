"use client";

import Link from "next/link";
import { useActionState } from "react";
import { IconSelect } from "@/components/admin/icon-select";
import { ImageField } from "@/components/admin/image-field";
import { COLLECTIONS, type CollectionKey, type FieldDef } from "@/lib/content-schema";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";

function currentValue(values: Record<string, unknown>, field: FieldDef): string {
  const raw = values[field.name];
  if (Array.isArray(raw)) return raw.join("\n");
  if (typeof raw === "string") return raw;
  if (raw === null || raw === undefined) return "";
  return String(raw);
}

function FieldControl({ field, values, error }: { field: FieldDef; values: Record<string, unknown>; error?: string }) {
  const value = currentValue(values, field);
  const invalid = error ? true : undefined;

  if (field.type === "image") {
    return (
      <ImageField
        name={field.name}
        label={field.label}
        currentPath={value}
        error={error}
        hint={field.hint}
        required={field.required}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="adm-field">
        <span className="adm-field-label">{field.label}</span>
        <label className="adm-check">
          <input type="checkbox" name={field.name} value="true" defaultChecked={values[field.name] === true} />
          <span>{field.hint ?? "Activer cette option."}</span>
        </label>
      </div>
    );
  }

  const className = `${field.type === "textarea" || field.type === "list" ? "adm-textarea" : "adm-input"}${
    error ? " has-error" : ""
  }`;

  return (
    <label className="adm-field">
      <span className="adm-field-label">
        {field.label} {field.required && <span>*</span>}
      </span>

      {field.type === "textarea" || field.type === "list" ? (
        <textarea
          className={className}
          name={field.name}
          defaultValue={value}
          rows={field.type === "list" ? 5 : 6}
          maxLength={field.maxLength}
          aria-invalid={invalid}
        />
      ) : field.type === "icon" ? (
        <IconSelect name={field.name} defaultValue={value || "Sparkles"} hasError={Boolean(error)} />
      ) : field.type === "color" ? (
        <input
          className="adm-input adm-input-color"
          type="color"
          name={field.name}
          defaultValue={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#dde9d9"}
        />
      ) : (
        <input
          className={className}
          type="text"
          name={field.name}
          defaultValue={value}
          maxLength={field.maxLength}
          aria-invalid={invalid}
        />
      )}

      {error ? (
        <span className="adm-field-error">{error}</span>
      ) : (
        field.hint && <span className="adm-field-hint">{field.hint}</span>
      )}
    </label>
  );
}

/**
 * Formulaire d'édition d'un élément de contenu. Les actions secondaires
 * (suppression) sont volontairement rendues par l'appelant, en dehors de ce
 * formulaire : un `<form>` imbriqué dans un autre produit un HTML invalide,
 * que le navigateur éclate — et la soumission part alors vers la mauvaise action.
 */
export function ContentForm({
  collection,
  values,
  action,
  submitLabel,
  cancelHref,
  hiddenFields = {},
}: {
  collection: CollectionKey;
  values: Record<string, unknown>;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  cancelHref: string;
  hiddenFields?: Record<string, string | number>;
}) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const def = COLLECTIONS[collection];
  const errors = state.errors ?? {};

  return (
    <form className="adm-form" action={formAction}>
      <input type="hidden" name="collection" value={collection} />
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {def.fields.map((field) => (
        <FieldControl key={field.name} field={field} values={values} error={errors[field.name]} />
      ))}

      {state.error && (
        <p className="adm-flash adm-flash-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="adm-form-actions">
        <button className="adm-btn adm-btn-primary" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : submitLabel}
        </button>
        <Link className="adm-btn" href={cancelHref}>
          Annuler
        </Link>
      </div>
    </form>
  );
}
