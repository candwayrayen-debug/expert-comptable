"use client";

import type { ReactNode } from "react";

/**
 * Bouton de soumission qui demande confirmation. Utilisé pour les actions
 * destructrices (suppression d'un message, d'une formule…) : sans garde-fou,
 * un clic mal placé détruit des données définitivement.
 */
export function ConfirmButton({
  children,
  message,
  className = "adm-btn adm-btn-danger",
  title,
}: {
  children: ReactNode;
  message: string;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      title={title}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
