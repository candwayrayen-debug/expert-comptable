"use client";

import { useActionState } from "react";
import { SETTINGS_BY_GROUP, type SettingDef } from "@/lib/content-schema";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";

function SettingControl({ field, value, error }: { field: SettingDef; value: string; error?: string }) {
  const className = field.type === "text" ? "adm-input" : "adm-textarea";
  const invalid = error ? true : undefined;

  return (
    <label className="adm-field">
      <span className="adm-field-label">{field.label}</span>
      {field.type === "text" ? (
        <input
          className={error ? `${className} has-error` : className}
          type="text"
          name={field.key}
          defaultValue={value}
          maxLength={field.maxLength}
          aria-invalid={invalid}
        />
      ) : (
        <textarea
          className={error ? `${className} has-error` : className}
          name={field.key}
          defaultValue={value}
          rows={4}
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

export function SettingsForm({
  values,
  action,
}: {
  values: Record<string, string>;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const errors = state.errors ?? {};

  return (
    <form className="adm-form" action={formAction}>
      {SETTINGS_BY_GROUP.map(({ group, fields }) => (
        <section className="adm-card" key={group}>
          <div className="adm-card-head">
            <h2 className="adm-settings-title">{group}</h2>
            <p style={{ margin: 0, color: "#6d7972", fontSize: 12 }}>
              {fields.length} réglage{fields.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="adm-card-body adm-settings-group">
            {fields.map((field) => (
              <SettingControl key={field.key} field={field} value={values[field.key] ?? ""} error={errors[field.key]} />
            ))}
          </div>
        </section>
      ))}

      {state.error && (
        <p className="adm-flash adm-flash-error" role="alert">
          {state.error}
        </p>
      )}

      <div className="adm-form-actions" style={{ borderTop: 0, paddingTop: 0 }}>
        <button className="adm-btn adm-btn-primary" type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les réglages"}
        </button>
        <span className="adm-field-hint" style={{ marginTop: 0 }}>
          Les modifications sont appliquées au site immédiatement après enregistrement.
        </span>
      </div>
    </form>
  );
}
