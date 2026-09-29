import { ArrowLeft, Building2, Clock, Mail, Phone, Save, Trash2, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteMessageAction,
  saveNotesAction,
  setStatusAction,
} from "@/app/admin/(dashboard)/messages/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, CardHead, Flash, PageHeader, type AdminSearchParams } from "@/components/admin/ui";
import { formatDateTime, relativeAge } from "@/lib/format";
import { getMessage, STATUS_LABELS } from "@/lib/messages";
import { MESSAGE_STATUSES, type MessageStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

const STATUS_HELP: Record<MessageStatus, string> = {
  nouveau: "Jamais ouverte. À qualifier.",
  lu: "Prise en compte, réponse à venir.",
  traite: "Réponse apportée au client.",
  archive: "Sans suite, conservée pour l’historique.",
};

export default async function MessageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<AdminSearchParams>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const message = await getMessage(numericId);
  if (!message) notFound();

  const status = message.status as MessageStatus;
  const returnTo = `/admin/messages/${message.id}`;

  return (
    <>
      <PageHeader
        eyebrow={`Demande n°${message.id} · ${STATUS_LABELS[status] ?? status}`}
        title={message.name}
        description={`Reçue ${relativeAge(message.createdAt)}, le ${formatDateTime(message.createdAt)}.`}
        actions={
          <>
            <Link className="adm-btn" href="/admin/messages">
              <ArrowLeft size={15} /> Toutes les demandes
            </Link>
            <a
              className="adm-btn adm-btn-primary"
              href={`mailto:${message.email}?subject=${encodeURIComponent(`Votre demande — Cabinet Ben Salem`)}`}
            >
              <Mail size={15} /> Répondre par e-mail
            </a>
          </>
        }
      />

      <div className="admin-content">
        <Flash params={query} />

        <div className="adm-message-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card>
              <CardHead
                title="Message reçu"
                actions={<span className={`adm-badge adm-badge-${status}`}>{STATUS_LABELS[status] ?? status}</span>}
              />
              <div className="adm-card-body">
                <p className="adm-message-body">{message.message}</p>
              </div>
            </Card>

            <Card>
              <CardHead
                title="Note interne"
                description="Visible uniquement depuis cette administration, jamais par le client."
              />
              <div className="adm-card-body">
                <form className="adm-form" action={saveNotesAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <label className="adm-field">
                    <span className="adm-field-label">Suivi de la relation client</span>
                    <textarea
                      className="adm-textarea"
                      name="notes"
                      rows={5}
                      defaultValue={message.notes ?? ""}
                      maxLength={4000}
                      placeholder="Ex. : rappel téléphonique effectué le 12, devis envoyé, relance prévue lundi…"
                    />
                    <span className="adm-field-hint">
                      Notes privées : elles n’apparaissent ni sur le site ni dans l’e-mail de réponse.
                    </span>
                  </label>
                  <div className="adm-form-actions" style={{ paddingTop: 14 }}>
                    <button className="adm-btn adm-btn-primary" type="submit">
                      <Save size={15} /> Enregistrer la note
                    </button>
                  </div>
                </form>
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card>
              <CardHead title="Traitement" description="Faites avancer la demande au fil de vos échanges." />
              <div className="adm-card-body">
                <div className="adm-status-group">
                  {MESSAGE_STATUSES.map((value) => (
                    <form key={value} action={setStatusAction}>
                      <input type="hidden" name="id" value={message.id} />
                      <input type="hidden" name="status" value={value} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <button
                        className={value === status ? "adm-btn adm-btn-sm adm-btn-primary" : "adm-btn adm-btn-sm"}
                        type="submit"
                        disabled={value === status}
                        title={STATUS_HELP[value]}
                      >
                        {STATUS_LABELS[value]}
                      </button>
                    </form>
                  ))}
                </div>
                <p className="adm-field-hint" style={{ marginTop: 14 }}>
                  {STATUS_HELP[status]}
                  {message.handledAt && ` Traitée le ${formatDateTime(message.handledAt)}.`}
                </p>
              </div>
            </Card>

            <Card>
              <CardHead title="Coordonnées" />
              <div className="adm-card-body">
                <div className="adm-meta-list">
                  <div className="adm-meta-item">
                    <span className="adm-meta-icon">
                      <User size={16} />
                    </span>
                    <div>
                      <strong>{message.name}</strong>
                      <small>{message.company ?? "Particulier / société non précisée"}</small>
                    </div>
                  </div>
                  <div className="adm-meta-item">
                    <span className="adm-meta-icon">
                      <Mail size={16} />
                    </span>
                    <div>
                      <strong>
                        <a href={`mailto:${message.email}`}>{message.email}</a>
                      </strong>
                      <small>E-mail de contact</small>
                    </div>
                  </div>
                  <div className="adm-meta-item">
                    <span className="adm-meta-icon">
                      <Phone size={16} />
                    </span>
                    <div>
                      <strong>{message.phone ? <a href={`tel:${message.phone.replace(/[^\d+]/g, "")}`}>{message.phone}</a> : "Non renseigné"}</strong>
                      <small>Téléphone</small>
                    </div>
                  </div>
                  <div className="adm-meta-item">
                    <span className="adm-meta-icon">
                      <Building2 size={16} />
                    </span>
                    <div>
                      <strong>{message.service}</strong>
                      <small>Service demandé via le formulaire</small>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHead title="Métadonnées" />
              <div className="adm-card-body">
                <dl className="adm-dl">
                  <div>
                    <dt>Reçue le</dt>
                    <dd>{formatDateTime(message.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Statut</dt>
                    <dd>{STATUS_LABELS[status] ?? status}</dd>
                  </div>
                  <div>
                    <dt>Traitée le</dt>
                    <dd>{message.handledAt ? formatDateTime(message.handledAt) : "—"}</dd>
                  </div>
                  <div>
                    <dt>Identifiant</dt>
                    <dd>#{message.id}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            <Card>
              <CardHead
                title="Suppression"
                description="Action définitive : la demande et sa note interne sont effacées de la base."
              />
              <div className="adm-card-body">
                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <ConfirmButton
                    className="adm-btn adm-btn-danger"
                    message={`Supprimer définitivement la demande de ${message.name} ? Cette action est irréversible.`}
                  >
                    <Trash2 size={15} /> Supprimer cette demande
                  </ConfirmButton>
                </form>
              </div>
            </Card>

            <p className="adm-drag-note">
              <Clock size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
              Les données transmises par le formulaire sont couvertes par la politique de confidentialité du site.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
