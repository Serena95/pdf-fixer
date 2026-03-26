export interface Modello {
  nome: string;
  fields: 'FISSO' | 'FISSO_PERC' | 'CANONE' | 'PACCHETTO' | 'MIX';
  label?: string;
  label1?: string;
  label2?: string;
  label3?: string;
}

export interface UnitConfig {
  bg: string;
  border: string;
  modelli: Modello[];
}

export const unitConfig: Record<string, UnitConfig> = {
  'CK-01': {
    bg: '#e3f2fd',
    border: '#004a99',
    modelli: [
      { nome: 'Pagamento SOLO FISSO', fields: 'FISSO', label: 'Importo Fisso (€) *' },
      { nome: 'Fee fissa + % su deliberato', fields: 'FISSO_PERC', label1: 'Fee Ingresso (€) *', label2: 'Percentuale su Deliberato (%) *' },
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
      { nome: 'Pacchetto Ore/Giornate', fields: 'PACCHETTO', label: 'Costo Unitario (€) *', label2: 'Quantità Ore/Giorni' },
      { nome: 'Retainer Mensile', fields: 'CANONE', label: 'Importo Retainer Mensile (€) *', label2: 'Mesi' },
    ],
  },
  'CK-04': {
    bg: '#f3e5f5',
    border: '#7b1fa2',
    modelli: [
      { nome: 'Canone Mensile', fields: 'CANONE', label: 'Importo Mensile (€) *', label2: 'Mesi' },
      { nome: 'Campagna Una Tantum', fields: 'FISSO', label: 'Importo Campagna (€) *' },
      { nome: 'Mix (Setup + Canone)', fields: 'MIX', label: 'Setup Fee (€) *', label2: 'Canone Mensile (€) *', label3: 'Mesi' },
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
  { value: 'CK-01 FIN - Finanza Agevolata', label: 'CK-01 FIN - Finanza Agevolata' },
  { value: 'CK-02 DIGITALE', label: 'CK-02 DIGITALE' },
  { value: 'CK-03 CONSULENZA', label: 'CK-03 CONSULENZA' },
  { value: 'CK-04 MARKETING', label: 'CK-04 MARKETING' },
  { value: 'CK-05 PRODOTTI', label: 'CK-05 PRODOTTI' },
];

export function calcTotal(
  fields: string,
  v1: number,
  v2: number,
  v3: number,
  qty: number
): number {
  if (fields === 'FISSO') return v1 * qty;
  if (fields === 'FISSO_PERC') return (v1 + v3 * (v2 / 100)) * qty;
  if (fields === 'CANONE' || fields === 'PACCHETTO') return v1 * v2;
  if (fields === 'MIX') return v1 + v2 * v3;
  return 0;
}
