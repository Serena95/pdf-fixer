import { useState, useCallback } from 'react';
import NavBar from '@/components/NavBar';
import PageCompila from '@/components/PageCompila';
import PageArchivio from '@/components/PageArchivio';
import PageClienti from '@/components/PageClienti';

export interface ClientePreload {
  nome: string;
  indirizzo: string;
  piva: string;
  email: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('compila');
  const [preloadCliente, setPreloadCliente] = useState<ClientePreload | null>(null);

  const handleSelectClientForPreventivo = useCallback((cliente: ClientePreload) => {
    setPreloadCliente(cliente);
    setActiveTab('compila');
  }, []);

  const handleClienteConsumed = useCallback(() => {
    setPreloadCliente(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-5">
        {activeTab === 'compila' && (
          <PageCompila preloadCliente={preloadCliente} onClienteConsumed={handleClienteConsumed} />
        )}
        {activeTab === 'archivio' && <PageArchivio />}
        {activeTab === 'clienti' && <PageClienti onSelectForPreventivo={handleSelectClientForPreventivo} />}
      </div>
    </div>
  );
};

export default Index;
