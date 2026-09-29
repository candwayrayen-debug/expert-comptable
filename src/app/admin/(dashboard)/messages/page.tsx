import { Download, Inbox, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { markAllReadAction } from "@/app/admin/(dashboard)/messages/actions";
import { Card, EmptyState, Flash, PageHeader, firstParam, type AdminSearchParams } from "@/components/admin/ui";
import { formatDateTime, relativeAge } from "@/lib/format";
import {
  countByStatus,
  isStatus,
  listMessages,
  listServiceOptions,
  PER_PAGE,
  STATUS_LABELS,
} from "@/lib/messages";
import { MESSAGE_STATUSES } from "@/db/schema";

export const dynamic = "force-dynamic";

type Tab = { value: string; label: string; count: number };

function buildQuery(base: Record<string, string>, overrides: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    if (value !== undefined && value !== "" && value !== null) params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const params = await searchParams;

  const search = firstParam(params, "q");
  const service = firstParam(params, "service");
  const rawStatus = firstParam(params, "statut");
  const rawPage = Number(firstParam(params, "page"));

  // Par défaut, tout est affiché : le tri place déjà les demandes non lues en tête.
  const status = rawStatus === "tous" ? "" : isStatus(rawStatus) ? rawStatus : "";

  const filters = {
    q: search,
    status,
    service,
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
  };

  const [result, counts, services] = await Promise.all([
    listMessages(filters),
    countByStatus(),
    listServiceOptions(),
  ]);

  const baseQuery = { q: search, statut: rawStatus || "tous", service };
  const tabs: Tab[] = [
    { value: "tous", label: "Toutes", count: counts.total },
    { value: "nouveau", label: "Nouvelles", count: counts.nouveau },
    { value: "lu", label: "Lues", count: counts.lu },
    { value: "traite", label: "Traitées", count: counts.traite },
    { value: "archive", label: "Archivées", count: counts.archive },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Demandes"
        title="Demandes de contact"
        description="Chaque message envoyé depuis le formulaire du site arrive ici. Les demandes non lues remontent en tête de liste."
        actions={
          <>
            <form action={markAllReadAction}>
              <input type="hidden" name="returnTo" value={`/admin/messages${buildQuery(baseQuery, {})}`} />
              <button
                className="adm-btn"
                type="submit"
                disabled={counts.nouveau === 0}
                title={counts.nouveau === 0 ? "Aucune demande non lue" : "Marquer toutes les demandes non lues comme lues"}
              >
                Tout marquer comme lu
              </button>
            </form>
            <Link className="adm-btn adm-btn-primary" href={`/admin/messages/export${buildQuery(baseQuery, {})}`}>
              <Download size={16} /> Exporter en CSV
            </Link>
          </>
        }
      />

      <div className="admin-content">
        <Flash params={params} />

        <div className="adm-kpis">
          <div className="adm-kpi is-accent">
            <span className="adm-kpi-label">
              <Inbox size={14} /> À traiter
            </span>
            <strong className="adm-kpi-value">{counts.nouveau}</strong>
            <span className="adm-kpi-hint">demande(s) jamais ouverte(s)</span>
          </div>
          <div className="adm-kpi">
            <span className="adm-kpi-label">Lues</span>
            <strong className="adm-kpi-value">{counts.lu}</strong>
            <span className="adm-kpi-hint">ouvertes, pas encore traitées</span>
          </div>
          <div className="adm-kpi">
            <span className="adm-kpi-label">Traitées</span>
            <strong className="adm-kpi-value">{counts.traite}</strong>
            <span className="adm-kpi-hint">marquées comme répondues</span>
          </div>
          <div className="adm-kpi">
            <span className="adm-kpi-label">Total reçu</span>
            <strong className="adm-kpi-value">{counts.total}</strong>
            <span className="adm-kpi-hint">depuis la mise en ligne</span>
          </div>
        </div>

        <Card>
          <form className="adm-toolbar" method="get">
            <label className="adm-field adm-search">
              <span className="adm-field-label">Rechercher</span>
              <input
                className="adm-input"
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Nom, société, e-mail, téléphone ou contenu du message"
              />
            </label>

            <label className="adm-field">
              <span className="adm-field-label">Statut</span>
              <select className="adm-select" name="statut" defaultValue={status || "tous"}>
                {tabs.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="adm-field">
              <span className="adm-field-label">Service demandé</span>
              <select className="adm-select" name="service" defaultValue={service}>
                <option value="">Tous les services</option>
                {services.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <div className="adm-toolbar-actions">
              <button className="adm-btn adm-btn-primary" type="submit">
                <SlidersHorizontal size={15} /> Filtrer
              </button>
              <Link className="adm-btn adm-btn-ghost" href="/admin/messages">
                Réinitialiser
              </Link>
            </div>
          </form>

          {result.rows.length === 0 ? (
            <EmptyState
              icon={<Search size={24} />}
              title={counts.total === 0 ? "Aucune demande pour l’instant" : "Aucun résultat"}
              description={
                counts.total === 0
                  ? "Les messages envoyés depuis le formulaire de contact du site apparaîtront ici automatiquement."
                  : "Aucune demande ne correspond à ces critères. Élargissez la recherche ou changez de statut."
              }
            />
          ) : (
            <div className="adm-card-body-tight">
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Service demandé</th>
                      <th>Reçu</th>
                      <th>Statut</th>
                      <th className="adm-cell-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link className="adm-row-link adm-cell-strong" href={`/admin/messages/${row.id}`}>
                            {row.name}
                          </Link>
                          <span className="adm-cell-sub">
                            {row.company ? `${row.company} · ` : ""}
                            {row.email}
                          </span>
                        </td>
                        <td className="adm-cell-nowrap" style={{ color: "#54685c" }}>
                          {row.service}
                        </td>
                        <td className="adm-cell-nowrap">
                          <span style={{ color: "#54685c" }}>{formatDateTime(row.createdAt)}</span>
                          <span className="adm-cell-sub">{relativeAge(row.createdAt)}</span>
                        </td>
                        <td>
                          <span className={`adm-badge adm-badge-${row.status}`}>
                            {STATUS_LABELS[row.status as keyof typeof STATUS_LABELS] ?? row.status}
                          </span>
                        </td>
                        <td>
                          <div className="adm-row-actions">
                            <Link className="adm-btn adm-btn-sm" href={`/admin/messages/${row.id}`}>
                              Ouvrir
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="adm-pagination">
                <span>
                  {result.total} résultat{result.total > 1 ? "s" : ""} · page {result.page} sur {result.pageCount}
                  {result.total > PER_PAGE && " (20 par page)"}
                </span>
                <div className="adm-pagination-links">
                  {result.page > 1 && (
                    <Link className="adm-btn adm-btn-sm" href={`/admin/messages${buildQuery(baseQuery, { page: result.page - 1 })}`}>
                      Précédent
                    </Link>
                  )}
                  {result.page < result.pageCount && (
                    <Link className="adm-btn adm-btn-sm" href={`/admin/messages${buildQuery(baseQuery, { page: result.page + 1 })}`}>
                      Suivant
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        <p className="adm-drag-note">
          {MESSAGE_STATUSES.length} statuts disponibles · les archives restent consultables mais sont exclues de la vue « En cours ».
        </p>
      </div>
    </>
  );
}
