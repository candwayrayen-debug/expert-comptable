import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteItemAction, saveItemAction } from "@/app/admin/(dashboard)/contenu/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ContentForm } from "@/components/admin/content-form";
import { Card, CardHead, Flash, PageHeader, type AdminSearchParams } from "@/components/admin/ui";
import { readCollection } from "@/lib/content";
import { COLLECTIONS, isCollectionKey, type CollectionKey } from "@/lib/content-schema";

export const dynamic = "force-dynamic";

/** Ancre de la page d'accueil correspondant à chaque collection. */
const PREVIEW_ANCHORS: Partial<Record<CollectionKey, string>> = {
  services: "/#services",
  values: "/#cabinet",
  team: "/#cabinet",
  plans: "/#formules",
  testimonials: "/#temoignages",
};

export default async function EditCollectionItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string; id: string }>;
  searchParams: Promise<AdminSearchParams>;
}) {
  const { collection, id } = await params;
  const query = await searchParams;
  if (!isCollectionKey(collection)) notFound();

  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const def = COLLECTIONS[collection];
  const rows = await readCollection(collection, { publishedOnly: false });
  const item = rows.find((row) => row.id === numericId);

  if (!item) notFound();

  const title = String(item.data[def.titleField] ?? "Élément");
  const anchor = PREVIEW_ANCHORS[collection];

  return (
    <>
      <PageHeader
        eyebrow={`Contenu · ${def.label}`}
        title={title}
        description="Les modifications remplacent le contenu actuel dès l’enregistrement."
        actions={
          <>
            <Link className="adm-btn" href={`/admin/contenu/${collection}`}>
              Retour à la liste
            </Link>
            {anchor && (
              <Link className="adm-btn" href={anchor} target="_blank">
                Voir sur le site <ExternalLink size={14} />
              </Link>
            )}
          </>
        }
      />

      <div className="admin-content">
        <Flash params={query} />

        <Card>
          <CardHead title="Informations" description={`${def.fields.length} champs éditables.`} />
          <div className="adm-card-body">
            <ContentForm
              collection={collection}
              values={item.data}
              action={saveItemAction}
              submitLabel="Enregistrer les modifications"
              cancelHref={`/admin/contenu/${collection}`}
              hiddenFields={{ id: item.id }}
            />
          </div>
        </Card>

        <Card>
          <CardHead
            title="Suppression"
            description="Action définitive : l’élément est retiré de la base et disparaît du site public."
          />
          <div className="adm-card-body">
            <form action={deleteItemAction}>
              <input type="hidden" name="collection" value={collection} />
              <input type="hidden" name="id" value={item.id} />
              <ConfirmButton message={`Supprimer définitivement « ${title} » ? Cette action est irréversible.`}>
                Supprimer cet élément
              </ConfirmButton>
            </form>
            <p className="adm-drag-note" style={{ marginTop: 14 }}>
              Élément n°{item.id} · position {(item.position ?? 0) + 1} ·{" "}
              {item.published ? "publié sur le site" : "masqué du site public"}
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
