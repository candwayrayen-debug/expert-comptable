import { requireAdmin } from "@/lib/auth";
import { csvCell, formatDateTime } from "@/lib/format";
import { isStatus, listMessagesForExport, STATUS_LABELS } from "@/lib/messages";
import type { MessageStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Export CSV des demandes, en respectant les filtres de la liste.
 * Le séparateur est le point-virgule et le fichier commence par un BOM :
 * c'est ce qu'attend Excel en configuration francophone pour ouvrir le
 * fichier directement, accents compris.
 */
export async function GET(request: Request) {
  await requireAdmin();

  const url = new URL(request.url);
  const rawStatus = url.searchParams.get("statut") ?? "";
  const status = isStatus(rawStatus) ? rawStatus : undefined;

  const rows = await listMessagesForExport({
    q: url.searchParams.get("q") ?? "",
    service: url.searchParams.get("service") ?? "",
    status,
  });

  const header = [
    "Identifiant",
    "Reçue le",
    "Statut",
    "Nom",
    "Société",
    "E-mail",
    "Téléphone",
    "Service demandé",
    "Message",
    "Note interne",
    "Traitée le",
  ];

  const lines = [header.map(csvCell).join(";")];

  for (const row of rows) {
    lines.push(
      [
        row.id,
        formatDateTime(row.createdAt),
        STATUS_LABELS[row.status as MessageStatus] ?? row.status,
        row.name,
        row.company ?? "",
        row.email,
        row.phone ?? "",
        row.service,
        row.message,
        row.notes ?? "",
        row.handledAt ? formatDateTime(row.handledAt) : "",
      ]
        .map(csvCell)
        .join(";"),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const body = `\uFEFF${lines.join("\r\n")}`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="demandes-cabinet-ben-salem-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
