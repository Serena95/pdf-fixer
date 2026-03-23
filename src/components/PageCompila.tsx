import { useState, useEffect, useCallback } from 'react';
import { useClienti, useAddCliente } from '@/hooks/useClienti';
import { usePreventivi, useAddPreventivo } from '@/hooks/usePreventivi';
import { unitConfig, unitOptions, calcTotal, type Modello } from '@/lib/unitConfig';
import { generatePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import logoImg from '@/assets/logo.jpg';
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
  const [ivaCheck, setIvaCheck] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');

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
      setLogoBase64(canvas.toDataURL('image/jpeg'));
    };
    img.src = logoImg;
  }, []);

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
  const currentModello: Modello | null =
    currentConfig && modelloIdx !== '' ? currentConfig.modelli[parseInt(modelloIdx)] : null;

  const imponibile = currentModello ? calcTotal(currentModello.fields, v1, v2, v3, vQty) : 0;
  const totale = ivaCheck ? imponibile * 1.22 : imponibile;

  const handleUnitChange = (val: string) => {
    setUnitValue(val);
    setModelloIdx('');
    setV1(0); setV2(0); setV3(0); setVQty(1);
  };

  const handleModelloChange = (val: string) => {
    setModelloIdx(val);
    setV1(0); setV2(0); setV3(0); setVQty(1);
  };

  const handleGenerateAndSave = async () => {
    if (!cName) return toast.error('Inserisci il nome del cliente!');
    if (!currentModello) return toast.error('Seleziona un modello!');

    // Calc qty and unit price for PDF
    let pdfQty = vQty;
    let pdfUnitPrice = imponibile / vQty;
    if (currentModello.fields === 'CANONE' || currentModello.fields === 'PACCHETTO') {
      pdfQty = v2 || 1;
      pdfUnitPrice = v1;
    } else if (currentModello.fields === 'MIX') {
      pdfQty = 1;
      pdfUnitPrice = imponibile;
    }

    const dateFormatted = new Date(docDate).toLocaleDateString('it-IT');

    // Generate PDF
    generatePDF({
      clientName: cName,
      clientAddr: cAddr,
      clientPiva: cPiva,
      docNum,
      docDate: dateFormatted,
      unitCode: unitKey,
      unitName: unitValue.split(' ').slice(1).join(' '),
      description: descServizio,
      qty: pdfQty,
      unitPrice: pdfUnitPrice,
      imponibile,
      ivaApplicata: ivaCheck,
      totale,
      logoBase64,
    });

    // Save to DB
    try {
      // Save client
      if (!clienti.some((c) => c.nome === cName)) {
        await addCliente.mutateAsync({ nome: cName, indirizzo: cAddr, piva: cPiva, email: cEmail });
      }

      // Save preventivo
      await addPreventivo.mutateAsync({
        numero: docNum,
        cliente: cName,
        totale,
        data: docDate,
        unit: unitValue,
        modello: currentModello.nome,
        descrizione: descServizio,
        imponibile,
        iva_applicata: ivaCheck,
      });

      toast.success('PDF Generato e Preventivo Salvato!');
    } catch (err) {
      console.error(err);
      toast.error('Errore nel salvataggio');
    }
  };

  const handleSendEmail = () => {
    if (!cEmail) return toast.error("Inserisci l'email del cliente!");
    window.location.href = `mailto:${cEmail}?subject=Preventivo ${docNum}&body=Buongiorno, in allegato il preventivo richiesto. Cordiali saluti.`;
  };

  const handleReset = () => {
    setCName(''); setCAddr(''); setCPiva(''); setCEmail('');
    setUnitValue(''); setModelloIdx('');
    setV1(0); setV2(0); setV3(0); setVQty(1);
    setDescServizio(''); setIvaCheck(false); setSelectedClient('');
  };

  const showQty = currentModello && (currentModello.fields === 'FISSO' || currentModello.fields === 'FISSO_PERC');

  return (
    <div className="mx-auto max-w-[850px] rounded-lg bg-white p-9 shadow-lg">
      {/* Logo */}
      <div className="mb-5 text-right">
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

        <div className="mb-3 flex items-center gap-2.5">
          <span className="w-[140px] text-[13px] font-bold text-gray-600">Modello:</span>
          <select
            value={modelloIdx}
            onChange={(e) => handleModelloChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
          >
            <option value="">-- Seleziona Modello --</option>
            {currentConfig?.modelli.map((m, i) => (
              <option key={i} value={i}>{m.nome}</option>
            ))}
          </select>
        </div>

        {/* Dynamic fields */}
        {currentModello && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {(currentModello.label || currentModello.label1) && (
              <div>
                <span className="text-[13px] font-bold text-gray-600">
                  {currentModello.label || currentModello.label1}
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
            {currentModello.label3 && (
              <div>
                <span className="text-[13px] font-bold text-gray-600">{currentModello.label3}</span>
                <input
                  type="number"
                  value={v3 || ''}
                  onChange={(e) => setV3(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm"
                />
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
