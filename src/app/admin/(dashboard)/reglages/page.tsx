import { ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { importSettingsAction, saveSettingsAction } from "@/app/admin/(dashboard)/reglages/actions";
import { SettingsForm } from "@/components/admin/settings-form";
import { Flash, PageHeader, type AdminSearchParams } from "@/components/admin/ui";
import { isContentSeeded, readSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const params = await searchParams;
  const [values, seeded] = await Promise.all([readSettings(), isContentSeeded()]);

  return (
    <>
      <PageHeader
        eyebrow="Réglages"
        title="Réglages du site"
        description="Titres, textes et coordonnées affichés sur la page d’accueil, dans le formulaire de contact et dans le pied de page."
        actions={
          <Link className="adm-btn" href="/" target="_blank">
            Voir le site <ExternalLink size={14} />
          </Link>
        }
      />

      <div className="admin-content">
        <Flash params={params} />

        {!seeded ? (
          <p className="adm-flash adm-flash-warn">
            <Info size={18} />
            <div className="adm-flash-body">
              <strong>Les réglages doivent d’abord être importés</strong>
              Tant que le contenu livré avec le site n’est pas en base, les valeurs ci-dessous sont
              celles par défaut et ne peuvent pas être enregistrées. Importez-les une fois pour
              pouvoir les modifier.
              <div className="adm-flash-actions">
                <form action={importSettingsAction}>
                  <input type="hidden" name="from" value="reglages" />
                  <button className="adm-btn adm-btn-sm adm-btn-accent" type="submit">
                    Importer le contenu par défaut
                  </button>
                </form>
              </div>
            </div>
          </p>
        ) : (
          <SettingsForm values={values} action={saveSettingsAction} />
        )}
      </div>
    </>
  );
}
