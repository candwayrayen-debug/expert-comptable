"use client";

import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ACCEPTED_FORMATS_LABEL, ACCEPTED_MIME, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-rules";

/**
 * Champ d'image : aperçu de l'image en place, sélection d'un nouveau fichier,
 * et retrait éventuel.
 *
 * Le fichier est envoyé sous un nom distinct (`__upload_<champ>`) de celui qui
 * porte la valeur courante : l'action serveur sait ainsi sans ambiguïté si un
 * nouveau fichier a été choisi ou si l'image existante est conservée.
 */
export function ImageField({
  name,
  label,
  currentPath,
  error,
  hint,
  required,
}: {
  name: string;
  label: string;
  currentPath: string;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [localError, setLocalError] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Les URL d'objet restent allouées jusqu'au démontage : sans révocation, le
  // navigateur conserve le fichier en mémoire pendant toute la session.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const shown = preview ?? (cleared ? null : currentPath || null);

  function select(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Première barrière côté navigateur, pour éviter d'envoyer 40 Mo sur le
    // réseau avant que le serveur ne refuse. Le serveur revérifie de toute façon.
    if (file.size > MAX_UPLOAD_BYTES) {
      setLocalError(`Image trop lourde : ${MAX_UPLOAD_LABEL} maximum.`);
      event.target.value = "";
      return;
    }

    setLocalError("");
    setCleared(false);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  function clear() {
    setLocalError("");
    setPreview(null);
    setCleared(true);
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <div className="adm-field">
      <span className="adm-field-label">
        {label} {required && <span>*</span>}
      </span>

      {/* Valeur transmise à l'action : chemin existant ou chaîne vide si retiré. */}
      <input type="hidden" name={name} value={cleared ? "" : currentPath} />
      {cleared && <input type="hidden" name={`__clear_${name}`} value="true" />}

      <div className="adm-image-field">
        <div className={shown ? "adm-image-preview" : "adm-image-preview is-empty"}>
          {shown ? (
            // Aperçu local (blob) ou fichier déjà en place : `<img>` évite de
            // faire passer un aperçu jetable par l'optimiseur d'images.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" />
          ) : (
            <span className="adm-image-placeholder">
              <ImagePlus size={22} strokeWidth={1.6} />
              Aucune image
            </span>
          )}
        </div>

        <div className="adm-image-controls">
          <label className="adm-btn adm-btn-sm" style={{ cursor: "pointer" }}>
            <Upload size={14} />
            {shown ? "Remplacer l’image" : "Choisir une image"}
            <input
              ref={fileInput}
              type="file"
              name={`__upload_${name}`}
              accept={ACCEPTED_MIME}
              onChange={select}
              style={{ display: "none" }}
            />
          </label>

          {shown && (
            <button className="adm-btn adm-btn-sm adm-btn-danger" type="button" onClick={clear}>
              <Trash2 size={14} /> Retirer
            </button>
          )}

          <span className="adm-field-hint" style={{ marginTop: 4 }}>
            Envoi au moment de l’enregistrement. L’image n’est pas publiée avant.
          </span>
        </div>
      </div>

      {(localError || error) && <span className="adm-field-error">{localError || error}</span>}

      {!localError && !error && hint && <span className="adm-field-hint">{hint}</span>}
    </div>
  );
}
