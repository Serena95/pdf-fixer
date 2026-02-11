import jsPDF from 'jspdf';

interface PdfData {
  clientName: string;
  clientAddr: string;
  clientPiva: string;
  docNum: string;
  docDate: string;
  unitCode: string;
  unitName: string;
  description: string;
  qty: number;
  unitPrice: number;
  imponibile: number;
  ivaApplicata: boolean;
  totale: number;
  logoBase64: string;
}

function fmt(n: number): string {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2 });
}

export function generatePDF(data: PdfData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const marginL = 15;
  const marginR = 15;
  const contentW = W - marginL - marginR;
  let y = 20;

  // === HEADER ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Sistema Cilento-agenzia Locale Di', marginL, y);
  y += 4.5;
  doc.text('Sviluppo Del Cilento S.c.p.a.', marginL, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Via Filippo Palumbo, 5 Vallo della', marginL, y);
  y += 4;
  doc.text('Lucania (SA)', marginL, y);
  y += 4;
  doc.text('P.IVA 03530920555', marginL, y);

  // Contatti (centro)
  const contactX = 90;
  doc.setFont('helvetica', 'bold');
  doc.text('Tel.: 0974 717342', contactX, 20);
  doc.setFont('helvetica', 'normal');
  doc.text('infocilentokibs@gmail.com', contactX, 25);

  // Logo (destra)
  if (data.logoBase64) {
    try {
      doc.addImage(data.logoBase64, 'JPEG', W - marginR - 40, 12, 40, 18);
    } catch (e) {
      console.warn('Errore caricamento logo nel PDF:', e);
    }
  }

  // === CLIENTE E DATA ===
  y = 55;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(data.clientName, marginL, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (data.clientAddr) { doc.text(data.clientAddr, marginL, y); y += 4.5; }
  if (data.clientPiva) { doc.text('P.IVA/CF: ' + data.clientPiva, marginL, y); y += 4.5; }

  // Data a destra
  doc.text('Data: ' + data.docDate, W - marginR - 40, 55);

  // === TITOLO ===
  y = 80;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Preventivo n. ' + data.docNum, marginL, y);

  // === TABELLA ===
  y = 95;
  const colX = [marginL, marginL + 30, marginL + 55, marginL + contentW - 50, marginL + contentW - 15];

  // Header tabella
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, marginL + contentW, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('', colX[0], y);
  doc.text('Servizio', colX[1], y);
  doc.text('Descrizione', colX[2], y);
  doc.text('Q.ta', colX[3], y);
  doc.text('Prezzo unitario', colX[4] - 5, y);
  y += 2;
  doc.line(marginL, y, marginL + contentW, y);

  // Linee verticali header
  doc.line(colX[1] - 2, y - 7, colX[1] - 2, y);
  doc.line(colX[2] - 2, y - 7, colX[2] - 2, y);
  doc.line(colX[3] - 2, y - 7, colX[3] - 2, y);
  doc.line(colX[4] - 7, y - 7, colX[4] - 7, y);

  // Riga dati
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(data.unitCode, marginL + 2, y);

  doc.setFontSize(8);
  doc.text(data.unitName, colX[1], y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Descrizione (multiline)
  const descLines = doc.splitTextToSize(data.description, contentW - 55 - 50);
  doc.text(descLines, colX[2], y);
  const descHeight = descLines.length * 4.5;

  doc.text(String(data.qty), colX[3] + 5, y);
  doc.text('€ ' + fmt(data.unitPrice), colX[4] - 5, y);

  // Linee verticali riga
  const rowBottom = y + Math.max(descHeight, 8);
  doc.line(colX[1] - 2, y - 6, colX[1] - 2, rowBottom);
  doc.line(colX[2] - 2, y - 6, colX[2] - 2, rowBottom);
  doc.line(colX[3] - 2, y - 6, colX[3] - 2, rowBottom);
  doc.line(colX[4] - 7, y - 6, colX[4] - 7, rowBottom);

  // === RIEPILOGO ===
  y = rowBottom + 5;
  const sumLabelX = marginL + contentW - 70;
  const sumValX = marginL + contentW;

  doc.setLineWidth(0.3);
  doc.line(sumLabelX, y, sumValX, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTALE', sumLabelX + 2, y);
  doc.text('€ ' + fmt(data.imponibile), sumValX - 2, y, { align: 'right' });
  doc.line(sumLabelX, y + 2, sumValX, y + 2);

  if (data.ivaApplicata) {
    y += 7;
    doc.text('TASSE 22%', sumLabelX + 2, y);
    doc.text('€ ' + fmt(data.imponibile * 0.22), sumValX - 2, y, { align: 'right' });
    doc.line(sumLabelX, y + 2, sumValX, y + 2);
  }

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTALE + IVA', sumLabelX + 2, y);
  doc.text('€ ' + fmt(data.totale), sumValX - 2, y, { align: 'right' });
  doc.line(sumLabelX, y + 2, sumValX, y + 2);

  // === FOOTER ===
  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Vallo della Lucania, lì ' + data.docDate, marginL, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Sistema Cilento-agenzia Locale Di Sviluppo Del Cilento S.c.p.a.', marginL, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('IBAN: ', marginL, y);
  doc.setFont('helvetica', 'bold');
  doc.text('IT59K0706676532000000013897', marginL + 12, y);

  doc.save(`Preventivo_${data.docNum.replace('/', '_')}.pdf`);
}
