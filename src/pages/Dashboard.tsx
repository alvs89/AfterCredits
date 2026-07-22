import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Clock, Star, PlayCircle, Trophy, Calendar, Edit2, Trash2, Search, Eye } from 'lucide-react';
import { cn, formatMediaType, formatWatchStatus } from '../lib/utils';
import { WatchStatus, MediaEntry } from '../types';
import { ViewEntryModal } from '../components/entry/ViewEntryModal';
import { AddEntryModal } from '../components/entry/AddEntryModal';
import { ConfirmModal } from '../components/common/ConfirmModal';

export function Dashboard({ isDarkMode, onNavigate, onAdd }: { isDarkMode: boolean, onNavigate: (tab: string) => void, onAdd: () => void }) {
  const [viewingEntry, setViewingEntry] = useState<MediaEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<MediaEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setEntryToDelete(id);
  };
  
  const confirmDelete = async () => {
    if (entryToDelete) {
      await db.media.delete(entryToDelete);
      setEntryToDelete(null);
    }
  };
  const stats = useLiveQuery(async () => {
    const all = await db.media.toArray();
    const completed = all.filter(m => m.status === WatchStatus.Completed).length;
    const watching = all.filter(m => m.status === WatchStatus.Watching).length;
    const favorites = all.filter(m => m.favorite).length;
    const avgRating = all.length ? (all.reduce((acc, curr) => acc + curr.rating, 0) / all.length).toFixed(1) : '0';
    
    return {
      total: all.length,
      completed,
      watching,
      favorites,
      avgRating
    };
  });

  const recent = useLiveQuery(() => db.media.orderBy('updatedAt').reverse().limit(5).toArray());

  return (
    <div className="space-y-8 pb-12">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard isDarkMode={isDarkMode} title="Total Entries" value={stats?.total || 0} icon={<LibraryIcon className="w-5 h-5 text-[#3B82F6]" />} />
        <StatCard isDarkMode={isDarkMode} title="Currently Watching" value={stats?.watching || 0} icon={<PlayCircle className="w-5 h-5 text-[#3B82F6]" />} />
        <StatCard isDarkMode={isDarkMode} title="Completed" value={stats?.completed || 0} icon={<Trophy className="w-5 h-5 text-[#3B82F6]" />} />
        <StatCard isDarkMode={isDarkMode} title="Avg Rating" value={stats?.avgRating || 0} icon={<Star className="w-5 h-5 text-[#3B82F6]" />} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2  className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-[#3B82F6]" : "text-neutral-800")}>Recently Updated</h2>
          <button onClick={() => onNavigate('library')} className="text-sm text-white/70 hover:text-white font-medium">View All</button>
        </div>
        
        {recent && recent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {recent.map(entry => (
              <div 
                key={entry.id}
                onClick={() => setViewingEntry(entry)}
                className={cn(
                  "group rounded-xl border p-4 transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col relative z-0 hover:z-10",
                  isDarkMode ? "border-white/10 bg-[#14161C] hover:border-[#3B82F6]/50 shadow-2xl" : "border-neutral-200 bg-white hover:border-neutral-300"
                )}
              >
                <div className={cn("aspect-[2/3] w-full rounded-lg mb-4 overflow-hidden relative flex items-center justify-center font-sans font-semibold text-xl", isDarkMode ? "bg-[#1A1D24] text-white/70" : "bg-neutral-100 text-neutral-600")}>
                  {entry.posterBlob ? (
                    <img src={URL.createObjectURL(entry.posterBlob)} alt={entry.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="px-4 text-center">{entry.title}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewingEntry(entry); }}
                      className="bg-[#3B82F6]/90 hover:bg-[#3B82F6] text-white px-4 py-2 rounded text-xs font-semibold w-32 flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-white/20"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); }}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-xs font-semibold w-32 flex items-center justify-center gap-2 transition-colors border border-white/10"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id!); }}
                      className="bg-neutral-500/20 hover:bg-neutral-500/40 text-neutral-100 px-4 py-2 rounded text-xs font-semibold w-32 flex items-center justify-center gap-2 transition-colors border border-neutral-500/20"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 flex gap-1 z-10">
                    <div className="bg-[#3B82F6] text-[#0A0B0E] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {entry.rating}
                    </div>
                    <div className="bg-white/10 text-white/80 text-[10px] font-bold px-1.5 py-0.5 rounded ">
                      {formatMediaType(entry.type)}
                    </div>
                  </div>
                </div>
                <h3 className={cn("font-semibold text-sm leading-tight line-clamp-1 mb-1", isDarkMode ? "text-white" : "text-neutral-900")}>{entry.title}</h3>
                <div className="mt-auto flex flex-col gap-1 pt-2">
                  <div className={cn("flex items-center justify-between text-[10px]", isDarkMode ? "text-white/60" : "text-neutral-600")}>
                    <span>{entry.platform || 'Unknown'}</span>
                    <span>{formatWatchStatus(entry.status)}</span>
                  </div>
                  {(entry.dateStarted || entry.dateCompleted) && (
                    <div className={cn("flex items-center gap-1.5 text-[10px] mt-1", isDarkMode ? "text-white/60" : "text-neutral-600")}>
                      <Calendar className="w-3 h-3 opacity-60 shrink-0" />
                      <span className="truncate">
                        {entry.dateStarted ? new Date(entry.dateStarted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '?'}
                        {' – '}
                        {entry.dateCompleted ? new Date(entry.dateCompleted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Present'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))} 
          </div>
        ) : (
          <div className={cn(
            "rounded-xl border border-dashed p-12 text-center",
            isDarkMode ? "border-white/10 text-white/70 bg-[#14161C]" : "border-neutral-300 text-neutral-600"
          )}>
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-60" />
            <h3 className="text-lg font-medium mb-2 text-white">No entries yet</h3>
            <p className="mb-4">Start building your media library.</p>
            <button onClick={onAdd} className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#0A0B0E] px-6 py-2 rounded font-semibold transition-colors text-xs inline-flex items-center gap-2">
              Add First Entry
            </button>
          </div>
        )}
      </section>

      {editingEntry && (
        <AddEntryModal 
          isOpen={true} 
          onClose={() => setEditingEntry(null)} 
          isDarkMode={isDarkMode} 
          editingEntry={editingEntry}
        />
      )}
      
      <ViewEntryModal 
        isOpen={!!viewingEntry}
        onClose={() => setViewingEntry(null)}
        entry={viewingEntry}
        isDarkMode={isDarkMode}
        onEdit={(entry) => setEditingEntry(entry)}
      />
      <ConfirmModal
        isOpen={entryToDelete !== null}
        onClose={() => setEntryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

function StatCard({ title, value, icon, isDarkMode }: { title: string, value: string | number, icon: React.ReactNode, isDarkMode: boolean }) {
  return (
    <div className={cn(
      "p-6 rounded-xl border flex flex-col gap-2",
      isDarkMode ? "border-white/5 bg-[#14161C]" : "border-neutral-200 bg-white"
    )}>
      <div className="flex items-center justify-between">
        <p className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/70" : "text-neutral-600")}>{title}</p>
        <div className={cn(
          "p-2 rounded flex items-center justify-center",
          isDarkMode ? "bg-white/5" : "bg-neutral-100"
        )}>
          {icon}
        </div>
      </div>
      <p  className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-neutral-900")}>{value}</p>
    </div>
  );
}

function LibraryIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 6 4 14" />
      <path d="M12 6v14" />
      <path d="M8 8v12" />
      <path d="M4 4v16" />
    </svg>
  )
}
