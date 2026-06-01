import { AppShell } from "@/components/layout/AppShell";
import { JarvisChat } from "@/components/jarvis/JarvisChat";

export default function JarvisChatPage() {
  return (
    <AppShell
      title="Jarvis Chat"
      subtitle="Zentraler Orchestrator — stelle Jarvis eine Aufgabe"
    >
      <JarvisChat />
    </AppShell>
  );
}
