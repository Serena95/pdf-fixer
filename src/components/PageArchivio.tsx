import { usePreventivi, useDeletePreventivo } from '@/hooks/usePreventivi';
import { toast } from 'sonner';

export default function PageArchivio() {
  const { data: preventivi = [], isLoading } = usePreventivi();
  const deletePreventivo = useDeletePreventivo();

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare preventivo?')) return;
    try {
      await deletePreventivo.mutateAsync(id);
      toast.success('Preventivo eliminato');
    } catch {
      toast.error('Errore eliminazione');
    }
  };

  return (
    <div className="mx-auto max-w-[850px] rounded-lg bg-white p-9 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-[#004a99]">Archivio</h2>
      {isLoading ? (
        <p className="text-gray-500">Caricamento...</p>
      ) : preventivi.length === 0 ? (
        <p className="text-gray-500">Nessun preventivo salvato.</p>
      ) : (
        preventivi.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between border-b border-gray-200 px-2 py-3"
          >
            <span>
              <strong>{p.numero}</strong> - {p.cliente} (€{' '}
              {Number(p.totale).toLocaleString('it-IT', { minimumFractionDigits: 2 })})
            </span>
            <button
              onClick={() => handleDelete(p.id)}
              className="rounded bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-600"
            >
              Elimina
            </button>
          </div>
        ))
      )}
    </div>
  );
}
