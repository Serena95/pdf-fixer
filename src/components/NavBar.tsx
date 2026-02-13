import { useAuth } from '@/hooks/useAuth';

interface NavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'compila', label: '📝 COMPILA' },
  { id: 'archivio', label: '📂 ARCHIVIO' },
  { id: 'clienti', label: '👥 CLIENTI' },
];

export default function NavBar({ activeTab, onTabChange }: NavBarProps) {
  const { signOut } = useAuth();

  return (
    <nav className="flex h-14 items-center bg-[#004a99] px-2 shadow-md">
      {tabs.map((t) => (
        <div
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`flex h-full cursor-pointer items-center px-5 text-[13px] font-bold transition-colors ${
            activeTab === t.id
              ? 'bg-[#ffcc00] text-[#004a99]'
              : 'text-white hover:bg-[#003d80]'
          }`}
        >
          {t.label}
        </div>
      ))}
      <div className="ml-auto">
        <button
          onClick={signOut}
          className="text-white text-sm px-4 py-1 hover:bg-[#003d80] rounded"
        >
          🚪 Esci
        </button>
      </div>
    </nav>
  );
}
