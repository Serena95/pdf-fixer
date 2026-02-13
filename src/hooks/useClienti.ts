import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { clienteSchema } from '@/lib/validation';

export interface Cliente {
  id: string;
  nome: string;
  indirizzo: string;
  piva: string;
  email: string;
}

export function useClienti() {
  return useQuery({
    queryKey: ['clienti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data as Cliente[];
    },
  });
}

export function useAddCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: Omit<Cliente, 'id'>) => {
      const validated = clienteSchema.parse(c) as Omit<Cliente, 'id'>;
      const { data, error } = await supabase
        .from('clienti')
        .upsert(validated, { onConflict: 'nome' })
        .select()
        .single();
      if (error) {
        const { data: d2, error: e2 } = await supabase
          .from('clienti')
          .insert(validated)
          .select()
          .single();
        if (e2) throw e2;
        return d2;
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clienti'] }),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clienti').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clienti'] }),
  });
}
