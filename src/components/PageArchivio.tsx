import { useState, useMemo } from 'react';
import { usePreventivi, useDeletePreventivo, Preventivo } from '@/hooks/usePreventivi';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { unitConfig } from '@/lib/unitConfig';

function getUnitSubtitle(unit: string | null): string {
  if (!unit) return 'Senza Unit';
  // e.g. "CK-02 DIG - Servizi Digitali" → "Servizi Digitali"
  const dashIdx = unit.indexOf(' - ');
  return dashIdx !== -1 ? unit.substring(dashIdx + 3) : unit;
}

function getUnitKey(unit: string | null): string {
  if (!unit) return '';
  return unit.split(' ')[0]; // e.g. "CK-02"
}

function formatDate(d: string): string {
  const date = new Date(d);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function PageArchivio() {
  const { data: preventivi = [], isLoading } = usePreventivi();
  const deletePreventivo = useDeletePreventivo();
  const [selected, setSelected] = useState<Preventivo | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare preventivo?')) return;
    try {
      await deletePreventivo.mutateAsync(id);
      toast.success('Preventivo eliminato');
    } catch {
      toast.error('Errore eliminazione');
    }
  };

  const fmt = (n: number) =>
    Number(n).toLocaleString('it-IT', { minimumFractionDigits: 2 });

  const grouped = useMemo(() => {
    const sorted = [...preventivi].sort((a, b) => {
      const unitCmp = (a.unit || '').localeCompare(b.unit || '');
      if (unitCmp !== 0) return unitCmp;
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
    const groups: { unit: string; items: Preventivo[] }[] = [];
    for (const p of sorted) {
      const key = p.unit || '';
      const last = groups[groups.length - 1];
      if (last && last.unit === key) {
        last.items.push(p);
      } else {
        groups.push({ unit: key, items: [p] });
      }
    }
    return groups;
  }, [preventivi]);

  return (
    <div className="mx-auto max-w-[850px] rounded-lg bg-white p-9 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-[#004a99]">Archivio</h2>
      {isLoading ? (
        <p className="text-gray-500">Caricamento...</p>
      ) : preventivi.length === 0 ? (
        <p className="text-gray-500">Nessun preventivo salvato.</p>
      ) : (
        grouped.map((group) => {
          const uk = getUnitKey(group.unit);
          const cfg = uk ? unitConfig[uk] : null;
          const subtitle = getUnitSubtitle(group.unit);
          return (
            <div key={group.unit} className="mb-6">
              <div
                className="mb-2 rounded-md px-4 py-2.5"
                style={{
                  background: cfg?.bg || '#f5f5f5',
                  borderLeft: `4px solid ${cfg?.border || '#9e9e9e'}`,
                }}
              >
                <span className="text-sm font-bold" style={{ color: cfg?.border || '#333' }}>
                  {group.unit || 'Senza Unit'}
                </span>
              </div>
              {group.items.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-gray-200 px-3 py-3"
                >
                  <span
                    className="cursor-pointer hover:text-[#004a99] hover:underline"
                    onClick={() => setSelected(p)}
                  >
                    <strong>{p.numero}</strong> – {subtitle} – {formatDate(p.data)} – {p.cliente} (€ {fmt(p.totale)})
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(p)}
                      className="rounded bg-[#004a99] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#003d80]"
                    >
                      👁 Anteprima
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-600"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#004a99]">
              Preventivo {selected?.numero}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <span className="font-semibold text-gray-500">Cliente</span>
                  <p className="font-medium">{selected.cliente}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Data</span>
                  <p className="font-medium">{selected.data}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Unità</span>
                  <p className="font-medium">{selected.unit || '—'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">Modello</span>
                  <p className="font-medium">{selected.modello || '—'}</p>
                </div>
              </div>

              {selected.descrizione && (
                <div>
                  <span className="font-semibold text-gray-500">Descrizione</span>
                  <p className="mt-1 whitespace-pre-wrap rounded bg-gray-50 p-3 text-gray-700">
                    {selected.descrizione}
                  </p>
                </div>
              )}

              <div className="rounded bg-gray-50 p-4">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Imponibile</span>
                  <span className="font-medium">€ {fmt(selected.imponibile)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-2">
                  <span className="text-gray-500">IVA 22%</span>
                  <span className="font-medium">
                    {selected.iva_applicata ? `€ ${fmt(selected.imponibile * 0.22)}` : 'Esente'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-base font-bold">
                  <span>Totale</span>
                  <span className="text-[#004a99]">€ {fmt(selected.totale)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
