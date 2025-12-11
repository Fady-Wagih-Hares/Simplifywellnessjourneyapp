import { Home, BookOpen, TrendingUp, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--sage-green-light)] px-4 py-3 safe-area-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors"
            >
              <Icon 
                className={`w-6 h-6 ${
                  isActive ? 'text-[var(--sage-green)]' : 'text-[var(--text-secondary)]'
                }`} 
              />
              <span 
                className={`text-xs ${
                  isActive ? 'text-[var(--sage-green)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
