import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn, formatMediaType, formatWatchStatus } from '../lib/utils';
import { MediaType, WatchStatus } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export function Statistics({ isDarkMode }: { isDarkMode: boolean }) {
  const entries = useLiveQuery(() => db.media.toArray());

  const stats = useMemo(() => {
    if (!entries) return null;

    const typeCount = entries.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(typeCount).map(([name, value]) => ({
      name: formatMediaType(name as MediaType),
      value
    }));

    const statusCount = entries.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCount).map(([name, value]) => ({
      name: formatWatchStatus(name as WatchStatus),
      value
    }));

    const ratingsCount = entries.reduce((acc, curr) => {
      const r = Math.floor(curr.rating).toString();
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ratingData = Array.from({ length: 11 }, (_, i) => ({
      rating: i.toString(),
      count: ratingsCount[i.toString()] || 0
    }));

    return { typeData, statusData, ratingData };
  }, [entries]);

  if (!stats) return null;

  return (
    <div className="space-y-8 pb-12 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Library Statistics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode ? "bg-[#14161C] border-white/5" : "border-neutral-200 bg-white"
        )}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] mb-6">Media Types</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#14161C' : '#ffffff',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                    textTransform: 'none'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stats.typeData.map((entry, index) => (
              <div key={entry.name} className={cn("flex items-center gap-2 text-[10px]", isDarkMode ? "text-white/70" : "text-neutral-600")}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode ? "bg-[#14161C] border-white/5" : "border-neutral-200 bg-white"
        )}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] mb-6">Watch Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#14161C' : '#ffffff',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000',
                    textTransform: 'none'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {stats.statusData.map((entry, index) => (
              <div key={entry.name} className={cn("flex items-center gap-2 text-[10px]", isDarkMode ? "text-white/70" : "text-neutral-600")}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings Distribution */}
        <div className={cn(
          "p-6 rounded-2xl border lg:col-span-2",
          isDarkMode ? "bg-[#14161C] border-white/5" : "border-neutral-200 bg-white"
        )}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] mb-6">Rating Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ratingData}>
                <XAxis dataKey="rating" stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : '#d4d4d8'} tick={{fill: isDarkMode ? 'rgba(255,255,255,0.5)' : '#71717a', fontSize: 12}} />
                <YAxis allowDecimals={false} stroke={isDarkMode ? 'rgba(255,255,255,0.2)' : '#d4d4d8'} tick={{fill: isDarkMode ? 'rgba(255,255,255,0.5)' : '#71717a', fontSize: 12}} />
                <Tooltip 
                  cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f4f4f5' }}
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#14161C' : '#ffffff',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                    borderRadius: '8px',
                    color: isDarkMode ? '#fff' : '#000'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
