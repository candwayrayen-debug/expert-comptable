import { Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { importDefaultsAction, saveItemAction } from "@/app/admin/(dashboard)/contenu/actions";
import { ContentForm } from "@/components/admin/content-form";
import { Card, CardHead, Flash, PageHeader, type AdminSearchParams } from "@/components/admin/ui";
import { isContentSeeded } from "@/lib/content";
import { COLLECTIONS, isCollectionKey } from "@/lib/content-schema";

export const dynamic = "force-dynamic";

export default async function NewCollectionItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<AdminSearchParams>;
}) {
  const { collection } = await params;
  const query = await searchParams;
  if (!isCollectionKey(collection)) notFound();

  const def = COLLECTIONS[collection];
  const seeded = await isContentSeeded();

  return (
    <>
      <PageHeader
        eyebrow={`Contenu · ${def.label}`}
        title={`Ajouter ${def.singular}`}
        description="L’élément est ajouté en fin de liste et publié immédiatement sur le site."
        actions={
          <Link className="adm-btn" href={`/admin/contenu/${collection}`}>
            Retour à la liste
          </Link>
        }
      />

      <div className="admin-content">
        <Flash params={query} />

        {seeded ? (
          <Card>
            <CardHead title="Informations" description={`Champs de la collection « ${def.label} ».`} />
            <div className="adm-card-body">
              <ContentForm
                collection={collection}
                values={{}}
                action={saveItemAction}
                submitLabel="Ajouter et publier"
                cancelHref={`/admin/contenu/${collection}`}
              />
            </div>
          </Card>
        ) : (
          <Card>
            <div className="adm-card-body">
              <p className="adm-flash adm-flash-warn">
                <Info size={18} />
                <div className="adm-flash-body">
                  <strong>Importez d’abord le contenu existant</strong>
                  La base ne contient pas encore cette collection. Tant qu’elle est vide, le site
                  public affiche le contenu livré par défaut : ajouter un élément ici créerait une
                  liste incomplète. Importez le contenu une fois, puis ajoutez vos éléments.
                  <div className="adm-flash-actions">
                    <form action={importDefaultsAction}>
                      <input type="hidden" name="collection" value={collection} />
                      <button className="adm-btn adm-btn-sm adm-btn-accent" type="submit">
                        Importer le contenu par défaut
                      </button>
                    </form>
                  </div>
                </div>
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
