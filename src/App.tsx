import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { FoodJournal } from './components/FoodJournal';
import { HydrationTracker } from './components/HydrationTracker';
import { JourneyScreen } from './components/JourneyScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SideNav } from './components/SideNav';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Toaster } from './components/ui/sonner';
import { checkServerConnection } from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFabClick = () => {
    setActiveTab('journal');
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--bg-soft)] flex">
        <SideNav activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 ml-64">
          {activeTab === 'home' && <HomeScreen key={refreshTrigger} onFabClick={handleFabClick} />}
          {activeTab === 'journal' && <FoodJournal onMealAdded={triggerRefresh} />}
          {activeTab === 'hydration' && <HydrationTracker onHydrationAdded={triggerRefresh} />}
          {activeTab === 'journey' && <JourneyScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
        </main>
      </div>
      <ConnectionStatus checkConnection={checkServerConnection} />
      <Toaster position="top-right" />
    </>
  );
}