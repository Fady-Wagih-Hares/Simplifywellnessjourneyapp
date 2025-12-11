import { Zap, Minus, TrendingDown, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { saveMood, getMood, getMeals, getHydration } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface HomeScreenProps {
  onFabClick: () => void;
}

export function HomeScreen({ onFabClick }: HomeScreenProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [todayMeals, setTodayMeals] = useState<any>(null);
  const [todayHydration, setTodayHydration] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moodData, mealsData, hydrationData] = await Promise.all([
        getMood().catch(() => null),
        getMeals().catch(() => ({ meals: [] })),
        getHydration().catch(() => ({ entries: [], total: 0 })),
      ]);
      
      if (moodData?.mood) {
        setSelectedMood(moodData.mood);
      }
      setTodayMeals(mealsData);
      setTodayHydration(hydrationData);
    } catch (error) {
      // Set default values on error
      setTodayMeals({ meals: [] });
      setTodayHydration({ entries: [], total: 0 });
    }
  };

  const handleMoodClick = async (mood: string) => {
    try {
      setSelectedMood(mood);
      await saveMood(mood);
      toast.success('Mood logged! 🌟');
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood');
    }
  };

  // Calculate total calories from meals
  const totalCalories = todayMeals?.meals?.reduce((sum: number, meal: any) => sum + (meal.totalCalories || 0), 0) || 0;
  const calorieGoal = 2000;
  const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);

  // Calculate water progress (assuming 250ml = 1 unit)
  const waterGlasses = Math.round((todayHydration?.total || 0) / 250);
  const waterGoal = 8;
  const waterPercent = Math.min((waterGlasses / waterGoal) * 100, 100);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Friendly Header */}
      <h1 className="text-[var(--text-primary)] mb-8">Good morning ☀️</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Tracker - Spans 2 columns on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm h-full">
            <h2 className="text-[var(--text-primary)] mb-6">How are you feeling?</h2>
            <div className="flex gap-6 justify-start">
              <button 
                onClick={() => handleMoodClick('energized')}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-colors ${
                  selectedMood === 'energized' ? 'bg-[var(--sage-green-light)]' : 'hover:bg-[var(--sage-green-light)]'
                }`}
              >
                <Zap className="w-10 h-10 text-[var(--sage-green)]" />
                <span className="text-[var(--text-secondary)]">Energized</span>
              </button>
              <button 
                onClick={() => handleMoodClick('neutral')}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-colors ${
                  selectedMood === 'neutral' ? 'bg-[var(--sage-green-light)]' : 'hover:bg-[var(--sage-green-light)]'
                }`}
              >
                <Minus className="w-10 h-10 text-[var(--calming-blue)]" />
                <span className="text-[var(--text-secondary)]">Neutral</span>
              </button>
              <button 
                onClick={() => handleMoodClick('sluggish')}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-colors ${
                  selectedMood === 'sluggish' ? 'bg-[var(--sage-green-light)]' : 'hover:bg-[var(--sage-green-light)]'
                }`}
              >
                <TrendingDown className="w-10 h-10 text-[var(--warm-sand)]" />
                <span className="text-[var(--text-secondary)]">Sluggish</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="lg:col-span-1">
          <button
            onClick={onFabClick}
            className="w-full bg-[var(--sage-green)] text-white rounded-3xl p-8 shadow-sm hover:scale-[1.02] transition-transform h-full flex flex-col items-center justify-center gap-3"
          >
            <Plus className="w-10 h-10" />
            <span>Log Food</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[var(--text-secondary)]">Food</span>
            <span className="text-[var(--text-primary)]">{totalCalories} / {calorieGoal} cal</span>
          </div>
          <div className="w-full bg-[var(--sage-green-light)] rounded-full h-3">
            <div className="bg-[var(--sage-green)] h-3 rounded-full" style={{ width: `${caloriePercent}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[var(--text-secondary)]">Water</span>
            <span className="text-[var(--text-primary)]">{waterGlasses} / {waterGoal} glasses</span>
          </div>
          <div className="w-full bg-[var(--calming-blue)]/20 rounded-full h-3">
            <div className="bg-[var(--calming-blue)] h-3 rounded-full" style={{ width: `${waterPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[var(--text-secondary)]">Activity</span>
            <span className="text-[var(--text-primary)]">25 min</span>
          </div>
          <div className="w-full bg-[var(--warm-sand)]/40 rounded-full h-3">
            <div className="bg-[var(--warm-sand)] h-3 rounded-full" style={{ width: '83%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}