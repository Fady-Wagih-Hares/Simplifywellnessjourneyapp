import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-be1ca0a5`;

// Simple user ID for demo - in production, this would come from auth
const USER_ID = 'demo-user';

// Flag to track if server is available
let serverAvailable = true;

// LocalStorage keys
const STORAGE_KEYS = {
  MOOD: 'wellness_mood',
  MEALS: 'wellness_meals',
  HYDRATION: 'wellness_hydration',
  STATS: 'wellness_stats',
  ACHIEVEMENTS: 'wellness_achievements',
};

// LocalStorage helpers
const getFromStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

const setInStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  if (!serverAvailable) {
    throw new Error('Server unavailable, using local storage');
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If server error, switch to local storage mode
      if (response.status >= 500) {
        serverAvailable = false;
        console.log('⚠️ Server unavailable - using localStorage for data persistence');
      }
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // Switch to local storage on network errors
    if (serverAvailable) {
      serverAvailable = false;
      console.log('⚠️ Server unavailable - using localStorage for data persistence');
    }
    throw error;
  }
};

// Get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split('T')[0];

// Mood Tracking
export const saveMood = async (mood: string) => {
  try {
    return await fetchAPI('/mood', {
      method: 'POST',
      body: JSON.stringify({ userId: USER_ID, date: getToday(), mood }),
    });
  } catch (error) {
    // Fallback to localStorage
    const moodData = getFromStorage(STORAGE_KEYS.MOOD, {});
    const date = getToday();
    moodData[date] = { mood, timestamp: new Date().toISOString() };
    setInStorage(STORAGE_KEYS.MOOD, moodData);
    return { success: true };
  }
};

export const getMood = async (date?: string) => {
  try {
    const dateStr = date || getToday();
    return await fetchAPI(`/mood/${USER_ID}/${dateStr}`);
  } catch (error) {
    // Fallback to localStorage
    const moodData = getFromStorage(STORAGE_KEYS.MOOD, {});
    const dateStr = date || getToday();
    return moodData[dateStr] || null;
  }
};

// Food Journal
export const addMeal = async (meal: { 
  name: string; 
  type: string; 
  items: { name: string; calories: number }[];
  totalCalories: number;
}) => {
  try {
    return await fetchAPI('/meals', {
      method: 'POST',
      body: JSON.stringify({ userId: USER_ID, date: getToday(), meal }),
    });
  } catch (error) {
    // Fallback to localStorage
    const mealsData = getFromStorage(STORAGE_KEYS.MEALS, {});
    const date = getToday();
    if (!mealsData[date]) {
      mealsData[date] = { meals: [] };
    }
    mealsData[date].meals.push({ ...meal, timestamp: new Date().toISOString() });
    setInStorage(STORAGE_KEYS.MEALS, mealsData);
    return { success: true, data: mealsData[date] };
  }
};

export const getMeals = async (date?: string) => {
  try {
    const dateStr = date || getToday();
    return await fetchAPI(`/meals/${USER_ID}/${dateStr}`);
  } catch (error) {
    // Fallback to localStorage
    const mealsData = getFromStorage(STORAGE_KEYS.MEALS, {});
    const dateStr = date || getToday();
    return mealsData[dateStr] || { meals: [] };
  }
};

// Hydration Tracking
export const addHydration = async (amount: number) => {
  try {
    return await fetchAPI('/hydration', {
      method: 'POST',
      body: JSON.stringify({ userId: USER_ID, date: getToday(), amount }),
    });
  } catch (error) {
    // Fallback to localStorage
    const hydrationData = getFromStorage(STORAGE_KEYS.HYDRATION, {});
    const date = getToday();
    if (!hydrationData[date]) {
      hydrationData[date] = { entries: [], total: 0 };
    }
    hydrationData[date].entries.push({ amount, timestamp: new Date().toISOString() });
    hydrationData[date].total += parseFloat(amount.toString());
    setInStorage(STORAGE_KEYS.HYDRATION, hydrationData);
    return { success: true, data: hydrationData[date] };
  }
};

export const getHydration = async (date?: string) => {
  try {
    const dateStr = date || getToday();
    return await fetchAPI(`/hydration/${USER_ID}/${dateStr}`);
  } catch (error) {
    // Fallback to localStorage
    const hydrationData = getFromStorage(STORAGE_KEYS.HYDRATION, {});
    const dateStr = date || getToday();
    return hydrationData[dateStr] || { entries: [], total: 0 };
  }
};

// Stats and Progress
export const getStats = async () => {
  try {
    return await fetchAPI(`/stats/${USER_ID}`);
  } catch (error) {
    // Fallback to localStorage
    return getFromStorage(STORAGE_KEYS.STATS, { 
      daysActive: 0, 
      currentStreak: 0, 
      avgCalories: 0 
    });
  }
};

export const updateStats = async (stats: {
  daysActive: number;
  currentStreak: number;
  avgCalories: number;
}) => {
  try {
    return await fetchAPI('/stats', {
      method: 'POST',
      body: JSON.stringify({ userId: USER_ID, stats }),
    });
  } catch (error) {
    // Fallback to localStorage
    setInStorage(STORAGE_KEYS.STATS, stats);
    return { success: true };
  }
};

// Achievements
export const getAchievements = async () => {
  try {
    return await fetchAPI(`/achievements/${USER_ID}`);
  } catch (error) {
    // Fallback to localStorage
    return getFromStorage(STORAGE_KEYS.ACHIEVEMENTS, { badges: [] });
  }
};

export const addAchievement = async (badge: {
  title: string;
  emoji: string;
  description: string;
}) => {
  try {
    return await fetchAPI('/achievements', {
      method: 'POST',
      body: JSON.stringify({ userId: USER_ID, badge }),
    });
  } catch (error) {
    // Fallback to localStorage
    const achievementsData = getFromStorage(STORAGE_KEYS.ACHIEVEMENTS, { badges: [] });
    achievementsData.badges.push({ ...badge, earnedAt: new Date().toISOString() });
    setInStorage(STORAGE_KEYS.ACHIEVEMENTS, achievementsData);
    return { success: true, data: achievementsData };
  }
};