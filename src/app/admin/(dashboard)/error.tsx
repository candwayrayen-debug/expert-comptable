"use client";

import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Filet de sécurité de l'espace d'administration.
 *
 * Sans ce fichier, toute erreur serveur affiche la page d'erreur brute de
 * Next.js, en anglais et sans issue de secours. C'est notamment le cas d'un
 * envoi d'image qui dépasse la taille maximale acceptée par le framework :
 * cette vérification a lieu avant l'action, il est donc impossible de la
 * rattraper côté serveur.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Erreur dans l’administration", error);
  }, [error]);

  return (
    <div className="admin-login-page" style={{ background: "#f4f6f1" }}>
      <div className="admin-login-card">
        <div className="admin-icon-error">
          <AlertTriangle size={26} strokeWidth={1.7} />
        </div>

        <h1>L’action n’a pas abouti</h1>
        <p>
          Une erreur est survenue pendant le traitement. Si vous veniez d’envoyer une image,
          vérifiez qu’elle ne dépasse pas la taille autorisée, puis réessayez.
        </p>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 22 }}>
          <button className="adm-btn adm-btn-primary" type="button" onClick={reset}>
            <RotateCcw size={15} /> Réessayer
          </button>
          <Link className="adm-btn" href="/admin">
            <ArrowLeft size={15} /> Tableau de bord
          </Link>
        </div>

        {error.digest && (
          <p className="admin-login-note" style={{ marginTop: 20 }}>
            Référence technique à communiquer au développeur : <code>{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
