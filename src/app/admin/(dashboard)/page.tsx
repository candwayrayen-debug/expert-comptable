import {
  ArrowUpRight, Database, FileText, Inbox, Info, Plus, TrendingDown, TrendingUp, Users,
} from "lucide-react";
import Link from "next/link";
import { importSettingsAction } from "@/app/admin/(dashboard)/reglages/actions";
import { Card, CardHead, EmptyState, Flash, PageHeader, type AdminSearchParams } from "@/components/admin/ui";
import { countByCollection, isContentSeeded } from "@/lib/content";
import { COLLECTIONS, COLLECTION_KEYS } from "@/lib/content-schema";
import { formatDateTime, relativeAge } from "@/lib/format";
import { countByStatus, countRecent, listMessages, serviceBreakdown, STATUS_LABELS } from "@/lib/messages";
import type { MessageStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const params = await searchParams;

  const [counts, recent, latest, breakdown, seeded, contentCounts] = await Promise.all([
    countByStatus().catch(() => ({ nouveau: 0, lu: 0, traite: 0, archive: 0, total: 0, actifs: 0 })),
    countRecent(7).catch(() => ({ current: 0, previous: 0 })),
    listMessages({ page: 1 }).catch(() => ({ rows: [], total: 0, page: 1, pageCount: 1 })),
    serviceBreakdown().catch(() => []),
    isContentSeeded().catch(() => false),
    countByCollection().catch(
      () =>
        Object.fromEntries(
          COLLECTION_KEYS.map((key) => [key, { total: 0, published: 0 }]),
        ) as Record<string, { total: number; published: number }>,
    ),
  ]);

  const publishedItems = COLLECTION_KEYS.reduce((total, key) => total + (contentCounts[key]?.published ?? 0), 0);
  const delta = recent.current - recent.previous;
  const maxBreakdown = Math.max(1, ...breakdown.map((row) => row.value));

  return (
    <>
      <PageHeader
        eyebrow="Tableau de bord"
        title="Bonjour, bienvenue dans votre espace"
        description="Un coup d’œil sur les demandes reçues et sur l’état du contenu publié sur le site."
        actions={
          <>
            <Link className="adm-btn" href="/admin/contenu">
              <FileText size={16} /> Gérer le contenu
            </Link>
            <Link className="adm-btn adm-btn-primary" href="/admin/messages">
              <Inbox size={16} /> Voir les demandes
            </Link>
          </>
        }
      />

      <div className="admin-content">
        <Flash params={params} />

        {!seeded && (
          <p className="adm-flash adm-flash-warn">
            <Info size={18} />
            <div className="adm-flash-body">
              <strong>Le contenu du site n’est pas encore importé en base</strong>
              La page publique affiche le contenu livré par défaut. Importez-le une fois pour
              pouvoir modifier les textes, l’équipe, les formules et les témoignages. Cette
              opération n’affecte pas les messages reçus.
              <div className="adm-flash-actions">
                <form action={importSettingsAction}>
                  <input type="hidden" name="from" value="contenu" />
                  <button className="adm-btn adm-btn-sm adm-btn-accent" type="submit">
                    <Database size={14} /> Importer le contenu par défaut
                  </button>
                </form>
              </div>
            </div>
          </p>
        )}

        <div className="adm-kpis">
          <div className={counts.nouveau > 0 ? "adm-kpi is-accent" : "adm-kpi"}>
            <span className="adm-kpi-label">
              <Inbox size={14} /> À traiter
            </span>
            <strong className="adm-kpi-value">{counts.nouveau}</strong>
            <span className="adm-kpi-hint">
              {counts.nouveau === 0 ? "aucune demande en attente" : "demande(s) jamais ouverte(s)"}
            </span>
          </div>

          <div className="adm-kpi">
            <span className="adm-kpi-label">
              {delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 7 derniers jours
            </span>
            <strong className="adm-kpi-value">{recent.current}</strong>
            <span className="adm-kpi-hint">
              {delta === 0
                ? "stable par rapport aux 7 jours précédents"
                : `${delta > 0 ? "+" : ""}${delta} par rapport aux 7 jours précédents`}
            </span>
          </div>

          <div className="adm-kpi">
            <span className="adm-kpi-label">Demandes traitées</span>
            <strong className="adm-kpi-value">{counts.traite}</strong>
            <span className="adm-kpi-hint">sur {counts.total} reçues au total</span>
          </div>

          <div className="adm-kpi">
            <span className="adm-kpi-label">
              <Users size={14} /> Contenu publié
            </span>
            <strong className="adm-kpi-value">{publishedItems}</strong>
            <span className="adm-kpi-hint">éléments visibles sur le site</span>
          </div>
        </div>

        <Card>
          <CardHead
            title="Dernières demandes"
            description="Les cinq messages les plus récents, toutes catégories confondues."
            actions={
              <Link className="adm-btn adm-btn-sm" href="/admin/messages">
                Tout voir <ArrowUpRight size={14} />
              </Link>
            }
          />
          {latest.rows.length === 0 ? (
            <EmptyState
              icon={<Inbox size={24} />}
              title="Aucune demande reçue"
              description="Les messages envoyés depuis le formulaire de contact du site s’afficheront ici, avec leur statut de traitement."
            />
          ) : (
            <div className="adm-card-body-tight">
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Service</th>
                      <th>Reçu</th>
                      <th>Statut</th>
                      <th className="adm-cell-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.rows.slice(0, 5).map((row) => (
                      <tr key={row.id}>
                        <td>
                          <Link className="adm-row-link adm-cell-strong" href={`/admin/messages/${row.id}`}>
                            {row.name}
                          </Link>
                          <span className="adm-cell-sub">{row.company ?? row.email}</span>
                        </td>
                        <td className="adm-cell-nowrap" style={{ color: "#54685c" }}>
                          {row.service}
                        </td>
                        <td className="adm-cell-nowrap">
                          <span style={{ color: "#54685c" }}>{relativeAge(row.createdAt)}</span>
                          <span className="adm-cell-sub">{formatDateTime(row.createdAt)}</span>
                        </td>
                        <td>
                          <span className={`adm-badge adm-badge-${row.status}`}>
                            {STATUS_LABELS[row.status as MessageStatus] ?? row.status}
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
            </div>
          )}
        </Card>

        <div className="adm-message-grid">
          <Card>
            <CardHead
              title="Demandes par expertise"
              description="Répartition des messages reçus selon le service choisi dans le formulaire."
            />
            <div className="adm-card-body">
              {breakdown.length === 0 ? (
                <p className="adm-field-hint" style={{ marginTop: 0 }}>
                  Aucune donnée à afficher tant qu’aucune demande n’a été reçue.
                </p>
              ) : (
                <div className="adm-bars">
                  {breakdown.map((row) => (
                    <div key={row.service}>
                      <div className="adm-bar-label">
                        <span>{row.service}</span>
                        <span>{row.value}</span>
                      </div>
                      <div className="adm-bar-track">
                        <div className="adm-bar-fill" style={{ width: `${(row.value / maxBreakdown) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHead title="Accès rapides" description="Modifier une section précise du site." />
            <div className="adm-card-body">
              <div className="adm-status-group">
                {COLLECTION_KEYS.map((key) => (
                  <Link key={key} className="adm-btn adm-btn-sm" href={`/admin/contenu/${key}`}>
                    <Plus size={13} />
                    {COLLECTIONS[key].label}
                  </Link>
                ))}
                <Link className="adm-btn adm-btn-sm" href="/admin/reglages">
                  Titres et coordonnées
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
