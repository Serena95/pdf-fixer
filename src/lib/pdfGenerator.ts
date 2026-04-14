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
  logo2Base64?: string;
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
  doc.text('Sistema Cilento-Agenzia Locale di', marginL, y);
  y += 4.5;
  doc.text('Sviluppo del Cilento S.c.p.a.', marginL, y);
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

  // Logo Cilento Kibs (destra in alto)
  if (data.logoBase64) {
    try {
      const logoRatio = 5.59;
      const logoW = 50;
      const logoH = logoW / logoRatio;
      const logoX = W - marginR - logoW;
      const logoY = 14;
      const format = data.logoBase64.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(data.logoBase64, format, logoX, logoY, logoW, logoH);
    } catch (e) {
      console.warn('Errore caricamento logo Kibs nel PDF:', e);
    }
  }

  // Logo Sistema Cilento scpa (sotto il primo logo)
  if (data.logo2Base64) {
    try {
      const logo2W = 25;
      const logo2H = 25; // square-ish logo
      const logo2X = W - marginR - logo2W;
      const logo2Y = 26;
      const format2 = data.logo2Base64.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(data.logo2Base64, format2, logo2X, logo2Y, logo2W, logo2H);
    } catch (e) {
      console.warn('Errore caricamento logo Sistema Cilento nel PDF:', e);
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
  // Colonne: Servizio 30%, Descrizione 40%, Q.tà 10%, Prezzo 20%
  const col1X = marginL;                          // Servizio start
  const col1W = contentW * 0.30;                  // Servizio width
  const col2X = marginL + col1W;                  // Descrizione start
  const col2W = contentW * 0.40;                  // Descrizione width
  const col3X = marginL + col1W + col2W;          // Q.tà start
  const col3W = contentW * 0.10;                  // Q.tà width
  const col4X = marginL + col1W + col2W + col3W;  // Prezzo start
  const col4W = contentW * 0.20;                  // Prezzo width

  // Header tabella
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, marginL + contentW, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Servizio', col1X + 2, y);
  doc.text('Descrizione', col2X + 2, y);
  doc.text('Q.tà', col3X + 2, y);
  doc.text('Prezzo unitario', col4X + 2, y);
  y += 2;
  doc.line(marginL, y, marginL + contentW, y);

  // Linee verticali header
  const headerTop = y - 7;
  doc.line(col2X, headerTop, col2X, y);
  doc.line(col3X, headerTop, col3X, y);
  doc.line(col4X, headerTop, col4X, y);

  // === RIGA DATI ===
  y += 4;
  const rowStartY = y;

  // --- Colonna Servizio: codice (bold) + nome (bold), multiline ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const svcCodeLines = doc.splitTextToSize(data.unitCode, col1W - 4);
  doc.text(svcCodeLines, col1X + 2, y);
  const codeH = svcCodeLines.length * 3.5;

  doc.setFontSize(8);
  const svcNameLines = doc.splitTextToSize(data.unitName, col1W - 4);
  doc.text(svcNameLines, col1X + 2, y + codeH + 1);
  const nameH = svcNameLines.length * 3.5;
  const svcColH = codeH + 1 + nameH;

  // --- Colonna Descrizione: testo multiline con line spacing 1.2 ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const descMaxW = col2W - 4;
  const descLines = doc.splitTextToSize(data.description, descMaxW);
  const lineH = 3.5 * 1.2; // line spacing 1.2
  descLines.forEach((line: string, i: number) => {
    doc.text(line, col2X + 2, y + i * lineH);
  });
  const descColH = descLines.length * lineH;

  // --- Colonna Q.tà ---
  doc.setFontSize(9);
  doc.text(String(data.qty), col3X + (col3W / 2), y, { align: 'center' });

  // --- Colonna Prezzo ---
  doc.text('€ ' + fmt(data.unitPrice), col4X + col4W - 2, y, { align: 'right' });

  // Calcolo altezza riga
  const rowContentH = Math.max(svcColH, descColH, 8);
  const rowBottom = rowStartY + rowContentH + 2;

  // Linee verticali riga
  doc.line(col2X, rowStartY - 4, col2X, rowBottom);
  doc.line(col3X, rowStartY - 4, col3X, rowBottom);
  doc.line(col4X, rowStartY - 4, col4X, rowBottom);

  // Linea chiusura riga
  doc.line(marginL, rowBottom, marginL + contentW, rowBottom);

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
  doc.text('Sistema Cilento-Agenzia Locale di Sviluppo del Cilento S.c.p.a.', marginL, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('IBAN: ', marginL, y);
  doc.setFont('helvetica', 'bold');
  doc.text('IT59K0706676532000000013897', marginL + 12, y);

  doc.save(`Preventivo_${data.docNum.replace('/', '_')}.pdf`);
}
