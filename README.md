# Phynyx Agent Command Center

Eigenständige Agenten-App für **Phynyx Trust Solutions** mit **Jarvis** als zentralem Orchestrator und einem spezialisierten operativen KI-Agententeam.

Diese App wird zunächst unabhängig von der bestehenden Friday-App entwickelt.
Friday bleibt unberührt und wird später optional über eine saubere Schnittstelle integriert.

---

## Ziel der App

Das **Phynyx Agent Command Center** ist ein eigenständiges Cockpit für operative KI-Agenten.

Die App soll helfen bei:

- Kundenanfragen
- Lead-Vorsortierung
- Angebotsvorbereitung
- Sales-Strategie
- Content- und Marketingplanung
- technischer Problemaufnahme
- System- und Prozesskonzeption
- Compliance- und Sicherheitsprüfung
- QA / Go-Live-Readiness
- späterer Friday-Integration
- späteren Integrationen mit Gmail, Google Calendar, Google Drive, Social Media, Telegram und Supabase

---

## Grundprinzip

**Jarvis führt. Das Agententeam unterstützt. Phynyx entscheidet.**

Alle Aufgaben laufen zuerst über Jarvis.

Jarvis erkennt den Auftrag, wählt passende Sub-Agenten aus, koordiniert die Bearbeitung, sammelt Ergebnisse, prüft Risiken und erstellt eine finale Antwort oder Entscheidungsvorlage.

Sensible, rechtliche, finanzielle, sicherheitskritische, reputationskritische oder externe Aktionen benötigen menschliche Freigabe.

---

## Agententeam

### Jarvis
**Rolle:** Chef-Assistent & Agententeam-Orchestrator  
**Zweck:** Koordination, Priorisierung, Delegation und Entscheidungsvorbereitung. Jarvis ist der zentrale Hauptagent.

### Nova
**Rolle:** Frontoffice / Kundenanfragen  
**Zweck:** Eingangssortierung, Lead-Erkennung und Anfrageklassifizierung.

### Jenny
**Rolle:** Recruiting, Teamstruktur, Agentenaufbau  
**Zweck:** Rollenarchitektur, Grenzen, Einsatzreife und Agentenaufbau.

### Atlas
**Rolle:** Konzept, Systemstruktur, Wissensmanagement  
**Zweck:** Prozessdesign, Systemlogik, Wissensstruktur und Umsetzungskonzepte.

### Lina
**Rolle:** Kommunikation  
**Zweck:** E-Mails, Angebote, Follow-ups, externe Kommunikation und Textausarbeitung.

### Soren
**Rolle:** Technical Issues / Technik-Leitung  
**Zweck:** Technischer Intake, Fehleraufnahme, Priorisierung und Routing.

### Orion
**Rolle:** Creative Director  
**Zweck:** Kreative Richtung, Stilwelt, Webkonzepte und Designbriefings.

### Elara
**Rolle:** Marketing Director  
**Zweck:** Marketingstrategie, Contentplanung, Social-Media-Logik und Kampagnenstruktur.

### Vega
**Rolle:** Sales & Closing Strategy  
**Zweck:** Sales-Strategie, Angebotsschärfe, Preisargumentation, Einwandbehandlung und Closing-Vorbereitung.

### Kira
**Rolle:** Legal & Compliance Watch  
**Zweck:** Datenschutz-, Compliance-, Lizenz-, Tool-, Tracking-, Content- und Veröffentlichungsrisiken markieren. Kira ersetzt keine Rechtsberatung.

### Nox
**Rolle:** Security, QA & Risk Watch  
**Zweck:** Sicherheitsprüfung, QA, Rollenrechte, API-Key-Schutz, Prompt-Risiken, Testabdeckung und Go-/No-Go-Empfehlungen.

### Milo
**Rolle:** Academy & Learning Architect  
**Zweck:** Lernpfade, Academy-Strukturen, Kurse, Schulungskonzepte und didaktische Systeme.

### Forge
**Rolle:** Code / Developer-Agent  
**Zweck:** Developer-Briefings, Codekonzepte, Refactoring-Vorschläge, Testpläne und technische Umsetzungsvorbereitung.

### Echo
**Rolle:** Voice / Friday Interface  
**Zweck:** Voice Commands, Sprachrouting, Interface-Logik und spätere Friday-Anbindung.

---

## Kernfunktionen im MVP

- eigenständige Web-App
- Dashboard
- Jarvis Chat
- Agententeam-Übersicht mit Agentenkarten
- Intent-Erkennung & Jarvis-Orchestrator
- Agenten-Routing
- Workflow Center
- Freigabezentrum
- Sales-/Angebotsbereich
- Content-/Marketingbereich
- Technik-/QA-Bereich
- lokale Mock-Daten
- vorbereitete Adapter für spätere Integrationen

---

## Hauptbereiche

```
Phynyx Agent Command Center
├── Dashboard
├── Jarvis Chat
├── Agententeam
├── Workflow Center
├── Freigabezentrum
├── Kunden / Leads
├── Angebote / Sales
├── Content / Marketing
├── Technik / QA
├── Einstellungen
└── Integrationen
```

