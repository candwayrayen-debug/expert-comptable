"use client";

import { FileText, Inbox, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

export type SidebarCollection = { key: string; label: string; count: number };

type Props = {
  unread: number;
  collections: SidebarCollection[];
  seeded: boolean;
};

const MAIN_LINKS = [
  { href: "/admin", label: "Tableau de bord", Icon: LayoutDashboard },
  { href: "/admin/messages", label: "Demandes", Icon: Inbox },
  { href: "/admin/contenu", label: "Contenu du site", Icon: FileText },
  { href: "/admin/reglages", label: "Réglages", Icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ unread, collections, seeded }: Props) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand">
        <span className="admin-brand-mark" aria-hidden="true">
          <span className="admin-brand-bar admin-brand-bar-1" />
          <span className="admin-brand-bar admin-brand-bar-2" />
          <span className="admin-brand-bar admin-brand-bar-3" />
        </span>
        <span className="admin-brand-text">
          <span className="admin-brand-word">Cabinet Ben Salem</span>
          <span className="admin-brand-sub">ADMINISTRATION</span>
        </span>
      </Link>

      <nav className="admin-nav" aria-label="Navigation de l’administration">
        {MAIN_LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={isActive(pathname, href) ? "admin-nav-link is-active" : "admin-nav-link"}
          >
            <Icon size={17} strokeWidth={1.9} />
            {label}
            {href === "/admin/messages" && unread > 0 && <span className="admin-nav-count">{unread}</span>}
          </Link>
        ))}
      </nav>

      <div className="admin-nav">
        <p className="admin-nav-heading">Contenu</p>
        {collections.map((collection) => {
          const href = `/admin/contenu/${collection.key}`;
          return (
            <Link
              key={collection.key}
              href={href}
              className={isActive(pathname, href) ? "admin-nav-link is-active" : "admin-nav-link"}
            >
              {collection.label}
              <span className="admin-nav-count" style={{ background: "rgba(216,237,153,.22)", color: "#d8ed99" }}>
                {collection.count}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="admin-sidebar-foot">
        <span className="admin-sidebar-user">
          {seeded ? "Contenu publié depuis la base" : "Contenu par défaut (non importé)"}
        </span>
        <form action={logoutAction}>
          <button className="admin-logout" type="submit">
            <LogOut size={15} /> Se déconnecter
          </button>
        </form>
        <Link
          href="/"
          style={{ textAlign: "center", color: "#8fae97", fontSize: 11.5, paddingBottom: 4 }}
          target="_blank"
        >
          Voir le site public ↗
        </Link>
      </div>
    </aside>
  );
}
