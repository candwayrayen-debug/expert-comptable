import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

export type AdminSearchParams = Record<string, string | string[] | undefined>;

export function firstParam(params: AdminSearchParams, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Bandeau de confirmation ou d'erreur, alimenté par les paramètres d'URL. */
export function Flash({ params }: { params: AdminSearchParams }) {
  const ok = firstParam(params, "ok");
  const error = firstParam(params, "error");
  const info = firstParam(params, "info");

  if (!ok && !error && !info) return null;

  const variant = error ? "adm-flash-error" : ok ? "adm-flash-ok" : "adm-flash-info";
  const Icon = error ? AlertCircle : ok ? CheckCircle2 : Info;

  return (
    <p className={`adm-flash ${variant}`} role={error ? "alert" : "status"}>
      <Icon size={18} />
      <span>{error || ok || info}</span>
    </p>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-topbar">
      <div>
        <span className="admin-eyebrow">
          <i aria-hidden="true" />
          {eyebrow.toUpperCase()}
        </span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-actions">{actions}</div>}
    </header>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={className ? `adm-card ${className}` : "adm-card"}>{children}</section>;
}

export function CardHead({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="adm-card-head">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="adm-empty">
      <span className="adm-empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
