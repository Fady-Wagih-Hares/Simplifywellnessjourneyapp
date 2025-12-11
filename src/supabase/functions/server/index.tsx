import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-be1ca0a5/health", (c) => {
  return c.json({ status: "ok" });
});

// Mood Tracking
app.post("/make-server-be1ca0a5/mood", async (c) => {
  try {
    const { userId, date, mood } = await c.req.json();
    const key = `mood:${userId}:${date}`;
    await kv.set(key, { mood, timestamp: new Date().toISOString() });
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving mood:', error);
    return c.json({ error: `Failed to save mood: ${error.message}` }, 500);
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
    console.log('Error fetching mood:', error);
    return c.json({ error: `Failed to fetch mood: ${error?.message || 'Unknown error'}` }, 500);
  }
});

// Food Journal
app.post("/make-server-be1ca0a5/meals", async (c) => {
  try {
    const { userId, date, meal } = await c.req.json();
    const key = `meals:${userId}:${date}`;
    const existing = await kv.get(key);
    const meals = existing?.meals || [];
    meals.push({ ...meal, timestamp: new Date().toISOString() });
    await kv.set(key, { meals });
    return c.json({ success: true, data: { meals } });
  } catch (error) {
    console.log('Error saving meal:', error);
    return c.json({ error: `Failed to save meal: ${error.message}` }, 500);
  }
});

app.get("/make-server-be1ca0a5/meals/:userId/:date", async (c) => {
  try {
    const userId = c.req.param('userId');
    const date = c.req.param('date');
    const key = `meals:${userId}:${date}`;
    const data = await kv.get(key);
    return c.json(data || { meals: [] });
  } catch (error) {
    console.log('Error fetching meals:', error);
    return c.json({ error: `Failed to fetch meals: ${error.message}` }, 500);
  }
});

// Hydration Tracking
app.post("/make-server-be1ca0a5/hydration", async (c) => {
  try {
    const { userId, date, amount } = await c.req.json();
    const key = `hydration:${userId}:${date}`;
    const existing = await kv.get(key);
    const entries = existing?.entries || [];
    const currentTotal = existing?.total || 0;
    
    entries.push({ amount, timestamp: new Date().toISOString() });
    const newTotal = currentTotal + parseFloat(amount);
    
    await kv.set(key, { entries, total: newTotal });
    return c.json({ success: true, data: { entries, total: newTotal } });
  } catch (error) {
    console.log('Error saving hydration:', error);
    return c.json({ error: `Failed to save hydration: ${error.message}` }, 500);
  }
});

app.get("/make-server-be1ca0a5/hydration/:userId/:date", async (c) => {
  try {
    const userId = c.req.param('userId');
    const date = c.req.param('date');
    const key = `hydration:${userId}:${date}`;
    const data = await kv.get(key);
    return c.json(data || { entries: [], total: 0 });
  } catch (error) {
    console.log('Error fetching hydration:', error);
    return c.json({ error: `Failed to fetch hydration: ${error.message}` }, 500);
  }
});

// Stats and Progress
app.get("/make-server-be1ca0a5/stats/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const key = `stats:${userId}`;
    const data = await kv.get(key);
    return c.json(data || { daysActive: 0, currentStreak: 0, avgCalories: 0 });
  } catch (error) {
    console.log('Error fetching stats:', error);
    return c.json({ error: `Failed to fetch stats: ${error.message}` }, 500);
  }
});

app.post("/make-server-be1ca0a5/stats", async (c) => {
  try {
    const { userId, stats } = await c.req.json();
    const key = `stats:${userId}`;
    await kv.set(key, stats);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving stats:', error);
    return c.json({ error: `Failed to save stats: ${error.message}` }, 500);
  }
});

// Achievements/Badges
app.get("/make-server-be1ca0a5/achievements/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const key = `achievements:${userId}`;
    const data = await kv.get(key);
    return c.json(data || { badges: [] });
  } catch (error) {
    console.log('Error fetching achievements:', error);
    return c.json({ error: `Failed to fetch achievements: ${error.message}` }, 500);
  }
});

app.post("/make-server-be1ca0a5/achievements", async (c) => {
  try {
    const { userId, badge } = await c.req.json();
    const key = `achievements:${userId}`;
    const existing = await kv.get(key);
    const badges = existing?.badges || [];
    badges.push({ ...badge, earnedAt: new Date().toISOString() });
    await kv.set(key, { badges });
    return c.json({ success: true, data: { badges } });
  } catch (error) {
    console.log('Error saving achievement:', error);
    return c.json({ error: `Failed to save achievement: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);