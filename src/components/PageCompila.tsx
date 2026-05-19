import { useState, useEffect, useCallback } from 'react';
import { useClienti, useAddCliente } from '@/hooks/useClienti';
import { usePreventivi, useAddPreventivo } from '@/hooks/usePreventivi';
import { unitConfig, unitOptions, calcTotal, type Modello } from '@/lib/unitConfig';
import { generatePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import logoImg from '@/assets/logo.png';
import logo2Img from '@/assets/logo_footer_1.jpeg';
import type { ClientePreload } from '@/pages/Index';

interface Props {
  preloadCliente?: ClientePreload | null;
  onClienteConsumed?: () => void;
}

export default function PageCompila({ preloadCliente, onClienteConsumed }: Props) {
  const { data: clienti = [] } = useClienti();
  const { data: preventivi = [] } = usePreventivi();
  const addCliente = useAddCliente();
  const addPreventivo = useAddPreventivo();

  const [selectedClient, setSelectedClient] = useState('');
  const [cName, setCName] = useState('');
  const [cAddr, setCAddr] = useState('');
  const [cPiva, setCPiva] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [docNum, setDocNum] = useState('');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [unitValue, setUnitValue] = useState('');
  const [modelloIdx, setModelloIdx] = useState('');
  const [v1, setV1] = useState(0);
  const [v2, setV2] = useState(0);
  const [v3, setV3] = useState(0);
  const [vQty, setVQty] = useState(1);
  const [descServizio, setDescServizio] = useState('');
  const [tipoUnita, setTipoUnita] = useState<'Ore' | 'Giornate'>('Ore');
  const [dataInizio, setDataInizio] = useState<Date | undefined>(undefined);
  const [ivaCheck, setIvaCheck] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');
  const [logo2Base64, setLogo2Base64] = useState('');
  // CATALOGO_FIN: importo deliberato for success fee calculation
  const [importoDeliberato, setImportoDeliberato] = useState(0);
  const [successFeePerc, setSuccessFeePerc] = useState(0);
  // CATALOGO_PIANO variabile (ROSSO): obiettivi editabili
  const [rossoContributi, setRossoContributi] = useState(0);
  const [rossoFinanziamenti, setRossoFinanziamenti] = useState(0);

  // Load logo as base64
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      setLogoBase64(canvas.toDataURL('image/png'));
    };
    img.src = logoImg;

    const img2 = new Image();
    img2.crossOrigin = 'anonymous';
    img2.onload = () => {
      // Crop whitespace: content area ~15%-85% x, 20%-92% y
      const sx = Math.floor(img2.width * 0.15);
      const sy = Math.floor(img2.height * 0.20);
      const sw = Math.floor(img2.width * 0.70);
      const sh = Math.floor(img2.height * 0.72);
      const canvas2 = document.createElement('canvas');
      canvas2.width = sw;
      canvas2.height = sh;
      const ctx2 = canvas2.getContext('2d');
      ctx2?.drawImage(img2, sx, sy, sw, sh, 0, 0, sw, sh);
      setLogo2Base64(canvas2.toDataURL('image/png'));
    };
    img2.src = logo2Img;
  }, []);

  // Preload client from Clienti page
  useEffect(() => {
    if (preloadCliente) {
      setCName(preloadCliente.nome);
      setCAddr(preloadCliente.indirizzo);
      setCPiva(preloadCliente.piva);
      setCEmail(preloadCliente.email);
      onClienteConsumed?.();
    }
  }, [preloadCliente, onClienteConsumed]);

  // Auto-generate doc number
  useEffect(() => {
    const year = new Date().getFullYear();
    const count = preventivi.filter((p) => p.numero?.includes(String(year))).length + 1;
    setDocNum(`${String(count).padStart(3, '0')}/${year}`);
  }, [preventivi]);

  const loadClient = useCallback(
    (idx: string) => {
      setSelectedClient(idx);
      if (idx !== '') {
        const c = clienti[parseInt(idx)];
        if (c) {
          setCName(c.nome);
          setCAddr(c.indirizzo);
          setCPiva(c.piva);
          setCEmail(c.email);
        }
      }
    },
    [clienti]
  );

  const unitKey = unitValue.split(' ')[0];
  const currentConfig = unitKey ? unitConfig[unitKey] : null;
  const isGeneral = unitKey === 'CK-00';
  const currentModello: Modello | null =
    currentConfig && modelloIdx !== '' ? currentConfig.modelli[parseInt(modelloIdx)] : null;

  const isCatalogoFin = currentModello?.fields === 'CATALOGO_FIN';
  const isCatalogoCanone = currentModello?.fields === 'CATALOGO_CANONE';
  const isCatalogoPiano = currentModello?.fields === 'CATALOGO_PIANO';

  // Calculate imponibile
  let imponibile = 0;
  if (isGeneral) {
    imponibile = v1;
  } else if (isCatalogoFin && currentModello) {
    const fisso = (currentModello.compensoFisso || 0) + (currentModello.compensoFisso2 || 0);
    const successFee = importoDeliberato * (successFeePerc || 0) / 100;
    imponibile = fisso + successFee;
  } else if (isCatalogoCanone && currentModello) {
    imponibile = (currentModello.canoneMensile || 0) * (v2 || 0);
  } else if (isCatalogoPiano && currentModello) {
    imponibile = currentModello.variabile ? (v1 || 0) : (currentModello.importoFisso || 0);
  } else if (currentModello) {
    imponibile = calcTotal(currentModello.fields, v1, v2, v3, vQty);
  }
  const totale = ivaCheck ? imponibile * 1.22 : imponibile;

  const handleUnitChange = (val: string) => {
    setUnitValue(val);
    setModelloIdx('');
    setV1(0); setV2(0); setV3(0); setVQty(1);
    setImportoDeliberato(0);
    setRossoContributi(0);
    setRossoFinanziamenti(0);
  };

  const handleModelloChange = (val: string) => {
    setModelloIdx(val);
    setV1(0); setV2(0); setV3(0); setVQty(1);
    setTipoUnita('Ore');
    setDataInizio(undefined);
    setImportoDeliberato(0);
    // Pre-fill description for CATALOGO_FIN
    const key = unitValue.split(' ')[0];
    const cfg = key ? unitConfig[key] : null;
    const mod = cfg && val !== '' ? cfg.modelli[parseInt(val)] : null;
    setSuccessFeePerc(mod?.successFeePerc || 0);
    if ((mod?.fields === 'CATALOGO_FIN' || mod?.fields === 'CATALOGO_CANONE' || mod?.fields === 'CATALOGO_PIANO') && mod.descrizioneOperativa) {
      setDescServizio(mod.descrizioneOperativa);
    } else {
      setDescServizio('');
    }
    if (mod?.fields === 'CATALOGO_CANONE') {
      setV2(1); // default 1 mese
    }
    if (mod?.fields === 'CATALOGO_PIANO') {
      setIvaCheck(true); // IVA sempre applicata sui piani commerciali
    }
  };

  const fmtEur = (n: number) => n.toLocaleString('it-IT', { minimumFractionDigits: 2 });

  const handleGenerateAndSave = async () => {
    if (!cName) return toast.error('Inserisci il nome del cliente!');
    if (!isGeneral && !currentModello) return toast.error('Seleziona un modello!');

    // Calc qty and unit price for PDF
    let pdfQty = vQty;
    let pdfUnitPrice = imponibile / (vQty || 1);
    if (isGeneral) {
      pdfQty = 1;
      pdfUnitPrice = v1;
    } else if (isCatalogoFin) {
      pdfQty = 1;
      pdfUnitPrice = imponibile;
    } else if (isCatalogoCanone && currentModello) {
      pdfQty = v2 || 1;
      pdfUnitPrice = currentModello.canoneMensile || 0;
    } else if (isCatalogoPiano) {
      pdfQty = 1;
      pdfUnitPrice = imponibile;
    } else if (currentModello?.fields === 'CANONE' || currentModello?.fields === 'PACCHETTO') {
      pdfQty = v2 || 1;
      pdfUnitPrice = v1;
    } else if (currentModello?.fields === 'MIX') {
      pdfQty = 1;
      pdfUnitPrice = imponibile;
    }

    const dateFormatted = new Date(docDate).toLocaleDateString('it-IT');

    // Build description with payment phases for CATALOGO_FIN
    let pdfDescription = descServizio;
    if (isCatalogoFin && currentModello) {
      const phases = currentModello.fasiPagamento || [];
      const successFeeAmount = importoDeliberato * (successFeePerc || 0) / 100;
      pdfDescription = descServizio + '\n\nFasi di pagamento:\n' +
        phases.map(p => '• ' + p).join('\n') +
        (importoDeliberato > 0 ? `\n\nImporto deliberato: € ${fmtEur(importoDeliberato)}\nSuccess fee (${successFeePerc}%): € ${fmtEur(successFeeAmount)}` : '');
    }
    let obiettiviTable: Array<{ label: string; contributi: string; finanziamenti: string }> | undefined;
    let importoContrattoLabel: string | undefined;
    if (isCatalogoPiano && currentModello) {
      if (currentModello.variabile) {
        obiettiviTable = [
          { label: 'OBIETTIVO MIN. GARANTITO 1', contributi: `€ ${fmtEur(rossoContributi)}`, finanziamenti: '€ 0,00' },
          { label: 'OBIETTIVO MIN. GARANTITO 2', contributi: '€ 0,00', finanziamenti: `€ ${fmtEur(rossoFinanziamenti)}` },
        ];
      } else {
        obiettiviTable = currentModello.obiettiviGarantiti;
      }
      const importoFinale = currentModello.variabile ? (v1 || 0) : (currentModello.importoFisso || 0);
      importoContrattoLabel = `€ ${fmtEur(importoFinale)} + IVA 22%`;
    }

    // Generate PDF
    generatePDF({
      clientName: cName,
      clientAddr: cAddr,
      clientPiva: cPiva,
      docNum,
      docDate: dateFormatted,
      unitCode: unitKey,
      unitName: unitValue.split(' ').slice(1).join(' '),
      description: pdfDescription,
      qty: pdfQty,
      unitPrice: pdfUnitPrice,
      imponibile,
      ivaApplicata: ivaCheck,
      totale,
      logoBase64,
      logo2Base64,
      obiettiviTable,
      importoContrattoLabel,
    });

    // Save to DB
    try {
      if (!clienti.some((c) => c.nome === cName)) {
        await addCliente.mutateAsync({ nome: cName, indirizzo: cAddr, piva: cPiva, email: cEmail });
      }

      await addPreventivo.mutateAsync({
        numero: docNum,
        cliente: cName,
        totale,
        data: docDate,
        unit: unitValue,
        modello: isGeneral ? 'Generale' : currentModello!.nome,
        descrizione: descServizio,
        imponibile,
        iva_applicata: ivaCheck,
      });

      toast.success('PDF Generato e Preventivo Salvato!');
    } catch (err) {
      if (import.meta.env.DEV) console.error('Save error:', err);
      toast.error('Errore nel salvataggio. Riprova.');
    }
  };

  const handleSendEmail = () => {
    if (!cEmail) return toast.error("Inserisci l'email del cliente!");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cEmail)) return toast.error('Email non valida!');
    const subject = encodeURIComponent(`Preventivo ${docNum}`);
    const body = encodeURIComponent('Buongiorno, in allegato il preventivo richiesto. Cordiali saluti.');
    window.location.href = `mailto:${encodeURIComponent(cEmail)}?subject=${subject}&body=${body}`;
  };

  const handleReset = () => {
    setSelectedClient('');
    setCName(''); setCAddr(''); setCPiva(''); setCEmail('');
    setDocDate(new Date().toISOString().split('T')[0]);
    setUnitValue(''); setModelloIdx('');
    setV1(0); setV2(0); setV3(0); setVQty(1);
    setDescServizio('');
    setTipoUnita('Ore');
    setDataInizio(undefined);
    setIvaCheck(false);
    setImportoDeliberato(0);
    setRossoContributi(0);
    setRossoFinanziamenti(0);
  };

  const showQty = currentModello && (currentModello.fields === 'FISSO' || currentModello.fields === 'FISSO_PERC');

  return (
    <div className="mx-auto max-w-[850px] rounded-lg bg-white p-9 shadow-lg">
      {/* Logo */}
      <div className="mb-5 flex items-center justify-end gap-4">
        <img src={logo2Img} alt="Sistema Cilento scpa" className="inline-block max-w-[60px]" />
        <img src={logoImg} alt="Cilento Kibs" className="inline-block max-w-[180px]" />
      </div>

      {/* Cliente select */}
      <div className="mb-3 flex items-center gap-2.5">
        <span className="w-[140px] text-[13px] font-bold text-gray-600">Carica Cliente:</span>
        <select
          value={selectedClient}
          onChange={(e) => loadClient(e.target.value)}
          className="max-w-[300px] rounded-md border border-gray-300 px-3 py-2.5 text-sm"
        >
          <option value="">-- Carica Cliente --</option>
          {clienti.map((c, i) => (
            <option key={c.id} value={i}>{c.nome}</option>
          ))}
        </select>
      </div>

      {/* Client fields */}
      {[
        { label: 'Spett.le:', value: cName, set: setCName },
        { label: 'Indirizzo:', value: cAddr, set: setCAddr },
        { label: 'P.IVA/C.F.:', value: cPiva, set: setCPiva },
        { label: 'Email:', value: cEmail, set: setCEmail, type: 'email' },
      ].map((f) => (
        <div key={f.label} className="mb-3 flex items-center gap-2.5">
          <span className="w-[140px] text-[13px] font-bold text-gray-600">{f.label}</span>
          <input
            type={f.type || 'text'}
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
          />
        </div>
      ))}

      {/* Doc number & date */}
      <div className="mb-3 mt-5 flex items-center gap-2.5 border-t border-gray-200 pt-4">
        <span className="w-[140px] text-[13px] font-bold text-gray-600">Numero Doc:</span>
        <input
          value={docNum}
          onChange={(e) => setDocNum(e.target.value)}
          className="w-[140px] rounded-md border border-gray-300 px-3 py-2.5 text-sm"
        />
        <span className="ml-8 text-[13px] font-bold text-gray-600">Data:</span>
        <input
          type="date"
          value={docDate}
          onChange={(e) => setDocDate(e.target.value)}
          className="w-[180px] rounded-md border border-gray-300 px-3 py-2.5 text-sm"
        />
      </div>

      {/* Unit config box */}
      <div
        className="my-5 rounded-md p-5"
        style={{
          background: currentConfig?.bg || '#f8f9fa',
          borderLeft: `5px solid ${currentConfig?.border || '#004a99'}`,
        }}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span className="w-[140px] text-[13px] font-bold text-gray-600">Unit:</span>
          <select
            value={unitValue}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
          >
            <option value="">-- Seleziona Unit --</option>
            {unitOptions.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>

        {!isGeneral && (
          <div className="mb-3 flex items-center gap-2.5">
            <span className="w-[140px] text-[13px] font-bold text-gray-600">
              {unitKey === 'CK-01' ? 'Prodotto:' : 'Modello:'}
            </span>
            <select
              value={modelloIdx}
              onChange={(e) => handleModelloChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="">{unitKey === 'CK-01' ? '-- Seleziona Prodotto --' : '-- Seleziona Modello --'}</option>
              {currentConfig?.modelli.map((m, i) => (
                <option key={i} value={i}>{m.nome}</option>
              ))}
            </select>
          </div>
        )}

        {/* Free-form fields for CK-00 */}
        {isGeneral && (
          <div className="mt-4">
            <div>
              <span className="text-[13px] font-bold text-gray-600">Importo (€)</span>
              <input
                type="number"
                value={v1 || ''}
                onChange={(e) => setV1(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {/* CATALOGO_FIN: fixed-price product display */}
        {isCatalogoFin && currentModello && (
          <div className="mt-4 space-y-4">
            {/* Product code */}
            <div className="rounded-md bg-white/60 p-3">
              <span className="text-[11px] font-medium text-gray-500">Codice Prodotto</span>
              <p className="text-sm font-bold text-gray-800">{currentModello.codice}</p>
            </div>

            {/* Fixed fees - read only */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[13px] font-bold text-gray-600">Compenso Fisso (€)</span>
                <input
                  type="text"
                  value={`€ ${fmtEur(currentModello.compensoFisso || 0)}`}
                  readOnly
                  className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 cursor-not-allowed"
                />
                <span className="text-[11px] text-gray-500">Alla conferma incarico</span>
              </div>
              {currentModello.compensoFisso2 != null && (
                <div>
                  <span className="text-[13px] font-bold text-gray-600">Fase 2 (€)</span>
                  <input
                    type="text"
                    value={`€ ${fmtEur(currentModello.compensoFisso2)}`}
                    readOnly
                    className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-gray-500">{currentModello.compensoFisso2Label || 'Alla comunicazione di ammissione'}</span>
                </div>
              )}
            </div>

            {/* Success fee - editable percentage */}
            <div>
              <span className="text-[13px] font-bold text-gray-600">Success Fee (%) — modificabile</span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={successFeePerc || ''}
                  onChange={(e) => setSuccessFeePerc(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700"
                />
                <span className="text-sm text-gray-600">% su importo deliberato/finanziato</span>
              </div>
              {currentModello.successFeePerc != null && successFeePerc !== currentModello.successFeePerc && (
                <span className="text-[11px] text-orange-600">Valore di default: {currentModello.successFeePerc}%</span>
              )}
            </div>

            {/* Importo deliberato - user input */}
            <div className="rounded-md border-2 border-blue-300 bg-blue-50 p-4">
              <span className="text-[13px] font-bold text-blue-800">Importo Deliberato / Finanziato (€) *</span>
              <input
                type="number"
                value={importoDeliberato || ''}
                onChange={(e) => setImportoDeliberato(parseFloat(e.target.value) || 0)}
                placeholder="Inserisci l'importo deliberato..."
                className="mt-1 w-full rounded-md border border-blue-300 px-3 py-2.5 text-sm"
              />
              {importoDeliberato > 0 && (
                <p className="mt-2 text-sm text-blue-700">
                  Success fee ({successFeePerc}%): <strong>€ {fmtEur(importoDeliberato * (successFeePerc || 0) / 100)}</strong>
                </p>
              )}
            </div>

            {/* Payment phases */}
            {currentModello.fasiPagamento && currentModello.fasiPagamento.length > 0 && (
              <div className="rounded-md bg-white/60 p-3">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Fasi di Pagamento</span>
                <ul className="mt-1 space-y-1">
                  {currentModello.fasiPagamento.map((fase, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-0.5 text-blue-500">•</span>
                      {fase}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* CATALOGO_CANONE: fixed monthly plan display */}
        {isCatalogoCanone && currentModello && (
          <div className="mt-4 space-y-4">
            <div className="rounded-md bg-white/60 p-3">
              <span className="text-[11px] font-medium text-gray-500">Codice Piano</span>
              <p className="text-sm font-bold text-gray-800">{currentModello.codice}</p>
              {currentModello.titoloServizio && (
                <p className="mt-1 text-sm text-gray-700">{currentModello.titoloServizio}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[13px] font-bold text-gray-600">Canone Mensile (€)</span>
                <input
                  type="text"
                  value={`€ ${fmtEur(currentModello.canoneMensile || 0)} / mese`}
                  readOnly
                  className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <span className="text-[13px] font-bold text-gray-600">Durata (Mesi) *</span>
                <input
                  type="number"
                  min="1"
                  value={v2 || ''}
                  onChange={(e) => setV2(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* CATALOGO_PIANO: commercial plan (fixed or variable) */}
        {isCatalogoPiano && currentModello && (
          <div className="mt-4 space-y-4">
            <div className="rounded-md bg-white/60 p-3">
              <span className="text-[11px] font-medium text-gray-500">Codice Piano</span>
              <p className="text-sm font-bold text-gray-800">{currentModello.codice}</p>
              {currentModello.titoloServizio && (
                <p className="mt-1 text-sm text-gray-700">{currentModello.titoloServizio}</p>
              )}
            </div>
            {currentModello.variabile ? (
              <>
                <div className="rounded-md border-2 border-red-300 bg-red-50 p-4">
                  <span className="text-[13px] font-bold text-red-800">
                    Importo Contratto ROSSO (€) * — personalizzabile
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={v1 || ''}
                    onChange={(e) => setV1(parseFloat(e.target.value) || 0)}
                    placeholder="Inserisci l'importo concordato (es. 35000)..."
                    className="mt-1 w-full rounded-md border border-red-300 px-3 py-2.5 text-sm font-semibold"
                  />
                  {v1 > 0 && (
                    <div className="mt-2 text-[12px] text-red-900 space-y-0.5">
                      <p>Imponibile: <strong>€ {fmtEur(v1)}</strong></p>
                      <p>IVA 22%: <strong>€ {fmtEur(v1 * 0.22)}</strong></p>
                      <p>Totale: <strong>€ {fmtEur(v1 * 1.22)}</strong></p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[13px] font-bold text-gray-600">Obiettivo Contributi (€)</span>
                    <input
                      type="number"
                      min="0"
                      value={rossoContributi || ''}
                      onChange={(e) => setRossoContributi(parseFloat(e.target.value) || 0)}
                      placeholder="es. 60000"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-gray-600">Obiettivo Finanziamenti (€)</span>
                    <input
                      type="number"
                      min="0"
                      value={rossoFinanziamenti || ''}
                      onChange={(e) => setRossoFinanziamenti(parseFloat(e.target.value) || 0)}
                      placeholder="es. 180000"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <span className="text-[13px] font-bold text-gray-600">Importo Contratto</span>
                <input
                  type="text"
                  value={`€ ${fmtEur(currentModello.importoFisso || 0)}  (${currentModello.displayImporto || ''})`}
                  readOnly
                  className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 cursor-not-allowed"
                />
              </div>
            )}

            {/* Nota IVA */}
            <div className="rounded-md bg-yellow-50 border border-yellow-300 p-2 text-center">
              <span className="text-[12px] font-semibold text-yellow-800">
                ⚠️ Tutti gli importi sono da intendersi <strong>+ IVA 22%</strong>
              </span>
            </div>

            {/* Tabella obiettivi garantiti */}
            {currentModello.obiettiviGarantiti && currentModello.obiettiviGarantiti.length > 0 && (
              <div className="rounded-md bg-white/80 border border-gray-300 p-3">
                <p className="mb-2 text-[12px] font-bold text-gray-700 uppercase tracking-wider">
                  Garanzia di Risultato Minimo — TABELLA A
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="border border-gray-400 px-2 py-1.5 text-left font-bold text-gray-800">Obiettivo</th>
                        <th className="border border-gray-400 px-2 py-1.5 text-left font-bold text-gray-800">
                          Contributi C/Capitale, C/Interessi e/o Credito d'imposta
                        </th>
                        <th className="border border-gray-400 px-2 py-1.5 text-left font-bold text-gray-800">
                          Finanziamenti Agevolati
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentModello.variabile
                        ? [
                            { label: 'OBIETTIVO MIN. GARANTITO 1', contributi: `€ ${fmtEur(rossoContributi)}`, finanziamenti: '€ 0,00' },
                            { label: 'OBIETTIVO MIN. GARANTITO 2', contributi: '€ 0,00', finanziamenti: `€ ${fmtEur(rossoFinanziamenti)}` },
                          ]
                        : currentModello.obiettiviGarantiti
                      )?.map((o, i) => (
                        <tr key={i} className="bg-white">
                          <td className="border border-gray-400 px-2 py-1.5 font-semibold text-gray-700">{o.label}</td>
                          <td className="border border-gray-400 px-2 py-1.5 text-gray-700">{o.contributi}</td>
                          <td className="border border-gray-400 px-2 py-1.5 text-gray-700">{o.finanziamenti}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 rounded-md border-2 border-gray-400 bg-gray-50 p-3">
                  <p className="text-[12px] font-semibold text-gray-800">
                    ⚠️ Garanzia di risultato minimo: si considera raggiunto al verificarsi di <strong>UNA SOLA</strong> delle voci della tabella obiettivi (non di tutte).
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-gray-900 uppercase">
                    Questa somma si intende a copertura di un massimo di 3 bandi l'anno.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic fields for non-CATALOGO_* */}
        {currentModello && !isCatalogoFin && !isCatalogoCanone && !isCatalogoPiano && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {currentModello.hasTipoUnita && (
              <div className="col-span-2">
                <span className="text-[13px] font-bold text-gray-600">Tipo Unità *</span>
                <select
                  value={tipoUnita}
                  onChange={(e) => setTipoUnita(e.target.value as 'Ore' | 'Giornate')}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
                >
                  <option value="Ore">Ore</option>
                  <option value="Giornate">Giornate</option>
                </select>
              </div>
            )}
            {(currentModello.label || currentModello.label1) && (
              <div>
                <span className="text-[13px] font-bold text-gray-600">
                  {currentModello.hasTipoUnita
                    ? `Numero ${tipoUnita} *`
                    : (currentModello.label || currentModello.label1)}
                </span>
                <input
                  type="number"
                  value={v1 || ''}
                  onChange={(e) => setV1(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
                />
              </div>
            )}
            {currentModello.label2 && (
              <div>
                <span className="text-[13px] font-bold text-gray-600">{currentModello.label2}</span>
                <input
                  type="number"
                  value={v2 || ''}
                  onChange={(e) => setV2(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
                />
              </div>
            )}
            {currentModello.hasDataInizio && (
              <div>
                <span className="text-[13px] font-bold text-gray-600">Data Inizio</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "mt-1 w-full justify-start text-left font-normal",
                        !dataInizio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInizio ? format(dataInizio, 'dd/MM/yyyy', { locale: it }) : 'Seleziona data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInizio}
                      onSelect={setDataInizio}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {showQty && (
              <div>
                <span className="text-[13px] font-bold text-gray-600">Quantità</span>
                <input
                  type="number"
                  value={vQty || ''}
                  onChange={(e) => setVQty(parseFloat(e.target.value) || 1)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Descrizione */}
      <div className="mb-2 text-[13px] font-bold text-gray-600">Oggetto della Prestazione:</div>
      <textarea
        value={descServizio}
        onChange={(e) => setDescServizio(e.target.value)}
        rows={5}
        placeholder="Descrivi qui il servizio..."
        className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
      />

      {/* IVA toggle + Totale */}
      <div className="mt-6 text-right">
        <div className="mb-4 flex items-center justify-end gap-4">
          <span className="text-sm font-bold">APPLICA IVA 22%?</span>
          <label className="relative inline-block h-[30px] w-[60px]">
            <input
              type="checkbox"
              checked={ivaCheck}
              onChange={(e) => setIvaCheck(e.target.checked)}
              className="peer sr-only"
            />
            <span className="absolute inset-0 cursor-pointer rounded-full bg-gray-300 transition-colors peer-checked:bg-green-500" />
            <span className="absolute bottom-1 left-1 h-[22px] w-[22px] rounded-full bg-white transition-transform peer-checked:translate-x-[30px]" />
          </label>
          <span className={`w-[30px] font-bold ${ivaCheck ? 'text-green-500' : 'text-gray-400'}`}>
            {ivaCheck ? 'SI' : 'NO'}
          </span>
        </div>

        {/* Detailed breakdown for CATALOGO_FIN */}
        {isCatalogoFin && currentModello && (
          <div className="mb-4 text-right text-sm text-gray-600">
            <p>Compenso fisso: € {fmtEur((currentModello.compensoFisso || 0) + (currentModello.compensoFisso2 || 0))}</p>
            {importoDeliberato > 0 && (
              <p>Success fee ({successFeePerc}%): € {fmtEur(importoDeliberato * (successFeePerc || 0) / 100)}</p>
            )}
          </div>
        )}

        {/* Detailed breakdown for CATALOGO_PIANO */}
        {isCatalogoPiano && currentModello && (
          <div className="mb-4 rounded-md bg-gray-50 border border-gray-200 p-3 text-right text-sm">
            <div className="flex justify-between text-gray-700">
              <span className="font-semibold">Piano selezionato:</span>
              <span>{currentModello.titoloServizio || currentModello.nome}</span>
            </div>
            <div className="flex justify-between text-gray-700 mt-1">
              <span className="font-semibold">Imponibile:</span>
              <span>€ {fmtEur(imponibile)}</span>
            </div>
            <div className="flex justify-between text-gray-700 mt-1">
              <span className="font-semibold">IVA 22%:</span>
              <span>€ {fmtEur(imponibile * 0.22)}</span>
            </div>
            <div className="flex justify-between text-[#004a99] mt-2 pt-2 border-t border-gray-300 font-bold">
              <span>Totale:</span>
              <span>€ {fmtEur(imponibile * 1.22)}</span>
            </div>
          </div>
        )}

        <span className="text-[28px] font-bold text-[#004a99]">
          TOTALE: € {totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleGenerateAndSave}
          className="rounded-md bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
        >
          📥 SCARICA PDF E SALVA
        </button>
        <button
          onClick={handleSendEmail}
          className="rounded-md bg-blue-500 px-6 py-3 font-bold text-white transition hover:bg-blue-600"
        >
          📧 INVIA AL CLIENTE
        </button>
        <button
          onClick={handleReset}
          className="rounded-md bg-gray-500 px-6 py-3 font-bold text-white transition hover:bg-gray-600"
        >
          📝 RESET
        </button>
      </div>
    </div>
  );
}
