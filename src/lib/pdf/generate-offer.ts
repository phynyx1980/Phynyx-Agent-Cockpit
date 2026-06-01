"use client";

import type { ApprovalPayload } from "@/lib/agents/agent-types";

// Client-seitige PDF-Generierung mit jsPDF
export async function generateOfferPDF(payload: ApprovalPayload, title: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const margin   = 20;
  const pageW    = 210;
  const contentW = pageW - margin * 2;
  let   y        = margin;

  // ── Phynyx Branding ────────────────────────────────────────────────────────

  // Roter Header-Streifen
  doc.setFillColor(204, 17, 0);
  doc.rect(0, 0, pageW, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PHYNYX TRUST SOLUTIONS", margin, 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("STRATEGIE. UMSETZUNG. AUTOMATISIERUNG.", pageW - margin, 11, { align: "right" });

  y = 30;

  // ── Titel ──────────────────────────────────────────────────────────────────
  doc.setTextColor(10, 10, 10);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ANGEBOT", margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(title, margin, y);
  y += 6;

  // Datum
  doc.setFontSize(9);
  doc.text(`Datum: ${new Date().toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" })}`, margin, y);
  y += 10;

  // Trennlinie
  doc.setDrawColor(204, 17, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Kunde ──────────────────────────────────────────────────────────────────
  if (payload.offerData?.client) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 10, 10);
    doc.text("AN:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(payload.offerData.client, margin + 12, y);
    y += 10;
  }

  // ── Positionen ─────────────────────────────────────────────────────────────
  if (payload.offerData?.items?.length) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 10, 10);
    doc.text("LEISTUNGEN", margin, y);
    y += 6;

    // Tabellen-Header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 4, contentW, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Position", margin + 2, y);
    doc.text("Preis", pageW - margin - 2, y, { align: "right" });
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    for (const item of payload.offerData.items) {
      if (y > 260) { doc.addPage(); y = margin; }

      doc.setTextColor(10, 10, 10);
      doc.text(item.name, margin + 2, y);
      doc.setTextColor(204, 17, 0);
      doc.text(item.price, pageW - margin - 2, y, { align: "right" });
      doc.setTextColor(120, 120, 120);
      y += 4;

      if (item.description) {
        const lines = doc.splitTextToSize(item.description, contentW - 10);
        doc.setFontSize(8);
        doc.text(lines, margin + 4, y);
        y += lines.length * 4 + 2;
        doc.setFontSize(9);
      }

      // Trennlinie unter Position
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
    }

    // Gesamt
    if (payload.offerData.total) {
      y += 3;
      doc.setFillColor(204, 17, 0);
      doc.rect(margin, y - 4, contentW, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("GESAMT (netto)", margin + 2, y + 1);
      doc.text(payload.offerData.total, pageW - margin - 2, y + 1, { align: "right" });
      y += 14;
    }
  }

  // ── Freitext-Inhalt ────────────────────────────────────────────────────────
  if (payload.content && !payload.offerData) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(payload.content, contentW);
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 5;
    }
    y += 5;
  }

  // ── Notizen ────────────────────────────────────────────────────────────────
  if (payload.offerData?.notes) {
    if (y > 250) { doc.addPage(); y = margin; }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 10, 10);
    doc.text("HINWEISE", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(payload.offerData.notes, contentW);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 5 + 5;
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerY = 285;
  doc.setFillColor(240, 240, 240);
  doc.rect(0, footerY - 4, pageW, 15, "F");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text("Phynyx Trust Solutions · phynyx-trust-solutions.lovable.app · Philip Trost", margin, footerY + 2);
  doc.text("Alle Preise in EUR, netto. Dieses Angebot ist freibleibend.", margin, footerY + 6);
  doc.text(`Seite 1`, pageW - margin, footerY + 2, { align: "right" });

  // ── Download ───────────────────────────────────────────────────────────────
  const filename = `Angebot_${(payload.offerData?.client ?? "Phynyx").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
