import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-[#111111] border-b border-[#2A2A2A] shrink-0">
      <div>
        <h1 className="text-base font-semibold text-white uppercase tracking-[0.12em]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#999999] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Suchfeld */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-[#999999]" />
          <input
            type="text"
            placeholder="Jarvis fragen..."
            className="w-48 lg:w-64 pl-8 pr-4 py-2 text-xs bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#999999] focus:outline-none focus:border-[#CC1100]/50 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#999999] hover:text-white hover:border-[#CC1100]/30 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#CC1100]" />
        </button>

        {/* User Avatar */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg text-white text-xs font-bold cursor-pointer"
          style={{ background: "var(--gradient-phoenix)" }}
          title="Philip Trost"
        >
          PT
        </div>
      </div>
    </header>
  );
}
