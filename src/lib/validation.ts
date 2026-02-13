import { z } from 'zod';

export const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome richiesto').max(255, 'Nome troppo lungo'),
  indirizzo: z.string().max(500, 'Indirizzo troppo lungo').default(''),
  piva: z.string().max(50, 'P.IVA troppo lunga').default(''),
  email: z.string().email('Email non valida').or(z.literal('')).default(''),
});

export const preventivoSchema = z.object({
  numero: z.string().min(1, 'Numero richiesto').max(50, 'Numero troppo lungo'),
  cliente: z.string().min(1, 'Cliente richiesto').max(255, 'Nome cliente troppo lungo'),
  totale: z.number().min(0, 'Totale deve essere positivo'),
  data: z.string().min(1, 'Data richiesta'),
  unit: z.string().max(100).default(''),
  modello: z.string().max(100).default(''),
  descrizione: z.string().max(2000, 'Descrizione troppo lunga').default(''),
  imponibile: z.number().min(0, 'Imponibile deve essere positivo'),
  iva_applicata: z.boolean(),
});
