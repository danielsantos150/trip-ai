import jsPDF from "jspdf";

interface TripPdfData {
  destination: string;
  travelMonth: string;
  travelDays: number;
  isSolo: boolean;
  companions: number;
  budgetMax: number;
  budgetType: string;
  accommodationType: string;
  minStars: number;
  wantsBeachProximity: boolean | null;
  likesNightlife: boolean | null;
  wantsFlights: boolean | null;
  origin: string;
  fareClass: string;
  checkIn?: string;
  checkOut?: string;
  selectedHotel: any | null;
  selectedFlight: any | null;
}

const COLORS = {
  primary: [59, 130, 246] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [16, 185, 129] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
};

export function generateTripPdf(data: TripPdfData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ─── Header ───
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 42, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.text("ONHAPPY", margin, 14);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Plano de Viagem", margin, 28);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.destination || "Destino não definido", margin, 36);

  const today = new Date().toLocaleDateString("pt-BR");
  doc.setFontSize(8);
  doc.text(`Gerado em ${today}`, pageW - margin, 36, { align: "right" });

  y = 52;

  // ─── Trip Summary Box ───
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "F");

  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo da Viagem", margin + 6, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);

  const travelers = data.isSolo ? "1 viajante" : `${data.companions} viajantes`;
  const budget = `R$ ${data.budgetMax.toLocaleString("pt-BR")} (${data.budgetType === "per_day" ? "por dia" : "total"})`;
  const stars = "★".repeat(data.minStars);

  const summaryLeft = [
    `Destino: ${data.destination}`,
    `Periodo: ${data.travelMonth} · ${data.travelDays} dias`,
    data.checkIn && data.checkOut ? `Datas: ${data.checkIn} a ${data.checkOut}` : "",
  ].filter(Boolean);

  const summaryRight = [
    `Viajantes: ${travelers}`,
    `Orcamento: ${budget}`,
    `Hospedagem: ${data.accommodationType} ${stars}`,
  ];

  summaryLeft.forEach((line, i) => {
    doc.text(line, margin + 6, y + 15 + i * 4.5);
  });

  summaryRight.forEach((line, i) => {
    doc.text(line, margin + contentW / 2 + 4, y + 15 + i * 4.5);
  });

  y += 36;

  // ─── Section helper ───
  const drawSection = (emoji: string, title: string, yPos: number): number => {
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, yPos, contentW, 8, 2, 2, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${emoji}  ${title}`, margin + 5, yPos + 5.5);
    return yPos + 13;
  };

  const drawKeyValue = (key: string, value: string, yPos: number): number => {
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(key, margin + 6, yPos);
    doc.setTextColor(...COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(value, margin + 55, yPos);
    return yPos + 5.5;
  };

  // ─── Hotel Section ───
  if (data.selectedHotel) {
    y = drawSection("Hotel", "Hospedagem Selecionada", y);

    doc.setFillColor(...COLORS.light);
    const hotelBoxH = 42;
    doc.roundedRect(margin, y, contentW, hotelBoxH, 2, 2, "F");

    y += 6;
    y = drawKeyValue("Nome:", data.selectedHotel.name || "—", y);
    y = drawKeyValue("Estrelas:", "★".repeat(data.selectedHotel.stars || 0), y);
    y = drawKeyValue("Avaliacao:", data.selectedHotel.rating ? `${data.selectedHotel.rating}/10` : "—", y);
    y = drawKeyValue("Localizacao:", data.selectedHotel.location || "—", y);

    if (data.selectedHotel.price > 0) {
      const totalHotel = data.selectedHotel.price * (data.travelDays || 7);
      y = drawKeyValue("Preco/noite:", `R$ ${data.selectedHotel.price.toLocaleString("pt-BR")}`, y);
      y = drawKeyValue(`Total (${data.travelDays} noites):`, `R$ ${totalHotel.toLocaleString("pt-BR")}`, y);
    }

    y += 8;
  }

  // ─── Flight Section ───
  if (data.selectedFlight) {
    y = drawSection("Voo", "Voo Selecionado", y);

    doc.setFillColor(...COLORS.light);
    const flightBoxH = 36;
    doc.roundedRect(margin, y, contentW, flightBoxH, 2, 2, "F");

    y += 6;
    y = drawKeyValue("Companhia:", data.selectedFlight.airline || "—", y);
    y = drawKeyValue("Rota:", `${data.selectedFlight.origin || "—"} → ${data.selectedFlight.destination || "—"}`, y);
    y = drawKeyValue("Horario:", `${data.selectedFlight.departure || ""} → ${data.selectedFlight.arrival || ""}`, y);
    y = drawKeyValue("Duracao:", data.selectedFlight.duration || "—", y);
    y = drawKeyValue("Paradas:", data.selectedFlight.stops === 0 ? "Direto" : `${data.selectedFlight.stops} parada(s)`, y);

    if (data.selectedFlight.price > 0) {
      y = drawKeyValue("Preco:", `R$ ${data.selectedFlight.price.toLocaleString("pt-BR")}`, y);
    }

    y += 8;
  }

  // ─── Total Cost Section ───
  const hotelTotal = data.selectedHotel?.price > 0 ? data.selectedHotel.price * (data.travelDays || 7) : 0;
  const flightTotal = data.selectedFlight?.price > 0 ? data.selectedFlight.price : 0;
  const grandTotal = hotelTotal + flightTotal;

  if (grandTotal > 0) {
    doc.setFillColor(...COLORS.dark);
    doc.roundedRect(margin, y, contentW, 16, 3, 3, "F");

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Custo Total Estimado", margin + 6, y + 7);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`R$ ${grandTotal.toLocaleString("pt-BR")}`, pageW - margin - 6, y + 10, { align: "right" });

    y += 22;

    // Budget comparison
    if (data.budgetMax > 0) {
      const budgetTotal = data.budgetType === "per_day" ? data.budgetMax * data.travelDays : data.budgetMax;
      const overBudget = grandTotal > budgetTotal;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...(overBudget ? COLORS.amber : COLORS.green));
      doc.text(
        overBudget
          ? `Orcamento excedido em R$ ${(grandTotal - budgetTotal).toLocaleString("pt-BR")}`
          : `Dentro do orcamento — restam R$ ${(budgetTotal - grandTotal).toLocaleString("pt-BR")}`,
        margin + 6,
        y
      );
      y += 8;
    }
  }

  // ─── Preferences Section ───
  if (y < 230) {
    y = drawSection("Preferencias", "Preferencias do Viajante", y);

    doc.setFillColor(...COLORS.light);
    doc.roundedRect(margin, y, contentW, 24, 2, 2, "F");

    y += 6;
    const prefs: string[] = [];
    if (data.wantsBeachProximity === true) prefs.push("Perto da praia");
    if (data.wantsBeachProximity === false) prefs.push("Nao precisa de praia");
    if (data.likesNightlife === true) prefs.push("Gosta de vida noturna");
    if (data.likesNightlife === false) prefs.push("Nao curte vida noturna");
    if (data.wantsFlights) prefs.push(`Voo de ${data.origin}`);
    if (data.fareClass !== "economy") prefs.push(`Classe: ${data.fareClass}`);

    if (prefs.length > 0) {
      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      prefs.forEach((pref, i) => {
        doc.text(`• ${pref}`, margin + 6, y + i * 4.5);
      });
    }

    y += Math.max(prefs.length * 4.5, 10) + 6;
  }

  // ─── Footer ───
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, footerY - 4, pageW - margin, footerY - 4);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Gerado por Onhappy — Planejamento Inteligente de Viagens a Lazer", margin, footerY);
  doc.text("Os precos sao estimativas e podem variar.", pageW - margin, footerY, { align: "right" });

  // Open in new tab
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
}
