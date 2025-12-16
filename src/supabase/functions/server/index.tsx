import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Enable logger with detailed output
app.use('*', logger(console.log));

// Enable CORS for all routes and methods with permissive settings
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: false,
  }),
);

// Database diagnostics endpoint
app.get("/make-server-be1ca0a5/diagnostics", async (c) => {
  console.log('🔍 Running database diagnostics...');
  
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: Deno.env.get('SUPABASE_URL') ? 'Set' : 'Missing',
      supabaseServiceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Set' : 'Missing',
    },
    database: {
      connected: false,
      tableExists: false,
      canWrite: false,
      canRead: false,
    },
    errors: [] as string[],
  };

  try {
    // Check if we can create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      diagnostics.errors.push('Missing required environment variables');
      return c.json(diagnostics, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test database connection by checking if table exists
    const { data: tables, error: tableError } = await supabase
      .from('kv_store_be1ca0a5')
      .select('key')
      .limit(1);
    
    if (tableError) {
      diagnostics.errors.push(`Database table error: ${tableError.message}`);
      console.error('❌ Table check failed:', tableError);
    } else {
      diagnostics.database.connected = true;
      diagnostics.database.tableExists = true;
      console.log('✅ Database table exists and is accessible');
    }

    // Test write operation
    try {
      const testKey = `_diagnostic_test_${Date.now()}`;
      await kv.set(testKey, { test: true, timestamp: new Date().toISOString() });
      diagnostics.database.canWrite = true;
      console.log('✅ Write test passed');
      
      // Test read operation
      const readResult = await kv.get(testKey);
      if (readResult) {
        diagnostics.database.canRead = true;
        console.log('✅ Read test passed');
      }
      
      // Clean up test data
      await kv.del(testKey);
      console.log('✅ Delete test passed');
    } catch (error) {
      diagnostics.errors.push(`Database operations error: ${error.message}`);
      console.error('❌ Database operations failed:', error);
    }

    const success = diagnostics.database.connected && 
                   diagnostics.database.tableExists && 
                   diagnostics.database.canWrite && 
                   diagnostics.database.canRead;

    if (success) {
      console.log('✅ All diagnostics passed - database is fully operational');
    } else {
      console.error('❌ Some diagnostics failed - see details above');
    }

    return c.json(diagnostics, success ? 200 : 500);
  } catch (error) {
    diagnostics.errors.push(`Unexpected error: ${error.message}`);
    console.error('❌ Diagnostics failed with unexpected error:', error);
    return c.json(diagnostics, 500);
  }
});

