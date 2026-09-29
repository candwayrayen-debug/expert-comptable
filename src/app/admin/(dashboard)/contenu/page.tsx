import { ArrowUpRight, Database, FileText, Plus, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { importDefaultsAction } from "@/app/admin/(dashboard)/contenu/actions";
import { Card, CardHead, Flash, PageHeader, firstParam, type AdminSearchParams } from "@/components/admin/ui";
import { readAllCollections } from "@/lib/content";
import { COLLECTIONS, COLLECTION_KEYS, SETTINGS, type CollectionKey } from "@/lib/content-schema";

export const dynamic = "force-dynamic";

function preview(value: unknown, max = 110): string {
  if (typeof value === "string") {
    return value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;
  }
  return "";
}

export default async function ContentIndexPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const params = await searchParams;
  const collections = await readAllCollections();
  const seeded = COLLECTION_KEYS.every((key) => collections[key].every((row) => row.id > 0));

  const subtitleFields = ["text", "desc", "quote", "a", "role", "company", "bio"];

  return (
    <>
      <PageHeader
        eyebrow="Contenu"
        title="Contenu du site"
        description="Tout ce qui s’affiche sur la page d’accueil, modifiable sans intervention technique. Les modifications sont visibles immédiatement après enregistrement."
        actions={
          // Le contenu ne peut être modifié qu'une fois importé en base.
          !seeded && (
            <form action={importDefaultsAction}>
              <input type="hidden" name="collection" value="" />
              <button className="adm-btn adm-btn-accent" type="submit">
                <Database size={16} /> Importer le contenu par défaut
              </button>
            </form>
          )
        }
      />

      <div className="admin-content">
        <Flash params={params} />

        {!seeded && (
          <p className="adm-flash adm-flash-warn">
            <TriangleAlert size={18} />
            <div className="adm-flash-body">
              <strong>Le contenu affiché est celui livré avec le site, pas encore en base</strong>
              La page publique fonctionne, mais les éléments listés ci-dessous ne sont pas encore
              modifiables. Importez-les une fois pour les rendre éditables — cette opération
              n’écrase aucun message reçu.
            </div>
          </p>
        )}

        <div className="adm-kpis" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <div className="adm-kpi">
            <span className="adm-kpi-label">
              <FileText size={14} /> Éléments publiés
            </span>
            <strong className="adm-kpi-value">
              {COLLECTION_KEYS.reduce((total, key) => total + collections[key].length, 0)}
            </strong>
            <span className="adm-kpi-hint">répartis sur {COLLECTION_KEYS.length} collections</span>
          </div>
          <div className="adm-kpi">
            <span className="adm-kpi-label">Collections</span>
            <strong className="adm-kpi-value">{COLLECTION_KEYS.length}</strong>
            <span className="adm-kpi-hint">
              sections de la page d’accueil, chacune modifiable indépendamment
            </span>
          </div>
          <div className="adm-kpi">
            <span className="adm-kpi-label">Réglages</span>
            <strong className="adm-kpi-value">{SETTINGS.length}</strong>
            <span className="adm-kpi-hint">
              <Link href="/admin/reglages">Titres et coordonnées →</Link>
            </span>
          </div>
        </div>

        {COLLECTION_KEYS.map((key: CollectionKey) => {
          const def = COLLECTIONS[key];
          const rows = collections[key];
          const subtitle = subtitleFields.find((name) => def.fields.some((field) => field.name === name));
          const sample = rows[0]?.data ?? {};

          return (
            <Card key={key}>
              <CardHead
                title={def.label}
                description={def.description}
                actions={
                  <div className="admin-actions">
                    <span className="adm-drag-note">
                      {rows.length} élément{rows.length > 1 ? "s" : ""}
                    </span>
                    <Link className="adm-btn adm-btn-sm" href={`/admin/contenu/${key}`}>
                      Gérer <ArrowUpRight size={14} />
                    </Link>
                    <Link className="adm-btn adm-btn-sm adm-btn-primary" href={`/admin/contenu/${key}/nouveau`}>
                      <Plus size={14} /> Ajouter
                    </Link>
                  </div>
                }
              />
              {rows.length > 0 && (
                <div className="adm-card-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#6d7972", lineHeight: 1.7 }}>
                    <strong style={{ color: "#2b4a3c" }}>
                      {String(sample[def.titleField] ?? "—")}
                    </strong>
                    {subtitle && preview(sample[subtitle]) ? ` — ${preview(sample[subtitle])}` : ""}
                    {rows.length > 1 && (
                      <span style={{ color: "#95a29a" }}> · et {rows.length - 1} autre(s)</span>
                    )}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
