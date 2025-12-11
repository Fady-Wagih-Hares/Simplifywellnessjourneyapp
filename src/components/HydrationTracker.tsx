import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getHydration, addHydration } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface HydrationTrackerProps {
  onHydrationAdded?: () => void;
}

export function HydrationTracker({ onHydrationAdded }: HydrationTrackerProps) {
  const [hydrationData, setHydrationData] = useState<any>(null);
  
  useEffect(() => {
    loadHydration();
  }, []);

  const loadHydration = async () => {
    try {
      const data = await getHydration();
      setHydrationData(data);
    } catch (error) {
      setHydrationData({ entries: [], total: 0 });
    }
  };

  const handleAddWater = async (amount: number) => {
    try {
      await addHydration(amount);
      toast.success('Water logged! 💧');
      await loadHydration();
      onHydrationAdded?.();
    } catch (error) {
      console.error('Error adding hydration:', error);
      toast.error('Failed to log water');
    }
  };

  const totalMl = hydrationData?.total || 0;
  const waterLevel = Math.min((totalMl / 2000) * 100, 100); // 2000ml goal
  const waterGlasses = Math.round(totalMl / 250);
  
  const quickAddAmounts = [
    { label: '250ml', icon: '💧', amount: 250 },
    { label: '500ml', icon: '💧💧', amount: 500 },
    { label: '1 Glass', icon: '🥛', amount: 250 },
  ];

  const todayHistory = (hydrationData?.entries || []).map((entry: any) => ({
    time: new Date(entry.timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    amount: `${entry.amount}ml`,
  })).reverse();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-[var(--text-primary)] mb-8">Hydration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Bottle Visual */}
        <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center">
          <div className="relative w-40 h-80 bg-white rounded-[50px] shadow-sm overflow-hidden border-4 border-[var(--calming-blue)]/30 mb-6">
            <div 
              className="absolute bottom-0 w-full bg-[var(--calming-blue)]/40 transition-all duration-500"
              style={{ height: `${waterLevel}%` }}
            >
              <div className="w-full h-full bg-gradient-to-t from-[var(--calming-blue)] to-[var(--calming-blue)]/40"></div>
            </div>
          </div>
          <p className="text-[var(--text-primary)]">{waterGlasses} / 8 glasses</p>
          <p className="text-[var(--text-secondary)] mt-2">{totalMl} / 2,000 ml</p>
        </div>

        {/* Quick Add Buttons */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[var(--text-primary)] mb-6">Quick Add</h2>
          <div className="space-y-3">
            {quickAddAmounts.map((item, index) => (
              <button 
                key={index} 
                onClick={() => handleAddWater(item.amount)}
                className="w-full bg-[var(--calming-blue)]/10 rounded-2xl py-5 px-6 shadow-sm flex items-center justify-between hover:bg-[var(--calming-blue)]/20 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[var(--text-primary)]">{item.label}</span>
                </span>
                <Plus className="w-5 h-5 text-[var(--calming-blue)]" />
              </button>
            ))}
          </div>
        </div>

        {/* Today's History */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[var(--text-primary)] mb-6">Today's History</h2>
          {todayHistory.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {todayHistory.map((entry: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-2xl hover:bg-[var(--calming-blue)]/10 transition-colors">
                  <span className="text-[var(--text-secondary)]">{entry.time}</span>
                  <span className="text-[var(--text-primary)]">{entry.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-[var(--text-secondary)] py-8">
              No water logged yet today
            </div>
          )}
        </div>
      </div>
    </div>
  );
}