import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  agents: string[];
}

export function ComingSoon({ title, description, agents }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "var(--gradient-dark)", border: "1px solid #2A2A2A" }}
      >
        <Construction className="w-7 h-7 text-[#CC1100]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-[0.1em]">
        {title}
      </h2>
      <p className="text-sm text-[#999999] max-w-sm mb-6">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-[#999999]">Beteiligte Agenten:</span>
        {agents.map((a) => (
          <span
            key={a}
            className="px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#C9A84C] font-medium"
          >
            {a}
          </span>
        ))}
      </div>
      <p className="mt-8 text-xs text-[#2A2A2A] uppercase tracking-[0.15em]">
        Kommt in Abschnitt 3–10
      </p>
    </div>
  );
}
