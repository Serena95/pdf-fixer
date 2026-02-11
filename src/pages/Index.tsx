import { useState } from 'react';
import NavBar from '@/components/NavBar';
import PageCompila from '@/components/PageCompila';
import PageArchivio from '@/components/PageArchivio';
import PageClienti from '@/components/PageClienti';

const Index = () => {
  const [activeTab, setActiveTab] = useState('compila');

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-5">
        {activeTab === 'compila' && <PageCompila />}
        {activeTab === 'archivio' && <PageArchivio />}
        {activeTab === 'clienti' && <PageClienti />}
      </div>
    </div>
  );
};

export default Index;
