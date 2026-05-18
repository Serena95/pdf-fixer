export interface Modello {
  nome: string;
  fields: 'FISSO' | 'FISSO_PERC' | 'CANONE' | 'PACCHETTO' | 'MIX' | 'CAMPAGNA' | 'CATALOGO_FIN' | 'CATALOGO_CANONE' | 'CATALOGO_PIANO';
  label?: string;
  label1?: string;
  label2?: string;
  label3?: string;
  hasTipoUnita?: boolean;
  hasDataInizio?: boolean;
  // CATALOGO_FIN specific
  codice?: string;
  compensoFisso?: number;
  compensoFisso2?: number;
  compensoFisso2Label?: string;
  successFeePerc?: number;
  descrizioneOperativa?: string;
  fasiPagamento?: string[];
  // CATALOGO_CANONE specific (fixed monthly plans)
  canoneMensile?: number;
  titoloServizio?: string;
  // CATALOGO_PIANO specific (commercial plans with fixed/variable total)
  importoFisso?: number;
  variabile?: boolean;
  displayImporto?: string;
  obiettiviGarantiti?: Array<{ label: string; contributi: string; finanziamenti: string }>;
}

export interface UnitConfig {
  bg: string;
  border: string;
  modelli: Modello[];
}

export const unitConfig: Record<string, UnitConfig> = {
  'CK-00': {
    bg: '#fafafa',
    border: '#9e9e9e',
    modelli: [],
  },
  'CK-01': {
    bg: '#e3f2fd',
    border: '#004a99',
    modelli: [
      {
        nome: 'Resto al Sud 2.0',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01-FIN-PRD-Resto al Sud 2.0',
        compensoFisso: 1000,
        successFeePerc: 7,
        descrizioneOperativa: 'Assistenza tecnica per l\'intero iter Resto al Sud 2.0 dalla predisposizione della domanda alla rendicontazione.',
        fasiPagamento: ['€ 1.000,00 alla conferma incarico', '7% success fee su importo finanziato'],
      },
      {
        nome: 'Smart&Start Italia',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01-FIN-PRD-Smart&Start Italia',
        compensoFisso: 2500,
        successFeePerc: 7,
        descrizioneOperativa: 'Assistenza tecnica per l\'intero iter Smart&Start Italia dalla predisposizione della domanda alla rendicontazione.',
        fasiPagamento: ['€ 2.500,00 alla conferma incarico', '7% success fee su importo finanziato'],
      },
      {
        nome: 'SIMEST',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01-FIN-PRD-Simest',
        compensoFisso: 1500,
        successFeePerc: 7,
        descrizioneOperativa: 'Assistenza tecnica per l\'intero iter SIMEST dalla predisposizione della domanda alla rendicontazione.',
        fasiPagamento: ['€ 1.500,00 alla conferma incarico', '7% success fee su importo finanziato'],
      },
      {
        nome: 'ON – Oltre Nuove Imprese a Tasso Zero',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01-FIN-PRD-ON',
        compensoFisso: 2500,
        successFeePerc: 7,
        descrizioneOperativa: 'Assistenza tecnica per l\'intero iter ON – Oltre Nuove Imprese a Tasso Zero dalla predisposizione della domanda alla rendicontazione.',
        fasiPagamento: ['€ 2.500,00 alla conferma incarico', '7% success fee su importo finanziato'],
      },
      {
        nome: 'Italia Economia Sociale',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01-FIN-PRD-Italia Economia Sociale',
        compensoFisso: 2500,
        successFeePerc: 7,
        descrizioneOperativa: 'Assistenza tecnica per l\'intero iter Italia Economia Sociale dalla predisposizione della domanda alla rendicontazione.',
        fasiPagamento: ['€ 2.500,00 alla conferma incarico', '7% success fee su importo finanziato'],
      },
      {
        nome: 'Bando Imprese Sud MASE',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01-FIN-PRD_BANDO IMPRESE SUD_MASE',
        compensoFisso: 2500,
        successFeePerc: 7,
        descrizioneOperativa: 'Assistenza tecnica per l\'intero iter del Bando Imprese Sud dalla predisposizione della domanda fino alla presentazione degli allegati e approvazione.',
        fasiPagamento: ['€ 2.500,00 al conferimento incarico', '7% success fee su importo deliberato'],
      },
      {
        nome: 'Bando ISI INAIL 2026',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01_FIN_Bando ISI INAIL',
        compensoFisso: 1500,
        compensoFisso2: 1000,
        compensoFisso2Label: 'Alla comunicazione di ammissione',
        successFeePerc: 7,
        descrizioneOperativa: 'Assistenza tecnica per l\'intero iter del Bando ISI INAIL 2026 dalla verifica preliminare fino all\'ammissione a finanziamento.',
        fasiPagamento: ['€ 1.500,00 al conferimento incarico', '€ 1.000,00 alla comunicazione di ammissione', '7% success fee su importo deliberato INAIL'],
      },
      {
        nome: 'ZES Unica 2026',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01-FIN-PRD-ZES Unica 2026',
        compensoFisso: 1000,
        successFeePerc: 8,
        descrizioneOperativa: 'Servizio di consulenza specialistica per analisi preliminare, verifica requisiti, definizione del piano di investimento e predisposizione del dossier tecnico-amministrativo relativo alle agevolazioni ZES Unica 2026, con consegna del plico documentale completo per la successiva trasmissione a cura del cliente o dei professionisti incaricati.',
        fasiPagamento: ['€ 1.000,00 alla conferma incarico', '8% success fee su importo deliberato/finanziato'],
      },
      {
        nome: 'Fondo Sostegno Imprese Turismo 2026',
        fields: 'CATALOGO_FIN',
        codice: 'CK-01-FIN-PRD-Fondo Sostegno Imprese Turismo 2026',
        compensoFisso: 2500,
        successFeePerc: 7,
        descrizioneOperativa: 'Servizio di consulenza e assistenza tecnica per candidatura al Fondo Sostegno Imprese Turismo 2026, comprensivo di verifica di ammissibilità, progettazione, predisposizione e gestione della domanda Invitalia, supporto istruttorio, monitoraggio e rendicontazione finale del progetto.',
        fasiPagamento: ['€ 2.500,00 alla conferma incarico', '7% success fee su importo deliberato/finanziato'],
      },
      {
        nome: 'CK-01 VERDE — Maestrale 10K',
        fields: 'CATALOGO_PIANO',
        codice: 'CK-01-FIN-PIANO-VERDE-Maestrale10K',
        titoloServizio: 'Maestrale 10K — Consulenza Continuativa',
        importoFisso: 10000,
        displayImporto: '10K + IVA',
        descrizioneOperativa: 'Servizio di consulenza continuativa in finanza agevolata — pacchetto "Maestrale 10K".\n\nAttività comprese:\n• Analisi dimensionale dell\'azienda ed elenco delle agevolazioni aperte e/o in apertura\n• Analisi pre-fattibilità dei progetti d\'investimento\n• Progettazione e presentazione delle misure agevolative individuate e condivise con il cliente\n• Istruttoria delle domande ed assistenza tecnica alla presentazione\n• Rendicontazione delle misure\n• Garanzia di risultato minimo (vedi tabella obiettivi)\n\nCosto contratto: € 10.000,00 + IVA',
        obiettiviGarantiti: [
          { label: 'OBIETTIVO MIN. GARANTITO 1', contributi: '€ 20.000,00', finanziamenti: '€ 0,00' },
          { label: 'OBIETTIVO MIN. GARANTITO 2', contributi: '€ 0,00', finanziamenti: '€ 50.000,00' },
        ],
      },
      {
        nome: 'CK-01 BIANCO — Grecale 20K',
        fields: 'CATALOGO_PIANO',
        codice: 'CK-01-FIN-PIANO-BIANCO-Grecale20K',
        titoloServizio: 'Grecale 20K — Consulenza Continuativa',
        importoFisso: 20000,
        displayImporto: '20K + IVA',
        descrizioneOperativa: 'Servizio di consulenza continuativa in finanza agevolata — pacchetto "Grecale 20K".\n\nAttività comprese:\n• Analisi dimensionale dell\'azienda ed elenco delle agevolazioni aperte e/o in apertura\n• Analisi pre-fattibilità dei progetti d\'investimento\n• Progettazione e presentazione delle misure agevolative individuate e condivise con il cliente\n• Istruttoria delle domande ed assistenza tecnica alla presentazione\n• Rendicontazione delle misure\n• Garanzia di risultato minimo (vedi tabella obiettivi)\n\nCosto contratto: € 20.000,00 + IVA',
        obiettiviGarantiti: [
          { label: 'OBIETTIVO MIN. GARANTITO 1', contributi: '€ 45.000,00', finanziamenti: '€ 0,00' },
          { label: 'OBIETTIVO MIN. GARANTITO 2', contributi: '€ 0,00', finanziamenti: '€ 120.000,00' },
        ],
      },
      {
        nome: 'CK-01 ROSSO — Scirocco',
        fields: 'CATALOGO_PIANO',
        codice: 'CK-01-FIN-PIANO-ROSSO-Scirocco',
        titoloServizio: 'Scirocco — Consulenza Continuativa Custom',
        variabile: true,
        displayImporto: 'Importo variabile + IVA',
        descrizioneOperativa: 'Servizio di consulenza continuativa in finanza agevolata — pacchetto "Scirocco", soluzione personalizzata sulle esigenze del cliente.\n\nAttività comprese:\n• Analisi dimensionale dell\'azienda ed elenco delle agevolazioni aperte e/o in apertura\n• Analisi pre-fattibilità dei progetti d\'investimento\n• Progettazione e presentazione delle misure agevolative individuate e condivise con il cliente\n• Istruttoria delle domande ed assistenza tecnica alla presentazione\n• Rendicontazione delle misure\n• Garanzia di risultato minimo (obiettivi da definire con il cliente — vedi tabella)\n\nCosto contratto: variabile su esigenza del cliente + IVA',
        obiettiviGarantiti: [
          { label: 'OBIETTIVO MIN. GARANTITO 1', contributi: 'Da definire', finanziamenti: '€ 0,00' },
          { label: 'OBIETTIVO MIN. GARANTITO 2', contributi: '€ 0,00', finanziamenti: 'Da definire' },
        ],
      },
    ],
  },
  'CK-02': {
    bg: '#f1f8e9',
    border: '#2e7d32',
    modelli: [
      { nome: 'Solo Fisso', fields: 'FISSO', label: 'Importo Fisso (€) *' },
      { nome: 'SAL (Stati Avanzamento Lavori)', fields: 'FISSO', label: 'Importo Totale Progetto (€) *' },
      { nome: 'Canone Mensile', fields: 'CANONE', label: 'Importo Canone Mensile (€) *', label2: 'Durata (Mesi)' },
    ],
  },
  'CK-03': {
    bg: '#fff3e0',
    border: '#ef6c00',
    modelli: [
      { nome: 'Solo Fisso', fields: 'FISSO', label: 'Importo Fisso (€) *' },
      { nome: 'Pacchetto Ore/Giornate', fields: 'PACCHETTO', label: 'Numero Ore *', label2: 'Costo Orario (€/ora) *', hasTipoUnita: true },
      { nome: 'Retainer Mensile', fields: 'CANONE', label: 'Importo Retainer Mensile (€) *', label2: 'Mesi' },
    ],
  },
  'CK-04': {
    bg: '#f3e5f5',
    border: '#7b1fa2',
    modelli: [
      {
        nome: 'CK-04 VERDE — Comunicazione Istituzionale Base',
        fields: 'CATALOGO_CANONE',
        codice: 'CK-04-MKT-VERDE',
        titoloServizio: 'Comunicazione Istituzionale Base',
        canoneMensile: 1000,
        descrizioneOperativa: 'Strategia editoriale di base, gestione social istituzionale, 4–6 contenuti mensili, copywriting, revisione materiali e report attività. Pensato per enti che desiderano una comunicazione più chiara, ordinata e continuativa.',
      },
      {
        nome: 'CK-04 BIANCO — Marketing Territoriale & Storytelling',
        fields: 'CATALOGO_CANONE',
        codice: 'CK-04-MKT-BIANCO',
        titoloServizio: 'Marketing Territoriale & Storytelling',
        canoneMensile: 1500,
        descrizioneOperativa: 'Include il Piano Verde + storytelling territoriale, rubriche editoriali, 8–10 contenuti mensili, 2 video base, comunicazione eventi, coordinamento stakeholder e valorizzazione narrativa del territorio.',
      },
      {
        nome: 'CK-04 ROSSO — Strategia, AI & Innovazione Pubblica',
        fields: 'CATALOGO_CANONE',
        codice: 'CK-04-MKT-ROSSO',
        titoloServizio: 'Strategia, AI & Innovazione Pubblica',
        canoneMensile: 2000,
        descrizioneOperativa: 'Include il Piano Bianco + strategia di posizionamento, 12–14 contenuti mensili, video storytelling premium, strumenti AI per semplificazione comunicativa, supporto PR, campagne tematiche e valorizzazione progettuale dell\'Ente.',
      },
      { nome: 'Canone Mensile', fields: 'CANONE', label: 'Importo Canone Mensile (€) *', label2: 'Durata (Mesi) *', hasDataInizio: true },
      { nome: 'Campagna Una Tantum', fields: 'CAMPAGNA', label: 'Importo Totale Campagna (€) *', label2: 'Numero Tranche' },
      { nome: 'Mix (Setup + Canone)', fields: 'MIX', label: 'Setup Fee (€)', label2: 'Importo Canone Mensile (€)' },
    ],
  },
  'CK-05': {
    bg: '#eceff1',
    border: '#455a64',
    modelli: [
      { nome: 'Catalogo Prodotto/Servizio', fields: 'FISSO', label: 'Importo da Catalogo (€) *' },
      { nome: 'Convenzione Ricorrente', fields: 'CANONE', label: 'Canone Convenzione (€) *', label2: 'Mesi' },
    ],
  },
};

