"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { ICONS, ICON_NAMES } from "@/lib/icons";

/** Sélecteur d'icône avec aperçu : le rendu réel est visible avant d'enregistrer. */
export function IconSelect({ name, defaultValue, hasError }: { name: string; defaultValue: string; hasError?: boolean }) {
  const [selected, setSelected] = useState(defaultValue);
  const Icon = ICONS[selected as keyof typeof ICONS] ?? Sparkles;

  return (
    <div className="adm-icon-preview">
      <span className="adm-icon-box" aria-hidden="true">
        <Icon size={20} strokeWidth={1.6} />
      </span>
      <select
        className={hasError ? "adm-select has-error" : "adm-select"}
        name={name}
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
      >
        {ICON_NAMES.map((iconName) => (
          <option key={iconName} value={iconName}>
            {iconName}
          </option>
        ))}
      </select>
    </div>
  );
}