// Health check endpoint - critical for frontend server detection
app.get("/make-server-be1ca0a5/health", (c) => {
  console.log('Health check requested');
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mood Tracking
app.post("/make-server-be1ca0a5/mood", async (c) => {
  try {
    const { userId, date, mood } = await c.req.json();
    
    if (!userId || !date || !mood) {
      return c.json({ error: 'Missing required fields: userId, date, mood' }, 400);
    }
    
    const key = `mood:${userId}:${date}`;
    await kv.set(key, { mood, timestamp: new Date().toISOString() });
    console.log(`Mood saved successfully for ${userId} on ${date}: ${mood}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving mood:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

app.get("/make-server-be1ca0a5/mood/:userId/:date", async (c) => {
  try {
    const userId = c.req.param('userId');
    const date = c.req.param('date');
    const key = `mood:${userId}:${date}`;
    console.log('Fetching mood with key:', key);
    const data = await kv.get(key);
    console.log('Mood data retrieved:', data);
    return c.json(data || null);
  } catch (error) {
    console.error('Error fetching mood:', error);
    // Return 503 Service Unavailable for database connection issues
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

// Food Journal
app.post("/make-server-be1ca0a5/meals", async (c) => {
  try {
    const { userId, date, meal } = await c.req.json();
    
    if (!userId || !date || !meal) {
      return c.json({ error: 'Missing required fields: userId, date, meal' }, 400);
    }
    
    const key = `meals:${userId}:${date}`;
    const existing = await kv.get(key);
    const meals = existing?.meals || [];
    meals.push({ ...meal, timestamp: new Date().toISOString() });
    await kv.set(key, { meals });
    console.log(`Meal saved successfully for ${userId} on ${date}`);
    return c.json({ success: true, data: { meals } });
  } catch (error) {
    console.error('Error saving meal:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

app.get("/make-server-be1ca0a5/meals/:userId/:date", async (c) => {
  try {
    const userId = c.req.param('userId');
    const date = c.req.param('date');
    const key = `meals:${userId}:${date}`;
    console.log('Fetching meals with key:', key);
    const data = await kv.get(key);
    return c.json(data || { meals: [] });
  } catch (error) {
    console.error('Error fetching meals:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

// Hydration Tracking
app.post("/make-server-be1ca0a5/hydration", async (c) => {
  try {
    const { userId, date, amount } = await c.req.json();
    
    if (!userId || !date || amount === undefined) {
      return c.json({ error: 'Missing required fields: userId, date, amount' }, 400);
    }
    
    const key = `hydration:${userId}:${date}`;
    const existing = await kv.get(key);
    const entries = existing?.entries || [];
    const currentTotal = existing?.total || 0;
    
    entries.push({ amount, timestamp: new Date().toISOString() });
    const newTotal = currentTotal + parseFloat(amount);
    
    await kv.set(key, { entries, total: newTotal });
    console.log(`Hydration saved successfully for ${userId} on ${date}: ${amount}ml`);
    return c.json({ success: true, data: { entries, total: newTotal } });
  } catch (error) {
    console.error('Error saving hydration:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

app.get("/make-server-be1ca0a5/hydration/:userId/:date", async (c) => {
  try {
    const userId = c.req.param('userId');
    const date = c.req.param('date');
    const key = `hydration:${userId}:${date}`;
    console.log('Fetching hydration with key:', key);
    const data = await kv.get(key);
    return c.json(data || { entries: [], total: 0 });
  } catch (error) {
    console.error('Error fetching hydration:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

// Stats and Progress
app.get("/make-server-be1ca0a5/stats/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const key = `stats:${userId}`;
    console.log('Fetching stats with key:', key);
    const data = await kv.get(key);
    return c.json(data || { daysActive: 0, currentStreak: 0, avgCalories: 0 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

app.post("/make-server-be1ca0a5/stats", async (c) => {
  try {
    const { userId, stats } = await c.req.json();
    
    if (!userId || !stats) {
      return c.json({ error: 'Missing required fields: userId, stats' }, 400);
    }
    
    const key = `stats:${userId}`;
    await kv.set(key, stats);
    console.log(`Stats saved successfully for ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving stats:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

// Achievements/Badges
app.get("/make-server-be1ca0a5/achievements/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const key = `achievements:${userId}`;
    console.log('Fetching achievements with key:', key);
    const data = await kv.get(key);
    return c.json(data || { badges: [] });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

app.post("/make-server-be1ca0a5/achievements", async (c) => {
  try {
    const { userId, badge } = await c.req.json();
    
    if (!userId || !badge) {
      return c.json({ error: 'Missing required fields: userId, badge' }, 400);
    }
    
    const key = `achievements:${userId}`;
    const existing = await kv.get(key);
    const badges = existing?.badges || [];
    badges.push({ ...badge, earnedAt: new Date().toISOString() });
    await kv.set(key, { badges });
    console.log(`Achievement saved successfully for ${userId}: ${badge.title}`);
    return c.json({ success: true, data: { badges } });
  } catch (error) {
    console.error('Error saving achievement:', error);
    return c.json({ 
      error: `Database connection failed: ${error?.message || 'Unknown error'}` 
    }, 503);
  }
});

Deno.serve(app.fetch);