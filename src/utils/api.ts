import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-be1ca0a5`;

// Simple user ID for demo - in production, this would come from auth
const USER_ID = 'demo-user';

// Server availability tracking with periodic health checks
let serverAvailable = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
let initialCheckDone = false;
let diagnosticsRun = false;

// LocalStorage keys
const STORAGE_KEYS = {
  MOOD: 'wellness_mood',
  MEALS: 'wellness_meals',
  HYDRATION: 'wellness_hydration',
  STATS: 'wellness_stats',
  ACHIEVEMENTS: 'wellness_achievements',
};

// Check server health
const checkServerHealth = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Always do initial check, then respect interval
  if (initialCheckDone && now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return serverAvailable;
  }
  
  lastHealthCheck = now;
  const wasInitialCheck = !initialCheckDone;
  initialCheckDone = true;
  
  try {
    if (wasInitialCheck) {
      console.log('🔍 Checking Supabase server connection...');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE}/health`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      // Run diagnostics on first successful connection
      if (!diagnosticsRun && wasInitialCheck) {
        diagnosticsRun = true;
        runDiagnostics();
      }
      
      if (!serverAvailable || wasInitialCheck) {
        console.log('✅ Server connection established - using Supabase backend');
        console.log('📊 Health check response:', data);
      }
      serverAvailable = true;
      return true;
    } else {
      if (serverAvailable || wasInitialCheck) {
        console.log(`⚠️ Server health check failed with status ${response.status} - using localStorage for data persistence`);
      }
      serverAvailable = false;
      return false;
    }
  } catch (error) {
    if (serverAvailable || wasInitialCheck) {
      console.log('⚠️ Server unavailable - using localStorage for data persistence');
      if (error instanceof Error) {
        console.log('Error details:', error.message);
      }
    }
    serverAvailable = false;
    return false;
  }
};

// Run diagnostics to check database status
const runDiagnostics = async () => {
  try {
    console.log('🔬 Running database diagnostics...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE}/diagnostics`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const diagnostics = await response.json();
    
    console.log('📋 Database Diagnostics Report:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Environment Variables:', diagnostics.environment);
    console.log('Database Status:', diagnostics.database);
    
    if (diagnostics.errors && diagnostics.errors.length > 0) {
      console.error('❌ Errors detected:');
      diagnostics.errors.forEach((error: string) => {
        console.error(`  - ${error}`);
      });
    }
    
    if (diagnostics.database.connected && 
        diagnostics.database.tableExists && 
        diagnostics.database.canWrite && 
        diagnostics.database.canRead) {
      console.log('✅ Database is fully operational!');
    } else {
      console.error('❌ Database has issues - check the errors above');
      console.error('💡 Possible solutions:');
      if (!diagnostics.database.tableExists) {
        console.error('  1. The kv_store_be1ca0a5 table may not exist');
        console.error('  2. Check your Supabase dashboard and create the table:');
        console.error('     CREATE TABLE kv_store_be1ca0a5 (');
        console.error('       key TEXT NOT NULL PRIMARY KEY,');
        console.error('       value JSONB NOT NULL');
        console.error('     );');
      }
      if (!diagnostics.database.connected) {
        console.error('  1. Check SUPABASE_URL environment variable');
        console.error('  2. Check SUPABASE_SERVICE_ROLE_KEY environment variable');
        console.error('  3. Verify your Supabase project is active');
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Failed to run diagnostics:', error);
  }
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
  // Check server health before attempting request
  await checkServerHealth();
  
  if (!serverAvailable) {
    throw new Error('Server unavailable, using local storage');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      
      // If server error (500-599) or service unavailable (503), switch to local storage mode
      if (response.status >= 500) {
        serverAvailable = false;
        console.log(`⚠️ Server error ${response.status} detected - using localStorage for data persistence`);
      }
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Switch to local storage on network errors
    if (error instanceof Error && error.name !== 'AbortError') {
      if (serverAvailable) {
        serverAvailable = false;
        console.log('⚠️ Network error - using localStorage for data persistence');
      }
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

// Export connection status checker for UI
export const checkServerConnection = async (): Promise<boolean> => {
  // Force a fresh check by resetting the timer
  lastHealthCheck = 0;
  return await checkServerHealth();
};

// Export current connection status
export const isServerConnected = (): boolean => {
  return serverAvailable;
};