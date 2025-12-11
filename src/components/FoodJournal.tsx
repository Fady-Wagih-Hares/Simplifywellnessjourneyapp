import { Search, ScanLine, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMeals, addMeal } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface FoodJournalProps {
  onMealAdded?: () => void;
}

export function FoodJournal({ onMealAdded }: FoodJournalProps) {
  const [todayMeals, setTodayMeals] = useState<any>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealType, setMealType] = useState('Breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');

  const recentFoods = [
    { name: 'Oatmeal with berries', calories: 280 },
    { name: 'Green smoothie', calories: 190 },
    { name: 'Grilled chicken salad', calories: 420 },
    { name: 'Almonds (handful)', calories: 160 },
    { name: 'Greek yogurt', calories: 150 },
    { name: 'Avocado toast', calories: 320 },
  ];

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const data = await getMeals();
      setTodayMeals(data);
    } catch (error) {
      setTodayMeals({ meals: [] });
    }
  };

  const handleQuickAdd = async (food: { name: string; calories: number }) => {
    try {
      await addMeal({
        name: 'Quick Add',
        type: 'Snack',
        items: [{ name: food.name, calories: food.calories }],
        totalCalories: food.calories,
      });
      toast.success(`Added ${food.name}! 🍽️`);
      await loadMeals();
      onMealAdded?.();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Failed to add food');
    }
  };

  const handleAddMeal = async () => {
    if (!mealName || !calories) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const caloriesNum = parseInt(calories);
      await addMeal({
        name: mealType,
        type: mealType,
        items: [{ name: mealName, calories: caloriesNum }],
        totalCalories: caloriesNum,
      });
      toast.success(`${mealType} logged! 🍽️`);
      setShowAddMeal(false);
      setMealName('');
      setCalories('');
      await loadMeals();
      onMealAdded?.();
    } catch (error) {
      console.error('Error adding meal:', error);
      toast.error('Failed to add meal');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-[var(--text-primary)] mb-6">Food Journal</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Search and Recent Foods */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search foods..."
              className="w-full bg-white rounded-3xl px-6 py-4 pr-14 shadow-sm border-none outline-none text-[var(--text-primary)]"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[var(--sage-green-light)] rounded-full hover:bg-[var(--sage-green)] hover:text-white transition-colors">
              <ScanLine className="w-5 h-5 text-[var(--sage-green)]" />
            </button>
          </div>

          {/* Quick Add Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-[var(--text-primary)] mb-4">Recent Foods</h2>
            <div className="space-y-2">
              {recentFoods.map((food, index) => (
                <button 
                  key={index} 
                  onClick={() => handleQuickAdd(food)}
                  className="w-full flex justify-between items-center p-4 rounded-2xl hover:bg-[var(--sage-green-light)] transition-colors"
                >
                  <span className="text-[var(--text-primary)]">{food.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-secondary)]">{food.calories} cal</span>
                    <Plus className="w-4 h-4 text-[var(--sage-green)]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Today's Meals */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-[var(--text-primary)] mb-4">Today's Meals</h2>
          <div className="space-y-6">
            {todayMeals?.meals && todayMeals.meals.length > 0 ? (
              todayMeals.meals.map((meal: any, index: number) => (
                <div key={index} className="pb-6 border-b border-[var(--sage-green-light)] last:border-b-0">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[var(--sage-green)]">{meal.type || meal.name}</h3>
                    <span className="text-[var(--text-primary)]">{meal.totalCalories} cal</span>
                  </div>
                  <div className="space-y-2">
                    {meal.items?.map((item: any, idx: number) => (
                      <div key={idx} className="text-[var(--text-secondary)] pl-4 flex justify-between">
                        <span>• {item.name}</span>
                        <span>{item.calories} cal</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-[var(--text-secondary)] py-8">
                No meals logged yet today
              </div>
            )}
            
            {/* Add Meal Button/Form */}
            {showAddMeal ? (
              <div className="space-y-3 pt-4">
                <select 
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--sage-green-light)] outline-none focus:border-[var(--sage-green)]"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
                <input 
                  type="text"
                  placeholder="Food name"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--sage-green-light)] outline-none focus:border-[var(--sage-green)]"
                />
                <input 
                  type="number"
                  placeholder="Calories"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[var(--sage-green-light)] outline-none focus:border-[var(--sage-green)]"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddMeal}
                    className="flex-1 py-3 rounded-2xl bg-[var(--sage-green)] text-white hover:opacity-90 transition-opacity"
                  >
                    Add
                  </button>
                  <button 
                    onClick={() => setShowAddMeal(false)}
                    className="flex-1 py-3 rounded-2xl border border-[var(--sage-green-light)] text-[var(--text-secondary)] hover:bg-[var(--sage-green-light)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddMeal(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-[var(--sage-green-light)] text-[var(--text-secondary)] hover:border-[var(--sage-green)] hover:text-[var(--sage-green)] transition-colors"
              >
                + Add Meal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}