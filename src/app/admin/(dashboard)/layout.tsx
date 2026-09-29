import type { ReactNode } from "react";
import { AdminSidebar, type SidebarCollection } from "@/components/admin/admin-sidebar";
import { COLLECTION_KEYS, COLLECTIONS } from "@/lib/content-schema";
import { countByCollection, isContentSeeded } from "@/lib/content";
import { requireAdmin } from "@/lib/auth";
import { countByStatus } from "@/lib/messages";

// L'administration doit toujours refléter l'état réel de la base.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  // Ces requêtes ne doivent jamais empêcher l'affichage : une base injoignable
  // dégrade la navigation (compteurs à zéro) plutôt que de casser la page.
  let unread = 0;
  try {
    unread = (await countByStatus()).nouveau;
  } catch (error) {
    console.error("Comptage des messages impossible", error);
  }

  let seeded = false;
  let counts = Object.fromEntries(
    COLLECTION_KEYS.map((key) => [key, { total: 0, published: 0 }]),
  ) as Record<string, { total: number; published: number }>;

  try {
    seeded = await isContentSeeded();
    counts = await countByCollection();
  } catch (error) {
    console.error("Comptage du contenu impossible", error);
  }

  const collections: SidebarCollection[] = COLLECTION_KEYS.map((key) => ({
    key,
    label: COLLECTIONS[key].label,
    count: counts[key]?.published ?? 0,
  }));

  return (
    <div className="admin-shell">
      <AdminSidebar unread={unread} collections={collections} seeded={seeded} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
