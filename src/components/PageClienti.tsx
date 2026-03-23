import { useState } from 'react';
import { useClienti, useDeleteCliente } from '@/hooks/useClienti';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ClientePreload } from '@/pages/Index';

type Cliente = { id: string; nome: string; indirizzo: string | null; piva: string | null; email: string | null };

interface Props {
  onSelectForPreventivo?: (cliente: ClientePreload) => void;
}

export default function PageClienti({ onSelectForPreventivo }: Props) {
  const { data: clienti = [], isLoading } = useClienti();
  const deleteCliente = useDeleteCliente();
  const [selected, setSelected] = useState<Cliente | null>(null);
  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare cliente?')) return;
    try {
      await deleteCliente.mutateAsync(id);
      toast.success('Cliente eliminato');
    } catch {
      toast.error('Errore eliminazione');
    }
  };

  return (
    <div className="mx-auto max-w-[850px] rounded-lg bg-white p-9 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-[#004a99]">Anagrafica Clienti</h2>
      {isLoading ? (
        <p className="text-gray-500">Caricamento...</p>
      ) : clienti.length === 0 ? (
        <p className="text-gray-500">Nessun cliente salvato.</p>
      ) : (
        clienti.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between border-b border-gray-200 px-2 py-3"
          >
            <span
              className="cursor-pointer font-medium hover:text-[#004a99] hover:underline"
              onClick={() => onSelectForPreventivo?.({
                nome: c.nome,
                indirizzo: c.indirizzo || '',
                piva: c.piva || '',
                email: c.email || '',
              })}
            >
              {c.nome}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onSelectForPreventivo?.({
                  nome: c.nome,
                  indirizzo: c.indirizzo || '',
                  piva: c.piva || '',
                  email: c.email || '',
                })}
                className="rounded bg-green-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-green-700"
              >
                📝 Usa per Preventivo
              </button>
              <button
                onClick={() => setSelected(c as Cliente)}
                className="rounded bg-[#004a99] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#003d80]"
              >
                👁 Dettagli
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="rounded bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-600"
              >
                Elimina
              </button>
            </div>
          </div>
        ))
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[#004a99]">{selected?.nome}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-gray-500">Indirizzo</span>
                <p className="font-medium">{selected.indirizzo || '—'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-500">P.IVA</span>
                <p className="font-medium">{selected.piva || '—'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Email</span>
                <p className="font-medium">{selected.email || '—'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
