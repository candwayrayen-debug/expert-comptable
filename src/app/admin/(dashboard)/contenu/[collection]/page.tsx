import { ArrowDown, ArrowUp, Eye, EyeOff, Info, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteItemAction,
  importDefaultsAction,
  moveItemAction,
  togglePublishAction,
} from "@/app/admin/(dashboard)/contenu/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, CardHead, EmptyState, Flash, PageHeader, type AdminSearchParams } from "@/components/admin/ui";
import { isContentSeeded, readCollection } from "@/lib/content";
import { COLLECTIONS, isCollectionKey } from "@/lib/content-schema";
import { resolveIcon } from "@/lib/icons";

export const dynamic = "force-dynamic";

/** Champs utilisés pour l'aperçu secondaire, par ordre de préférence. */
const SUBTITLE_FIELDS = ["text", "desc", "quote", "a", "role", "bio", "company"];

function truncate(value: unknown, max = 120): string {
  if (typeof value !== "string") return "";
  return value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;
}

export default async function CollectionItemsPage({
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
  const rows = await readCollection(collection, { publishedOnly: false });
  // Le marqueur global est plus fiable que l'examen des identifiants : une
  // collection légitimement vide (la galerie au départ) ne doit pas être prise
  // pour un contenu non importé.
  const seeded = await isContentSeeded();
  const subtitleField = SUBTITLE_FIELDS.find((name) => def.fields.some((field) => field.name === name));

  function thumbnail(data: Record<string, unknown>) {
    // Collection illustrée par des images (galerie) : on montre le visuel, sans
    // quoi la liste ne serait qu'une suite de légendes impossibles à distinguer.
    const imageField = def.fields.find((field) => field.type === "image");
    if (imageField && typeof data[imageField.name] === "string") {
      return (
        <span className="adm-item-thumb adm-item-thumb-image">
          {/* Vignette d'administration : un <img> suffit, l'optimiseur n'apporte
              rien à cette taille et retarderait l'affichage de la liste. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data[imageField.name] as string} alt="" />
        </span>
      );
    }
    if (def.fields.some((field) => field.name === "icon")) {
      const Icon = resolveIcon(data.icon);
      return (
        <span className="adm-item-thumb" aria-hidden="true">
          <Icon size={17} strokeWidth={1.7} />
        </span>
      );
    }
    if (typeof data.initials === "string") {
      const color = typeof data.color === "string" ? data.color : "#dde9d9";
      return (
        <span className="adm-item-thumb" style={{ background: color }} aria-hidden="true">
          {data.initials}
        </span>
      );
    }
    return null;
  }

  return (
    <>
      <PageHeader
        eyebrow={`Contenu · ${def.label}`}
        title={def.label}
        description={def.description}
        actions={
          <>
            <Link className="adm-btn" href="/admin/contenu">
              Toutes les collections
            </Link>
            <Link className="adm-btn adm-btn-primary" href={`/admin/contenu/${collection}/nouveau`}>
              <Plus size={16} /> Ajouter {def.singular}
            </Link>
          </>
        }
      />

      <div className="admin-content">
        <Flash params={query} />

        {!seeded && (
          <p className="adm-flash adm-flash-warn">
            <Info size={18} />
            <div className="adm-flash-body">
              <strong>Contenu par défaut, non modifiable</strong>
              Les éléments ci-dessous proviennent du contenu livré avec le site. Importez-les en base
              pour pouvoir les modifier. Aucun message reçu n’est affecté.
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
        )}

        <Card>
          <CardHead
            title={`${rows.length} élément${rows.length > 1 ? "s" : ""}`}
            description="L’ordre de cette liste est celui de la page d’accueil."
          />

          {rows.length === 0 ? (
            <EmptyState
              icon={<Plus size={24} />}
              title="Cette collection est vide"
              description={`Ajoutez ${def.singular} pour qu’elle apparaisse sur le site. Une section vide n’est pas affichée tant qu’elle ne contient aucun élément.`}
              action={
                <Link className="adm-btn adm-btn-primary" href={`/admin/contenu/${collection}/nouveau`}>
                  <Plus size={16} /> Ajouter {def.singular}
                </Link>
              }
            />
          ) : (
            <div className="adm-card-body-tight">
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th style={{ width: 46 }}>Ordre</th>
                      <th>Élément</th>
                      <th>État</th>
                      <th className="adm-cell-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const title = String(row.data[def.titleField] ?? "—");
                      const subtitle = subtitleField ? truncate(row.data[subtitleField]) : "";
                      const editable = row.id > 0;

                      return (
                        <tr key={row.id}>
                          <td>
                            <div className="adm-reorder">
                              <form action={moveItemAction}>
                                <input type="hidden" name="collection" value={collection} />
                                <input type="hidden" name="id" value={row.id} />
                                <input type="hidden" name="direction" value="up" />
                                <button
                                  className="adm-btn adm-btn-icon adm-btn-sm"
                                  type="submit"
                                  disabled={index === 0 || !editable}
                                  title="Monter"
                                  aria-label={`Monter ${title}`}
                                >
                                  <ArrowUp size={13} />
                                </button>
                              </form>
                              <form action={moveItemAction}>
                                <input type="hidden" name="collection" value={collection} />
                                <input type="hidden" name="id" value={row.id} />
                                <input type="hidden" name="direction" value="down" />
                                <button
                                  className="adm-btn adm-btn-icon adm-btn-sm"
                                  type="submit"
                                  disabled={index === rows.length - 1 || !editable}
                                  title="Descendre"
                                  aria-label={`Descendre ${title}`}
                                >
                                  <ArrowDown size={13} />
                                </button>
                              </form>
                            </div>
                          </td>
                          <td>
                            <span className="adm-item-title">
                              {thumbnail(row.data)}
                              <span style={{ minWidth: 0 }}>
                                <span className="adm-cell-strong">{title}</span>
                                {subtitle && <span className="adm-cell-sub">{subtitle}</span>}
                              </span>
                            </span>
                          </td>
                          <td>
                            {row.published ? (
                              <span className="adm-badge adm-badge-on">Publié</span>
                            ) : (
                              <span className="adm-badge adm-badge-off">Masqué</span>
                            )}
                          </td>
                          <td>
                            <div className="adm-row-actions">
                              <form action={togglePublishAction}>
                                <input type="hidden" name="collection" value={collection} />
                                <input type="hidden" name="id" value={row.id} />
                                <button
                                  className="adm-btn adm-btn-sm"
                                  type="submit"
                                  disabled={!editable}
                                  title={row.published ? "Masquer sur le site" : "Publier sur le site"}
                                >
                                  {row.published ? <EyeOff size={13} /> : <Eye size={13} />}
                                  {row.published ? "Masquer" : "Publier"}
                                </button>
                              </form>

                              <Link
                                className="adm-btn adm-btn-sm"
                                href={editable ? `/admin/contenu/${collection}/${row.id}` : "/admin/contenu"}
                                aria-disabled={!editable}
                                title={editable ? "Modifier" : "Importez le contenu pour le modifier"}
                              >
                                <Pencil size={13} /> Modifier
                              </Link>

                              <form action={deleteItemAction}>
                                <input type="hidden" name="collection" value={collection} />
                                <input type="hidden" name="id" value={row.id} />
                                <ConfirmButton
                                  className="adm-btn adm-btn-sm adm-btn-danger"
                                  message={`Supprimer définitivement « ${title} » ? Cette action est irréversible.`}
                                  title="Supprimer"
                                >
                                  <Trash2 size={13} />
                                </ConfirmButton>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
