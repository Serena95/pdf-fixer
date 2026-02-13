import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { preventivoSchema } from '@/lib/validation';

export interface Preventivo {
  id: string;
  numero: string;
  cliente: string;
  totale: number;
  data: string;
  unit: string;
  modello: string;
  descrizione: string;
  imponibile: number;
  iva_applicata: boolean;
}

export function usePreventivi() {
  return useQuery({
    queryKey: ['preventivi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preventivi')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Preventivo[];
    },
  });
}

export function useAddPreventivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<Preventivo, 'id'>) => {
      const validated = preventivoSchema.parse(p) as Omit<Preventivo, 'id'>;
      const { data, error } = await supabase.from('preventivi').insert(validated).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['preventivi'] }),
  });
}

export function useDeletePreventivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('preventivi').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['preventivi'] }),
  });
}
