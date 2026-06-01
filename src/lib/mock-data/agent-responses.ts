import type { Intent } from "@/lib/agents/agent-types";

export interface MockAgentResponse {
  summary: string;
  details: string;
  suggestedActions: string[];
  risks: string[];
}

type MockResponseMap = Partial<Record<string, MockAgentResponse>>;
type IntentMockMap = Partial<Record<Intent, MockResponseMap>>;

export const MOCK_RESPONSES: IntentMockMap = {
  customer_inquiry: {
    nova: {
      summary: "Kundenanfrage klassifiziert: KI-Dienstleistung, mittlere Priorität",
      details:
        "Die Anfrage handelt von KI-Automatisierung für ein österreichisches KMU. Typ: Erstanfrage. Potenzial: mittel-hoch. Empfehlung: Sales-Gespräch innerhalb 48h.",
      suggestedActions: [
        "Sales-Gespräch mit Vega vorbereiten",
        "Antwortmail über Lina formulieren",
        "Lead in CRM anlegen",
      ],
      risks: [],
    },
    vega: {
      summary: "Sales-Einschätzung: Qualifizierter Lead — Abschlusswahrscheinlichkeit 65%",
      details:
        "Lead zeigt klares Problem-Bewusstsein (Zeitaufwand bei repetitiven Aufgaben). Budget wurde nicht genannt — Discovery-Gespräch nötig. Empfohlenes Einstiegsangebot: Automatisierungs-Paket S (2.500–4.500 EUR).",
      suggestedActions: [
        "Discovery-Call mit ROI-Framing vorbereiten",
        "Einwand 'zu teuer' bereits antizipieren",
        "Referenzfall aus ähnlicher Branche vorbereiten",
      ],
      risks: ["Kein Budget-Signal — Preissensibilität ungeklärt"],
    },
    lina: {
      summary: "Antwortmail-Entwurf erstellt — professionell, warm, handlungsauslösend",
      details:
        'Betreff: "Ihre Anfrage bei Phynyx Trust Solutions"\n\nEntwurf:\n\nVielen Dank für Ihre Anfrage! Wir freuen uns über Ihr Interesse an unseren KI-Lösungen.\n\nGerne würden wir mehr über Ihre Herausforderungen erfahren und zeigen, wie wir konkret helfen können. Darf ich Ihnen einen kurzen 20-Minuten-Call vorschlagen?\n\nMit freundlichen Grüßen,\nPhilip Trost\nPhynyx Trust Solutions',
      suggestedActions: [
        "Mail-Entwurf prüfen und anpassen",
        "Termin-Link einfügen (Calendly o.ä.)",
        "Nach Freigabe versenden",
      ],
      risks: ["Mail darf erst nach Freigabe versendet werden"],
    },
  },

  create_offer: {
    vega: {
      summary: "Angebotsstruktur KI-Chatbot: 3 Pakete, 1.500–8.500 EUR",
      details:
        "Paket S — KI-Chatbot Basic (1.500–2.500 EUR): FAQ-Beantwortung, Websiteintegration, 30 Tage Support.\n\nPaket M — KI-Chatbot Pro (3.500–5.500 EUR): + CRM-Anbindung, Leadqualifizierung, Mehrsprachigkeit, 90 Tage Support.\n\nPaket L — KI-Chatbot Enterprise (6.500–8.500 EUR): + individuelle Flows, API-Integrationen, Analyse-Dashboard, 6 Monate Support.",
      suggestedActions: [
        "Paketlogik mit Kunden abstimmen",
        "Angebotstext über Lina formulieren lassen",
        "Kira und Nox für Compliance-Check aktivieren",
      ],
      risks: ["Preise ohne Budget-Kenntnis — Discovery zuerst empfohlen"],
    },
    lina: {
      summary: "Angebotstext formuliert — klar, überzeugend, auf Nutzen fokussiert",
      details:
        "Angebotseröffnung: Nutzen-Statement mit konkretem ROI-Bezug.\nLeistungsbeschreibung: technisch präzise, aber verständlich.\nPreisdarstellung: Investitions-Framing statt Kostendenken.\nNächster Schritt: klarer Call-to-Action mit Frist.",
      suggestedActions: [
        "Angebotstext im PDF-Format erstellen",
        "Unterschrift und Gültigkeitsdatum einfügen",
        "Nur nach Freigabe versenden",
      ],
      risks: ["Verbindlicher Versand nur nach expliziter Freigabe durch Philip"],
    },
    kira: {
      summary: "Compliance-Check: 1 Hinweis — kein kritisches Risiko",
      details:
        "Impressum und AGB müssen im Angebotsbegleitschreiben referenziert sein. Widerrufsrecht bei Verbrauchern prüfen (B2B vs. B2C). Preisangaben korrekt inkl. USt.-Hinweis (AT: 20%).",
      suggestedActions: [
        "AGB-Verweis im Angebotsschreiben ergänzen",
        "USt.-Ausweis prüfen",
        "B2B/B2C-Status des Kunden klären",
      ],
      risks: ["Fehlender AGB-Hinweis — Gelbes Risiko"],
    },
    nox: {
      summary: "QA-Check: Angebot strukturell korrekt — 0 kritische Findings",
      details:
        "Preisangaben vollständig. Leistungsumfang klar abgegrenzt. Kein technisches Versprechen ohne Grundlage. Keine API-Key-Erwähnungen. Mock-Modus aktiv — kein Live-Versand möglich.",
      suggestedActions: ["Angebot kann nach Freigabe versendet werden"],
      risks: [],
    },
  },

  plan_content: {
    elara: {
      summary: "Contentplan erstellt: 5 Beiträge, 7 Tage, LinkedIn + Instagram",
      details:
        "Mo: Was ist KI-Automatisierung? (Aufklärungs-Post) · Di: Case Study — 3h/Woche gespart (Story-Format) · Mi: Tool-Spotlight n8n (Karussel) · Do: Mythos vs. Realität KI (Poll) · Fr: Behind the Scenes bei Phynyx (Authentizität). Reichweiten-Ziel: +15% in 7 Tagen.",
      suggestedActions: [
        "Captions über Lina formulieren lassen",
        "Grafiken über Orion briefen",
        "Compliance-Check durch Kira",
        "Freigabe vor Posting einholen",
      ],
      risks: ["Kein Live-Posting ohne Freigabe"],
    },
    orion: {
      summary: "Kreativrichtung definiert: Dunkel-Premium, Daten-Visualisierungen, Phönix-Energie",
      details:
        "Farbwelt: Schwarz + Phynyx-Rot + Gold. Typografie: bold headlines, sachliche Bodytexte. Bildsprache: technisch, aber menschlich. Icons: abstrakte Automatisierungs-Metaphern. Kein Stock-Foto-Feeling.",
      suggestedActions: [
        "Canva-Templates auf Phynyx Brand anpassen",
        "Einheitliche Slide-Struktur für alle Posts",
      ],
      risks: [],
    },
    lina: {
      summary: "5 Caption-Entwürfe fertig — hooksintensiv, auf Engagement optimiert",
      details:
        "Hook-Formeln: Frage, Überraschungsstatement, Provokation. Jeder Post endet mit klarem CTA. Hashtag-Sets vorbereitet: 15–20 pro Post, Mix aus Nischen und Reichweiten-Tags. Angepasst an AT/DE-Zielgruppe.",
      suggestedActions: [
        "Captions finalisieren und in Planung eintragen",
        "A/B-Test mit zwei Hook-Varianten möglich",
      ],
      risks: [],
    },
    kira: {
      summary: "Content-Compliance: 2 Hinweise — keine kritischen Risiken",
      details:
        "Werbehinweis bei gesponsertem Content notwendig. Bildrechte prüfen — keine Fremdbilder ohne Lizenz. Claims wie 'spart garantiert Zeit' vermeiden — zu absolut.",
      suggestedActions: [
        "Werbehinweis bei gesponserten Posts ergänzen",
        "Claims abschwächen: 'kann sparen' statt 'spart garantiert'",
      ],
      risks: ["Absolute Claims — Gelbes Risiko"],
    },
    vega: {
      summary: "Sales-Winkel identifiziert: Content als Lead-Gen-Instrument nutzen",
      details:
        "Post Di (Case Study) und Mi (Tool-Spotlight) haben höchstes Lead-Gen-Potenzial. CTA für kostenlose Erstberatung einbauen. Lead-Magnet (KI Playbook) in Story-Link platzieren.",
      suggestedActions: [
        "Lead-Magnet-Link in Stories verlinken",
        "DM-Funnel bei Interesse-Signalen vorbereiten",
      ],
      risks: [],
    },
    nox: {
      summary: "QA-Check Content: kein Sicherheitsrisiko — Standard-Freigabeprozess",
      details:
        "Keine internen Infos in Entwürfen enthalten. Keine Kundendaten sichtbar. Kein Versprechen, das nicht gehalten werden kann. Mock-Modus: kein Auto-Posting.",
      suggestedActions: ["Content kann nach Freigabe live gehen"],
      risks: [],
    },
  },

  technical_issue: {
    soren: {
      summary: "Technical Intake Ticket erstellt — Prio 2 (Hoch)",
      details:
        "Issue-Typ: API-Fehler. Symptom: unbekannt — Details fehlen noch. Empfohlene nächste Schritte: Fehlermeldung / Stack Trace anfragen, betroffene Umgebung klären (Dev/Prod), letzte Änderung vor dem Fehler identifizieren.",
      suggestedActions: [
        "Stack Trace und Fehlermeldung bereitstellen",
        "Umgebung (Dev/Staging/Prod) nennen",
        "Atlas und Nox für Analyse aktiviert",
      ],
      risks: ["Produktionsproblem bis zur Klärung unklar"],
    },
    atlas: {
      summary: "Strukturanalyse: 3 häufige API-Fehlerursachen identifiziert",
      details:
        "1. Auth-Token abgelaufen oder fehlerhafte Header-Konfiguration.\n2. Rate Limiting — zu viele Requests in kurzer Zeit.\n3. Breaking Change im API-Endpoint (Versionierung prüfen).\n\nEmpfehlung: Logs prüfen, HTTP Status Code klären (401/429/404).",
      suggestedActions: [
        "HTTP-Statuscode des Fehlers nennen",
        "API-Dokumentation auf Breaking Changes prüfen",
        "Retry-Logik bei 429 implementieren",
      ],
      risks: ["Unbekannter Scope — Priorisierung nach Statuscode"],
    },
    nox: {
      summary: "Security-Check: API-Key-Handling prüfen — 1 potenzieller Risk",
      details:
        "Risiko: API-Keys möglicherweise nicht sicher gespeichert oder in Logs sichtbar. Empfehlung: Keys nur in .env.local, nie im Code. Kein Key-Logging in Produktionsumgebung.",
      suggestedActions: [
        "API-Key aus Code entfernen falls vorhanden",
        "In .env.local auslagern",
        "Git-History auf Key-Leaks prüfen",
      ],
      risks: ["Möglicher API-Key im Code — Rotes Risiko prüfen"],
    },
    forge: {
      summary: "Developer-Briefing: Debugging-Plan für API-Issue vorbereitet",
      details:
        "Schritt 1: Isolationstest — API direkt mit curl/Postman testen.\nSchritt 2: Middleware-Layer ausschließen.\nSchritt 3: Request/Response-Logging aktivieren.\nSchritt 4: Fehler reproduzieren in Dev-Umgebung.\n\nClaude-Code-Prompt für Debugging vorbereitet.",
      suggestedActions: [
        "curl-Test gegen API-Endpoint ausführen",
        "Dev-Environment isolieren",
        "Logging temporär aktivieren",
      ],
      risks: [],
    },
  },

  security_qa_check: {
    nox: {
      summary: "QA & Security Report: 3 Findings — 1 kritisch, 2 niedrig",
      details:
        "KRITISCH: RLS in Supabase nicht für alle Tabellen aktiviert.\nNIEDRIG: Fehlende Input-Validierung bei einem API-Endpoint.\nNIEDRIG: Keine Rate-Limiting-Konfiguration.\n\nGo-/No-Go: NO GO bis RLS-Issue behoben.",
      suggestedActions: [
        "RLS sofort für alle Supabase-Tabellen aktivieren",
        "Zod-Validierung für alle Endpunkte ergänzen",
        "Rate Limiting konfigurieren (Vercel Edge)",
      ],
      risks: ["RLS fehlt — Datenleck-Risiko KRITISCH"],
    },
    kira: {
      summary: "Compliance-Check: 2 DSGVO-Hinweise — kein kritisches Risiko",
      details:
        "Datenschutzerklärung muss Supabase als Auftragsverarbeiter nennen. Cookie-Banner für Analytics erforderlich (sofern Plausible/GA im Einsatz). Hosting-Region EU bestätigen.",
      suggestedActions: [
        "Datenschutzerklärung um Supabase ergänzen",
        "Hosting-Region auf EU prüfen",
        "Cookie-Einwilligung klären",
      ],
      risks: ["Fehlende AVV-Nennung — Gelbes Risiko"],
    },
    atlas: {
      summary: "Systemstruktur-Check: Architektur grundsätzlich sauber",
      details:
        "Modulstruktur klar getrennt. Keine zirkulären Abhängigkeiten erkannt. API-Layer von UI-Layer sauber entkoppelt. Empfehlung: Fehler-Handling in allen API-Routen standardisieren.",
      suggestedActions: [
        "Standardisiertes Error-Response-Schema definieren",
        "Alle API-Routen auf einheitliches Logging prüfen",
      ],
      risks: [],
    },
    soren: {
      summary: "Technical Intake: Security-Issue als Prio 1 eingestuft",
      details: "RLS-Problem wurde eskaliert. Kein Go-Live bis zur Behebung. Ticket an Forge und Atlas zur Behebung übergeben.",
      suggestedActions: ["RLS-Fix priorisieren", "Re-Check nach Fix durch Nox"],
      risks: ["Go-Live blockiert bis RLS-Fix"],
    },
  },

  developer_briefing: {
    forge: {
      summary: "Developer-Briefing für Claude Code erstellt — vollständig, direkt einsetzbar",
      details:
        "Briefing-Struktur:\n1. Kontext: Was soll gebaut werden?\n2. Tech Stack: Next.js 16, TypeScript, Tailwind v4, Supabase\n3. Aufgabe: konkret und testbar formuliert\n4. Grenzen: was darf nicht geändert werden?\n5. Erwarteter Output: Dateipfade, Funktionen, Tests\n6. Qualitätskriterien: tsc + build müssen grün sein\n\nClaude-Code-Prompt-Template vorbereitet.",
      suggestedActions: [
        "Briefing an Claude Code übergeben",
        "Nach Umsetzung Nox-QA-Check anstoßen",
        "Kein Deploy ohne Freigabe",
      ],
      risks: [],
    },
    soren: {
      summary: "Technischer Kontext validiert — Setup korrekt für Umsetzung",
      details:
        "Abhängigkeiten geprüft. Keine Konflikte im Package-Setup. TypeScript strict mode aktiv. Dev-Server startet fehlerfrei.",
      suggestedActions: ["Umsetzung kann starten"],
      risks: [],
    },
    atlas: {
      summary: "Architekturkontext bereitgestellt — Komponentenstruktur dokumentiert",
      details:
        "Relevante Komponenten und Dateipfade für das Briefing identifiziert. Abhängigkeiten und Datenflüsse dokumentiert. Schnittstellen definiert.",
      suggestedActions: ["Komponentenstruktur im Briefing referenzieren"],
      risks: [],
    },
    nox: {
      summary: "Pre-Implementation-Check: Keine Blocker — grünes Licht",
      details:
        "Kein offenes Security-Issue im betroffenen Bereich. Keine ungelösten TypeScript-Fehler. Mock-Modus aktiv — kein Live-Risiko.",
      suggestedActions: ["Umsetzung starten"],
      risks: [],
    },
  },

  voice_interface: {
    echo: {
      summary: "Voice-Konzept für Friday-Integration vorbereitet",
      details:
        "Phase 1: Wake-Word-Erkennung (lokal oder API-basiert).\nPhase 2: Intent-Erkennung über STT (Whisper).\nPhase 3: Jarvis-Routing der erkannten Intents.\nPhase 4: TTS-Antwort (ElevenLabs oder OpenAI TTS).\nPhase 5: Friday-Integration über saubere API-Schicht.\n\nWichtig: Friday bleibt unberührt bis zur Freigabe.",
      suggestedActions: [
        "Voice-Konzept mit Atlas auf Machbarkeit prüfen",
        "Soren für technischen Intake aktivieren",
        "Friday-Integration erst nach Freigabe",
      ],
      risks: ["Friday-Integration freigabepflichtig — noch nicht aktiv"],
    },
    atlas: {
      summary: "Systemkonzept Voice-Layer definiert",
      details:
        "Voice-Adapter als eigenständiges Modul. Jarvis als zentraler Intent-Empfänger. Keine direkte Friday-Kopplung im MVP. Schnittstelle: REST-API oder WebSocket.",
      suggestedActions: [
        "Voice-Adapter-Interface in src/lib/integrations/friday/ anlegen",
        "Mock-Implementierung für Tests",
      ],
      risks: [],
    },
    soren: {
      summary: "Technical Intake: Voice-Modul eingeplant — Prio 3",
      details: "Kein akutes technisches Problem. Voice-Integration wird vorbereitet, aber nicht sofort umgesetzt.",
      suggestedActions: ["Voice-Konzept als Roadmap-Item anlegen"],
      risks: [],
    },
  },

  show_agents: {
    jarvis: {
      summary: "Agententeam-Übersicht bereitgestellt",
      details:
        "14 Agenten aktiv: Jarvis (Orchestrator) · Nova (Frontoffice) · Jenny (Teamstruktur) · Atlas (Systemkonzept) · Lina (Kommunikation) · Soren (Technik) · Orion (Kreativ) · Elara (Marketing) · Vega (Sales) · Kira (Legal) · Nox (Security) · Milo (Academy, Standby) · Forge (Developer, Standby) · Echo (Voice, Standby).",
      suggestedActions: ["Zum Agententeam navigieren für vollständige Karten"],
      risks: [],
    },
  },

  show_approvals: {
    jarvis: {
      summary: "2 offene Freigaben — 1 kritisch",
      details:
        "1. KRITISCH: Angebotsversand KI-Chatbot (Vega/Lina) — Verbindliche Preiszusage.\n2. MITTEL: Social-Media-Post KI-Automatisierung (Elara/Lina) — Veröffentlichung.",
      suggestedActions: ["Zum Freigabezentrum navigieren"],
      risks: ["1 kritische Freigabe ausstehend"],
    },
  },

  show_tasks: {
    jarvis: {
      summary: "3 offene Tasks — 2 in Bearbeitung, 1 wartend",
      details:
        "1. IN BEARBEITUNG: Kundenanfrage KMU Wien (Nova/Vega/Lina)\n2. IN BEARBEITUNG: Content-Plan KI-Automatisierung (Elara/Orion/Lina)\n3. WARTEND: API-Problem Webhook (Soren/Atlas/Nox/Forge)",
      suggestedActions: ["Zum Workflow Center navigieren"],
      risks: [],
    },
  },

  general_question: {
    jarvis: {
      summary: "Antwort vorbereitet",
      details:
        "Ich bin Jarvis, dein zentraler KI-Assistent und Agenten-Orchestrator bei Phynyx Trust Solutions. Ich koordiniere das 14-köpfige Agententeam und helfe dir bei Kundenanfragen, Angeboten, Content, Technik, Sales, Compliance und mehr. Stelle mir eine konkrete Aufgabe — ich entscheide, welche Agenten am besten helfen.",
      suggestedActions: [
        "Sage mir, was du brauchst",
        "Beispiel: 'Erstelle ein Angebot für einen KI-Chatbot'",
        "Oder: 'Plane Content für nächste Woche'",
      ],
      risks: [],
    },
  },

  compliance_check: {
    kira: {
      summary: "Compliance-Check abgeschlossen: 2 Hinweise — kein kritisches Risiko",
      details:
        "Datenschutz: Datenverarbeitung dokumentiert, AVV-Pflicht prüfen. Impressum: vollständig. AGB: vorhanden, letzte Prüfung >6 Monate. Cookie: Plausible keine Einwilligung nötig.",
      suggestedActions: [
        "AVV mit Supabase prüfen",
        "AGB auf Aktualität prüfen lassen",
      ],
      risks: ["AVV-Prüfung ausstehend — Gelbes Risiko"],
    },
    nox: {
      summary: "Security-Aspekte der Compliance geprüft — keine kritischen Findings",
      details: "API-Zugangsschutz aktiv. Keine sensiblen Daten in Logs. RLS in Supabase empfohlen.",
      suggestedActions: ["RLS für alle Supabase-Tabellen aktivieren"],
      risks: ["RLS ausstehend — Mittleres Risiko"],
    },
    jarvis: {
      summary: "Compliance-Prüfung koordiniert — Ergebnisse zusammengefasst",
      details: "Kira und Nox haben die Prüfung abgeschlossen. 3 Handlungsempfehlungen. Kein Go-Live-Blocker.",
      suggestedActions: ["Empfehlungen umsetzen", "Re-Check in 2 Wochen"],
      risks: [],
    },
  },

  sales_strategy: {
    vega: {
      summary: "Sales-Strategie entwickelt: 5-Schritte-Closing-Plan",
      details:
        "1. Discovery: Schmerz und ROI-Potenzial klären.\n2. Demonstration: konkreten Use Case zeigen.\n3. Einwandbehandlung: 'zu teuer' → ROI-Rechnung.\n4. Angebot: 3 Pakete, mittleres zuerst präsentieren.\n5. Closing: Zeitdruck ohne Druck — 'Angebot gilt 14 Tage'.",
      suggestedActions: [
        "Gesprächsleitfaden mit Lina ausformulieren",
        "ROI-Rechnung vorbereiten",
        "Referenzkunden bereithalten",
      ],
      risks: [],
    },
    lina: {
      summary: "Kommunikationsrahmen für Sales definiert",
      details:
        "Ton: professionell, direkt, auf Augenhöhe. Kein Verkaufsdruck-Gefühl. Nutzen vor Feature stellen. Konkrete Zahlen und Beispiele nutzen.",
      suggestedActions: ["Follow-up-Mail-Template vorbereiten"],
      risks: [],
    },
    jarvis: {
      summary: "Sales-Strategie koordiniert und zusammengefasst",
      details: "Vega hat 5-Schritte-Plan entwickelt. Lina hat Kommunikationsrahmen definiert. Nächster Schritt: Discovery-Call vorbereiten.",
      suggestedActions: ["Discovery-Call terminieren"],
      risks: [],
    },
  },

  write_communication: {
    lina: {
      summary: "Kommunikationsentwurf erstellt — freigabebereit",
      details:
        "Entwurf: professionell, klar strukturiert, auf Handlung ausgerichtet. Ton angepasst an Zielgruppe (österreichisches KMU). Rechtschreibung und Grammatik geprüft. Keine verbindlichen Zusagen ohne explizite Freigabe.",
      suggestedActions: [
        "Entwurf prüfen und ggf. anpassen",
        "Freigabe erteilen bevor Versand",
      ],
      risks: ["Versand nur nach expliziter Freigabe"],
    },
    jarvis: {
      summary: "Kommunikation vorbereitet — wartet auf Freigabe",
      details: "Linas Entwurf liegt vor. Kein Versand ohne Freigabe durch Philip. Risikostufe: Mittel.",
      suggestedActions: ["Entwurf prüfen", "Freigabe erteilen oder ablehnen"],
      risks: ["Externe Kommunikation — Freigabepflichtig"],
    },
  },

  create_social_post: {
    elara: {
      summary: "Social-Media-Post-Briefing erstellt",
      details: "Format: Karussel (5 Slides). Plattform: LinkedIn. Thema: KI-Automatisierung im Alltag. Ziel: Reichweite + Lead-Gen.",
      suggestedActions: [
        "Caption über Lina formulieren",
        "Grafik über Orion briefen",
        "Kira für Compliance-Check",
        "Freigabe vor Posting",
      ],
      risks: ["Posting nur nach Freigabe"],
    },
    lina: {
      summary: "Caption-Entwurf fertig — Hook-intensiv, 150 Zeichen",
      details: "Hook: Frage-Format. Body: 3 konkrete Punkte. CTA: 'Kommentiere X für mehr'. Hashtags: 15 Stück, Mix aus Nischen und Reichweiten-Tags.",
      suggestedActions: ["Caption finalisieren", "Nach Freigabe posten"],
      risks: [],
    },
    kira: {
      summary: "Content-Compliance: OK — 1 kleiner Hinweis",
      details: "Claim 'spart garantiert Zeit' zu absolut — abmildern. Werbehinweis bei gesponserten Posts.",
      suggestedActions: ["Claim anpassen"],
      risks: ["Absoluter Claim — Gelbes Risiko"],
    },
    nox: {
      summary: "QA-Check: kein kritisches Risiko — freigabebereit",
      details: "Keine internen Infos. Keine Kundendaten. Mock-Modus aktiv — kein Auto-Posting.",
      suggestedActions: ["Nach Freigabe posten"],
      risks: [],
    },
  },

  system_concept: {
    atlas: {
      summary: "Systemkonzept entwickelt — vollständig dokumentiert",
      details:
        "Architektur: modular, sauber entkoppelt. Datenfluss: klar definiert. Integrationsschnittstellen: vorbereitet. Skalierbarkeit: berücksichtigt. Nächster Schritt: technische Umsetzung mit Forge.",
      suggestedActions: [
        "Konzept mit Forge für Umsetzung briefen",
        "Nox für Security-Check aktivieren",
        "Kira für Compliance-Prüfung",
      ],
      risks: [],
    },
    nox: {
      summary: "Security-Aspekte des Systemkonzepts geprüft",
      details: "Auth-Flow klar definiert. RLS vorgesehen. API-Schutz geplant. Keine kritischen Lücken.",
      suggestedActions: ["Konzept umsetzen", "Security-Check nach Implementierung wiederholen"],
      risks: [],
    },
    jarvis: {
      summary: "Systemkonzept koordiniert — bereit zur Umsetzung",
      details: "Atlas hat vollständiges Konzept erstellt. Nox hat Security bestätigt. Kira auf Compliance geprüft. Grünes Licht für Umsetzung.",
      suggestedActions: ["Forge für Implementierung aktivieren"],
      risks: [],
    },
  },

  academy_learning: {
    milo: {
      summary: "Lernpfad entwickelt: 4 Module, 6–8 Stunden",
      details:
        "Modul 1: KI-Grundlagen (1h). Modul 2: Prompt Engineering (2h). Modul 3: KI-Automatisierung mit n8n (2h). Modul 4: KI im Vertrieb & Marketing (2h). Abschluss-Quiz + Zertifikat geplant.",
      suggestedActions: [
        "Inhalte mit Atlas strukturieren",
        "Lina für Texte aktivieren",
        "Elara für Marketing-Wrap",
      ],
      risks: [],
    },
    atlas: {
      summary: "Kursstruktur dokumentiert — lernlogisch aufgebaut",
      details: "Lernziele pro Modul definiert. Wissens-Checks eingebaut. Progressions-Logik klar.",
      suggestedActions: ["Inhalte befüllen", "Plattform-Entscheidung treffen"],
      risks: [],
    },
    lina: {
      summary: "Kurs-Texte-Briefing erstellt",
      details: "Ton: lernfördernd, klar, motivierend. Keine Fachsprachen-Barriere. Praktische Beispiele priorisieren.",
      suggestedActions: ["Texte pro Modul ausarbeiten"],
      risks: [],
    },
    elara: {
      summary: "Marketing-Plan für Academy-Kurs vorbereitet",
      details: "Launch-Strategie: Teaser-Posts 2 Wochen vorher. Zielgruppe: KMU-Entscheider AT/DE. Preis-Strategie: KI Playbook als Einstieg.",
      suggestedActions: ["Launch-Datum festlegen"],
      risks: [],
    },
  },
};

export function getMockResponse(
  intent: Intent,
  agentId: string
): MockAgentResponse {
  const intentResponses = MOCK_RESPONSES[intent];
  if (intentResponses && intentResponses[agentId]) {
    return intentResponses[agentId]!;
  }
  return {
    summary: `${agentId} hat die Aufgabe analysiert`,
    details: `Analyse für Intent "${intent}" abgeschlossen. Ergebnis wird an Jarvis übergeben.`,
    suggestedActions: ["Jarvis koordiniert nächste Schritte"],
    risks: [],
  };
}
