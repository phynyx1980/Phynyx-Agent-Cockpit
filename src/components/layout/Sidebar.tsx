"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  GitBranch,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Megaphone,
  Wrench,
  Settings,
  Plug,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Jarvis Chat", icon: MessageSquare },
  { href: "/agents", label: "Agententeam", icon: Users },
  { href: "/workflows", label: "Workflow Center", icon: GitBranch, badge: 3 },
  { href: "/approvals", label: "Freigaben", icon: ShieldCheck, badge: 2 },
  { href: "/leads", label: "Kunden / Leads", icon: UserCheck },
  { href: "/sales", label: "Angebote / Sales", icon: Briefcase },
  { href: "/content", label: "Content / Marketing", icon: Megaphone },
  { href: "/technical", label: "Technik / QA", icon: Wrench },
  { href: "/settings", label: "Einstellungen", icon: Settings },
  { href: "/integrations", label: "Integrationen", icon: Plug },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#111111] border-r border-[#2A2A2A] shrink-0">
      {/* Logo / Branding */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#2A2A2A]">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg text-white text-sm font-bold"
          style={{ background: "var(--gradient-phoenix)" }}
        >
          J
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#CC1100] truncate">
            Phynyx
          </p>
          <p className="text-[11px] text-[#999999] truncate">
            Agent Command Center
          </p>
        </div>
      </div>

      {/* Jarvis Status */}
      <div className="mx-3 my-3 px-3 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
          </span>
          <span className="text-xs font-medium text-white">Jarvis aktiv</span>
        </div>
        <p className="text-[11px] text-[#999999] mt-0.5 ml-4">
          14 Agenten bereit
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-[#CC1100]/10 text-white border border-[#CC1100]/20"
                  : "text-[#999999] hover:text-white hover:bg-[#1A1A1A]",
              ].join(" ")}
            >
              <Icon
                className={[
                  "w-4 h-4 shrink-0",
                  isActive ? "text-[#CC1100]" : "group-hover:text-[#CC1100]",
                ].join(" ")}
              />
              <span className="flex-1 truncate font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#CC1100] text-white text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <ChevronRight className="w-3 h-3 text-[#CC1100] shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#2A2A2A]">
        <p className="text-[10px] uppercase tracking-[0.15em] text-[#999999] font-medium">
          Phynyx Trust Solutions
        </p>
        <p className="text-[10px] text-[#2A2A2A] mt-0.5">MVP · Mock Mode</p>
      </div>
    </aside>
  );
}
