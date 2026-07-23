import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Library, 
  BarChart3, 
  Settings, 
  Moon, 
  Sun,
  Plus,
  Heart
} from 'lucide-react';
import { cn } from './lib/utils';
import { Dashboard } from './pages/Dashboard';
import { MediaList } from './pages/MediaList';
import { Statistics } from './pages/Statistics';
import { AddEntryModal } from './components/entry/AddEntryModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'favorites' | 'stats'>('dashboard');

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0a0a0a';
      document.documentElement.style.color = '#fafafa';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#fafafa';
      document.documentElement.style.color = '#0a0a0a';
    }
  }, [isDarkMode]);

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-300 flex",
      isDarkMode ? "bg-[#0A0B0E] text-[#E0E1E6]" : "bg-neutral-50 text-neutral-900"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r flex flex-col transition-colors",
        isDarkMode ? "border-white/5 bg-[#0F1115]" : "border-neutral-200 bg-white/50 backdrop-blur-xl"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-full h-full">
              <rect width="32" height="32" rx="8" className="fill-[#3B82F6]" />
              <path d="M12 10.5C12 9.73 12.83 9.25 13.5 9.63L21.32 14.13C21.99 14.52 21.99 15.48 21.32 15.87L13.5 20.37C12.83 20.75 12 20.27 12 19.5V10.5Z" fill="white" />
              <rect x="3" y="6" width="3" height="4" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="3" y="14" width="3" height="4" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="3" y="22" width="3" height="4" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="26" y="6" width="3" height="4" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="26" y="14" width="3" height="4" rx="1" fill="white" fillOpacity="0.4" />
              <rect x="26" y="22" width="3" height="4" rx="1" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className={cn("text-xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-neutral-900")}>
            AfterCredits
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2 px-2 mt-2">Library</div>
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            isDarkMode={isDarkMode}
          />
          <NavItem 
            icon={<Library className="w-5 h-5" />} 
            label="Library" 
            isActive={activeTab === 'library'} 
            onClick={() => setActiveTab('library')} 
            isDarkMode={isDarkMode}
          />
          <NavItem 
            icon={<Heart className="w-5 h-5" />} 
            label="Favorites" 
            isActive={activeTab === 'favorites'} 
            onClick={() => setActiveTab('favorites')} 
            isDarkMode={isDarkMode}
          />
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2 px-2 mt-6">System</div>
          <NavItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="Statistics" 
            isActive={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
            isDarkMode={isDarkMode}
          />
        </nav>

        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-white/5 text-white/70 hover:text-white" : "hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900"
            )}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden relative">
        <header className={cn(
          "h-20 border-b flex items-center justify-between px-8 shrink-0 transition-colors sticky top-0 z-10 backdrop-blur-md",
          isDarkMode ? "border-white/5 bg-[#0A0B0E]/80" : "border-neutral-200 bg-white/50"
        )}>
          <h1  className={cn("text-2xl font-bold tracking-tight ", isDarkMode ? "text-[#3B82F6]" : "text-neutral-800 ")}>
            {activeTab === 'stats' ? 'Statistics' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors text-xs",
              isDarkMode ? "bg-[#3B82F6] hover:bg-[#2563EB] text-[#0A0B0E]" : "bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full"
            )}
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto w-full h-full">
            {activeTab === 'dashboard' && <Dashboard isDarkMode={isDarkMode} onNavigate={(tab) => setActiveTab(tab as any)} onAdd={() => setIsAddModalOpen(true)} />}
            {activeTab === 'library' && <MediaList isDarkMode={isDarkMode} />}
            {activeTab === 'favorites' && <MediaList isDarkMode={isDarkMode} showOnlyFavorites={true} />}
            {activeTab === 'stats' && <Statistics isDarkMode={isDarkMode} />}
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <AddEntryModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          isDarkMode={isDarkMode} 
        />
      )}
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick, isDarkMode }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, isDarkMode: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all duration-200 w-full text-left text-sm",
        isActive 
          ? (isDarkMode ? "bg-white/5 text-white" : "bg-neutral-100 text-neutral-900")
          : (isDarkMode ? "text-white/70 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900")
      )}
    >
      {isActive && <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>}
      {!isActive && icon}
      {label}
    </button>
  );
}