export const unitOptions = [
  { value: 'CK-00 GEN - Generale', label: 'CK-00 GEN - Generale' },
  { value: 'CK-01 FIN - Finanza Agevolata', label: 'CK-01 FIN - Finanza Agevolata' },
  { value: 'CK-02 DIG - Servizi Digitali', label: 'CK-02 DIG - Servizi Digitali' },
  { value: 'CK-03 CONS - Consulenze', label: 'CK-03 CONS - Consulenze' },
  { value: 'CK-04 MKT - Comunicazione e Marketing', label: 'CK-04 MKT - Comunicazione e Marketing' },
  { value: 'CK-05 PRO - Servizi alle imprese / Prodotti / Convenzioni', label: 'CK-05 PRO - Servizi alle imprese / Prodotti / Convenzioni' },
];

export function calcTotal(
  fields: string,
  v1: number,
  v2: number,
  v3: number,
  qty: number
): number {
  if (fields === 'FISSO') return v1 * qty;
  if (fields === 'FISSO_PERC') return v1 * qty;
  if (fields === 'CANONE' || fields === 'PACCHETTO') return v1 * v2;
  if (fields === 'MIX') return v1 + v2;
  if (fields === 'CAMPAGNA') return v1;
  // CATALOGO_FIN: calculated separately in PageCompila
  return 0;
}
