import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Search, Filter, Star, Eye, Heart, MoreVertical, Edit2, Trash2, Calendar } from 'lucide-react';
import { cn, formatMediaType, formatWatchStatus } from '../lib/utils';
import { MediaType, WatchStatus, MediaEntry } from '../types';
import { AddEntryModal } from '../components/AddEntryModal';
import { ViewEntryModal } from '../components/ViewEntryModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { SearchableDropdown } from '../components/SearchableDropdown';

export function MediaList({ isDarkMode }: { isDarkMode: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<WatchStatus | 'all'>('all');
  const [editingEntry, setEditingEntry] = useState<MediaEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<MediaEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  const entries = useLiveQuery(async () => {
    let collection = db.media.orderBy('updatedAt').reverse();
    const all = await collection.toArray();
    return all.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || entry.type === filterType;
      const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, filterType, filterStatus]);

  const handleDelete = async (id: number) => {
    setEntryToDelete(id);
  };
  
  const confirmDelete = async () => {
    if (entryToDelete) {
      await db.media.delete(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const toggleFavorite = async (entry: MediaEntry) => {
    if (entry.id) {
      await db.media.update(entry.id, { favorite: !entry.favorite });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className={cn(
          "relative flex-1 max-w-md w-full group",
          isDarkMode ? "text-white" : "text-neutral-900"
        )}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 group-focus-within:text-[#3B82F6]" />
          <input 
            type="text" 
            placeholder="Search your archive..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none transition-colors text-sm",
              isDarkMode ? "bg-white/5 border-white/10 focus:border-[#3B82F6]/50" : "bg-white border-neutral-200"
            )}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SearchableDropdown 
            value={filterType}
            onChange={(val) => setFilterType(val as any)}
            isDarkMode={isDarkMode}
            className="w-full sm:w-40 font-semibold text-xs"
            options={[
              { value: 'all', label: 'All Types' },
              ...Object.values(MediaType).map(t => ({ value: t, label: formatMediaType(t) }))
            ]}
          />
          <SearchableDropdown 
            value={filterStatus}
            onChange={(val) => setFilterStatus(val as any)}
            isDarkMode={isDarkMode}
            className="w-full sm:w-40 font-semibold text-xs"
            options={[
              { value: 'all', label: 'All Status' },
              ...Object.values(WatchStatus).map(s => ({ value: s, label: formatWatchStatus(s) }))
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {entries?.map(entry => (
            <div 
              key={entry.id}
              onClick={() => setViewingEntry(entry)}
              className={cn(
                "group rounded-xl border p-4 transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col relative z-0 hover:z-10 cursor-pointer",
                isDarkMode ? "border-white/10 bg-[#14161C] hover:border-[#3B82F6]/50" : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
            >
              <div className={cn("aspect-[2/3] w-full rounded-lg mb-4 overflow-hidden relative flex items-center justify-center font-sans font-semibold text-xl", isDarkMode ? "bg-[#1A1D24] text-white/70" : "bg-neutral-100 text-neutral-600")}>
                {entry.posterBlob ? (
                  <img src={URL.createObjectURL(entry.posterBlob)} alt={entry.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="px-4 text-center">{entry.title}</span>
                )}
                
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
                
                {/* Badges */}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(entry); }}
                  className="absolute top-2 right-2 p-1.5 rounded bg-[#0A0B0E]/60 backdrop-blur-md transition-colors hover:bg-[#0A0B0E]/80 z-20 border border-white/5"
                >
                  <Heart className={cn("w-3 h-3", entry.favorite ? "fill-blue-500 text-blue-500" : "text-white/70")} />
                </button>
                
                <div className="absolute bottom-3 left-3 flex gap-1 z-10 pointer-events-none">
                  <div className="bg-[#3B82F6] text-[#0A0B0E] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {entry.rating}
                  </div>
                  <div className="bg-white/10 text-white/80 text-[10px] font-bold px-1.5 py-0.5 rounded ">
                    {formatMediaType(entry.type)}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0"></div>
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
              {entry.genres && entry.genres.length > 0 && (
                <div className={cn("flex gap-1 mt-2 overflow-hidden flex-wrap pt-3 border-t", isDarkMode ? "border-white/5" : "border-neutral-200")}>
                  {entry.genres.slice(0,3).map(g => (
                    <span key={g} className={cn("text-[9px] px-2 py-1 rounded border", isDarkMode ? "bg-white/5 border-white/10 text-white/70" : "bg-neutral-100 border-neutral-200 text-neutral-600")}>{g}</span>
                  ))}
                  {entry.genres.length > 3 && <span className={cn("text-[9px] px-2 py-1 rounded border", isDarkMode ? "bg-white/5 border-white/10 text-white/70" : "bg-neutral-100 border-neutral-200 text-neutral-600")}>+{entry.genres.length - 3}</span>}
                </div>
              )}
            </div>
          ))}
          {entries?.length === 0 && (
          <div className="col-span-full py-12 text-center text-white/60">
            No entries found matching your criteria.
          </div>
        )}
      </div>
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
    </div>
  );
}
