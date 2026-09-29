"use client";

import { AlertCircle, ArrowRight, LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form className="adm-form" action={formAction}>
      <label className="adm-field">
        <span className="adm-field-label">
          Mot de passe <span>*</span>
        </span>
        <input
          className={state.error ? "adm-input has-error" : "adm-input"}
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="••••••••••"
          aria-invalid={state.error ? true : undefined}
        />
      </label>

      {state.error && (
        <p className="adm-flash adm-flash-error" role="alert">
          <AlertCircle size={17} />
          <span>{state.error}</span>
        </p>
      )}

      <button className="adm-btn adm-btn-primary" type="submit" disabled={pending} style={{ width: "100%", minHeight: 46 }}>
        {pending ? "Vérification…" : "Accéder à l’administration"} <ArrowRight size={17} />
      </button>

      <p className="admin-login-note">
        <LockKeyhole size={14} />
        <span>
          Espace réservé au cabinet. Les tentatives d’accès sont limitées et la session expire après
          8 heures d’inactivité relative.
        </span>
      </p>
    </form>
  );
}
