<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Phynyx Agent Command Center

Standalone Agenten-Cockpit für Phynyx Trust Solutions.
Jarvis ist der zentrale Orchestrator. 14 Sub-Agenten arbeiten unter Jarvis.

## Critical Rules

- `/Users/phynyxtrust/friday` darf NICHT verändert werden
- Keine Secrets hardcoden, kein `.env.local` committen
- Phynyx Brand System einhalten (Dark #0A0A0A, Red #CC1100, Gold #C9A84C)
- Freigabepflichtige Aktionen immer durch Approval-System schleusen
- Mock-Daten zuerst, Live-Integrationen erst später

## Tech Stack

- Next.js 16 App Router · TypeScript strict · Tailwind v4 · shadcn/ui · Lucide React
- Mock-Daten im MVP (kein Supabase live)

## Structure

```
src/
├── app/                  — App Router pages
├── components/
│   ├── layout/           — AppShell, Sidebar, Header
│   ├── agents/           — AgentCard, AgentGrid
│   ├── jarvis/           — JarvisChat, JarvisResponse
│   ├── workflows/        — WorkflowList, TaskCard
│   ├── approvals/        — ApprovalCard, ApprovalCenter
│   └── ui/               — shadcn/ui Komponenten
├── lib/
│   ├── agents/
│   │   ├── agent-types.ts         — TypeScript Typen
│   │   ├── agent-registry.ts      — Alle 14 Agenten
│   │   ├── jarvis-orchestrator.ts — Orchestrierungslogik
│   │   ├── intent-router.ts       — Intent-Erkennung + Routing
│   │   └── handoff-matrix.ts      — Routing-Matrix
│   ├── mock-data/        — Mock-Antworten pro Agent
│   └── integrations/     — Adapter-Interfaces (Friday, Google, Social)
└── docs/                 — Produktdokumentation
```
