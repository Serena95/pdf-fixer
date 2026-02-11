import { useClienti, useDeleteCliente } from '@/hooks/useClienti';
import { toast } from 'sonner';

export default function PageClienti() {
  const { data: clienti = [], isLoading } = useClienti();
  const deleteCliente = useDeleteCliente();

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
            <span>{c.nome}</span>
            <button
              onClick={() => handleDelete(c.id)}
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
