import { AlertTriangle, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/login/login-form";
import { getAdminSession, isAdminConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion · Administration" };

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  const configured = isAdminConfigured();

  return (
    <div className="admin-shell">
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <span className="admin-brand-mark" aria-hidden="true">
              <span className="admin-brand-bar admin-brand-bar-1" />
              <span className="admin-brand-bar admin-brand-bar-2" />
              <span className="admin-brand-bar admin-brand-bar-3" />
            </span>
            <span className="admin-brand-text">
              <span className="admin-brand-word" style={{ color: "#192e2a" }}>Cabinet Ben Salem</span>
              <span className="admin-brand-sub">ESPACE D’ADMINISTRATION</span>
            </span>
          </div>

          <h1>Connexion</h1>
          <p>Identifiez-vous pour consulter les demandes de contact et gérer le contenu du site.</p>

          {configured ? (
            <LoginForm />
          ) : (
            <div className="adm-flash adm-flash-warn" role="alert">
              <AlertTriangle size={17} />
              <div>
                <strong>Administration non configurée</strong>
                <p style={{ margin: 0 }}>
                  La variable <code>ADMIN_PASSWORD</code> est absente. Définissez-la dans
                  <code> .env.local</code> puis redémarrez le serveur.
                </p>
              </div>
            </div>
          )}

          <p style={{ marginTop: 22, fontSize: 12 }}>
            <Link
              href="/"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#175d4a", fontWeight: 600 }}
            >
              <ArrowLeft size={14} /> Retour au site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