---

## Workflow-Grundlogik

```
1. Anfrage kommt ins System
2. Jarvis erkennt den Intent
3. Jarvis wählt passende Agenten aus
4. Sub-Agenten bearbeiten ihre Fachbereiche
5. Sub-Agenten liefern strukturierte Ergebnisse zurück
6. Jarvis bündelt die Ergebnisse
7. Jarvis prüft Risiko und Freigabepflicht
8. Phynyx gibt kritische Aktionen frei
9. Ergebnis wird gespeichert, angezeigt oder vorbereitet
```

---

## Beispiel-Workflows

**Kundenanfrage**
```
Input:  "Jarvis, ich habe eine neue Kundenanfrage. Wer soll das übernehmen?"
Aktiviert: Nova · Vega · Lina
Output: Anfrageklassifizierung · Sales-Einschätzung · Kommunikationsvorschlag
```

**Angebot**
```
Input:  "Jarvis, erstelle mir eine Angebotsstruktur für einen KI-Chatbot."
Aktiviert: Vega · Lina · Kira · Nox
Output: Paketlogik · Preisargumentation · Angebotstext · Compliance-Hinweise · Risiko-Check
```

**Contentplanung**
```
Input:  "Jarvis, plane mir Content für nächste Woche über KI-Automatisierung."
Aktiviert: Elara · Orion · Lina · Vega · Kira · Nox
Output: Contentplan · Themencluster · Plattformideen · Captions · Sales-Winkel · Compliance-Hinweise
```

**Technisches Problem**
```
Input:  "Jarvis, ich habe ein technisches Problem mit einer API."
Aktiviert: Soren · Atlas · Nox · Forge
Output: Technical Intake Ticket · mögliche Ursache · Strukturvorschlag · QA-/Security-Hinweis · Developer-Briefing
```

---

## Freigaberegeln

**Automatisch erlaubt:** analysieren · sortieren · planen · Entwürfe erstellen · Agenten aktivieren · Zusammenfassungen erzeugen · Aufgaben anlegen · Mock-Daten verwenden

**Nur nach Freigabe:** E-Mails senden · Social Media posten · Kundentermine buchen · Angebote versenden · Preise zusagen · Kundendaten ändern · externe Systeme ansteuern · Friday integrieren

**Niemals:** Secrets hardcoden · `.env` committen · API Keys anzeigen · echte Kundendaten veröffentlichen · Rechtsberatung als verbindlich ausgeben · Friday-App verändern

---

## Tech Stack

| Bereich | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Sprache | TypeScript strict mode |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Daten (MVP) | lokale Mock-Daten |
| Datenbank (später) | Supabase |
| Hosting (später) | Vercel |

---

## Projektstruktur

```
src/
├── app/               — App Router pages
├── components/        — React-Komponenten
│   ├── layout/
│   ├── agents/
│   ├── jarvis/
│   ├── workflows/
│   └── approvals/
├── lib/
│   ├── agents/        — Registry · Orchestrator · Intent Router · Types
│   ├── mock-data/     — Lokale Testdaten
│   └── integrations/  — Adapter-Interfaces (Friday · Google · Social · Telegram)
└── docs/              — Produktdokumentation
```

---

## Spätere Integrationen

Friday-App · Gmail · Google Calendar · Google Drive · Supabase · Telegram · LinkedIn · Instagram · Facebook · TikTok · Social Media Scheduling · CRM · Angebotsautomatisierung · Voice-Steuerung über Echo

---

## Friday-Strategie

Friday bleibt zunächst vollständig unberührt. Diese App wird separat entwickelt und später integriert über API, gemeinsame Supabase-Datenbasis oder Adapter-Schicht.

---

## Lokale Entwicklung

```bash
cd phynyx-agent-cockpit
npm install
npm run dev
```

App läuft auf [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # Production Build
npx tsc --noEmit  # TypeScript Check
```

---

## Entwicklungsprinzipien

- modular bauen · zuerst MVP · keine unnötige Komplexität
- keine Live-Aktionen ohne Freigabe · keine Secrets im Repository
- kleine Commits · klare Dokumentation · GitHub regelmäßig aktuell
- Friday nicht verändern · Jarvis bleibt Orchestrator
- Sub-Agenten bleiben klar abgegrenzt

---

## Status

```
Phase:                MVP-Aufbau (Abschnitt 1 abgeschlossen)
Friday-Integration:   vorbereitet, noch nicht aktiv
Live-Integrationen:   deaktiviert
Freigabepflicht:      aktiv
Jarvis-Orchestrator:  in Entwicklung
Agent Registry:       14 Agenten angelegt
Intent Router:        17 Intents implementiert
```

---

## Projektregel

```
Jarvis führt.
Das Agententeam arbeitet operativ unter Jarvis.
Phynyx entscheidet.
```

---

*Phynyx Trust Solutions — STRATEGIE. UMSETZUNG. AUTOMATISIERUNG.*
