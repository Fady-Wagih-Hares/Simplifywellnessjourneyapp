import { Home, BookOpen, Droplet, TrendingUp, User } from 'lucide-react';

interface SideNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SideNav({ activeTab, onTabChange }: SideNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journal', label: 'Food Journal', icon: BookOpen },
    { id: 'hydration', label: 'Hydration', icon: Droplet },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[var(--sage-green-light)] p-6">
      {/* Logo/Title */}
      <div className="mb-12">
        <h2 className="text-[var(--sage-green)]">The Wellness Journey</h2>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                isActive 
                  ? 'bg-[var(--sage-green-light)] text-[var(--sage-green)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--sage-green-light)]/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
