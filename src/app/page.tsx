import { AppShell } from "@/components/layout/AppShell";
import { JarvisChatPlaceholder } from "@/components/jarvis/JarvisChatPlaceholder";

export default function JarvisChatPage() {
  return (
    <AppShell
      title="Jarvis Chat"
      subtitle="Zentraler Orchestrator — stelle Jarvis eine Aufgabe"
    >
      <JarvisChatPlaceholder />
    </AppShell>
  );
}
