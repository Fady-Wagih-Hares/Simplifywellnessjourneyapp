import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStats, getAchievements } from '../utils/api';

export function JourneyScreen() {
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, achievementsData] = await Promise.all([
        getStats().catch(() => ({ daysActive: 0, currentStreak: 0, avgCalories: 0 })),
        getAchievements().catch(() => ({ badges: [] })),
      ]);
      setStats(statsData);
      setAchievements(achievementsData);
    } catch (error) {
      setStats({ daysActive: 0, currentStreak: 0, avgCalories: 0 });
      setAchievements({ badges: [] });
    }
  };

  const data = [
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 85 },
    { day: 'Wed', value: 75 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 95 },
    { day: 'Sun', value: 88 },
  ];

  const defaultBadges = [
    { title: '3 Day Streak', emoji: '🔥', description: 'Logged meals 3 days in a row' },
    { title: 'Water Goal Met', emoji: '💧', description: 'Reached hydration goal' },
    { title: 'Early Bird', emoji: '🌅', description: 'Logged breakfast before 9 AM' },
    { title: 'Mindful Week', emoji: '🧘', description: 'Tracked mood daily' },
    { title: 'Consistency', emoji: '⭐', description: 'Active for 7 days' },
    { title: 'Balanced Diet', emoji: '🥗', description: 'Varied food choices' },
  ];

  const displayStats = [
    { label: 'Days Active', value: stats?.daysActive?.toString() || '0', color: 'sage-green' },
    { label: 'Current Streak', value: stats?.currentStreak?.toString() || '0', color: 'calming-blue' },
    { label: 'Avg. Daily Calories', value: stats?.avgCalories?.toString() || '0', color: 'warm-sand' },
  ];

  const displayBadges = achievements?.badges?.length > 0 ? achievements.badges : defaultBadges;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-[var(--text-primary)] mb-6">Your Journey</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {displayStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-3xl p-6 shadow-sm text-center">
            <div className="text-[var(--text-secondary)] mb-2">{stat.label}</div>
            <div className={`text-[var(--${stat.color})]`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[var(--text-primary)] mb-6">Weekly Consistency</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <XAxis 
                dataKey="day" 
                stroke="var(--text-secondary)" 
                strokeWidth={0}
                tick={{ fill: 'var(--text-secondary)' }}
              />
              <YAxis hide />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="var(--sage-green)" 
                strokeWidth={3}
                dot={{ fill: 'var(--sage-green)', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Wins Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[var(--text-primary)] mb-6">Recent Wins</h2>
          {displayBadges.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {displayBadges.map((badge: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-[var(--sage-green-light)] rounded-2xl">
                  <span className="text-3xl">{badge.emoji}</span>
                  <div>
                    <div className="text-[var(--text-primary)]">{badge.title}</div>
                    <div className="text-[var(--text-secondary)]">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-[var(--text-secondary)] py-8">
              Start tracking to earn achievements! 🌟
            </div>
          )}
        </div>
      </div>
    </div>
  );
}