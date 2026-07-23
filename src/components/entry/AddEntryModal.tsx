import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Tag } from 'lucide-react';
import { cn, formatMediaType, formatWatchStatus } from '../../lib/utils';
import { db } from '../../db/db';
import { SearchableDropdown } from "../common/SearchableDropdown";
import { StarRating } from "../common/StarRating";
import { MediaType, WatchStatus, MediaEntry } from '../../types';

const PREDEFINED_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Documentary', 'Drama', 'Fantasy', 
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller'
];

export function AddEntryModal({ isOpen, onClose, isDarkMode, editingEntry }: { isOpen: boolean, onClose: () => void, isDarkMode: boolean, editingEntry?: MediaEntry }) {
  const [formData, setFormData] = useState<Partial<MediaEntry>>({
    title: '',
    type: MediaType.Movie,
    status: WatchStatus.PlanToWatch,
    rating: 0,
    summary: '',
    review: '',
    notes: '',
    genres: [],
    tags: [],
    platform: '',
    favorite: false,
  });

  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [newGenre, setNewGenre] = useState('');
  const [customPlatforms, setCustomPlatforms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('customPlatforms');
      return saved ? JSON.parse(saved).filter((p: string) => p && p.toLowerCase() !== 'none') : [];
    } catch {
      return [];
    }
  });

  const handleAddPlatform = (platform: string) => {
    if (!customPlatforms.includes(platform) && !['Cineby', 'LokLok', 'Movie Box', 'Netflix', 'StreameX', 'Other'].includes(platform)) {
      const newCustom = [...customPlatforms, platform];
      setCustomPlatforms(newCustom);
      localStorage.setItem('customPlatforms', JSON.stringify(newCustom));
    }
    setFormData({ ...formData, platform });
  };

  useEffect(() => {
    if (editingEntry) {
      setFormData(editingEntry);
      if (editingEntry.posterBlob) {
        setPosterPreview(URL.createObjectURL(editingEntry.posterBlob));
      }
    }
  }, [editingEntry]);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, posterBlob: file });
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const entry = {
      ...formData,
      title: formData.title,
      type: formData.type || MediaType.Movie,
      status: formData.status || WatchStatus.PlanToWatch,
      rating: Number(formData.rating) || 0,
      summary: formData.summary || '',
      review: formData.review || '',
      notes: formData.notes || '',
      genres: formData.genres || [],
      tags: formData.tags || [],
      platform: formData.platform || '',
      favorite: formData.favorite || false,
      dateStarted: formData.dateStarted || undefined,
      dateCompleted: formData.dateCompleted || undefined,
      updatedAt: new Date().toISOString(),
      createdAt: editingEntry ? editingEntry.createdAt : new Date().toISOString(),
    } as MediaEntry;

    if (editingEntry && editingEntry.id) {
      entry.id = editingEntry.id;
      await db.media.put(entry);
    } else {
      await db.media.add(entry);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8 shadow-2xl transition-colors relative border",
        isDarkMode ? "bg-[#14161C] border-white/10 text-white" : "bg-white text-neutral-900"
      )}>
        <button 
          onClick={onClose}
          className={cn("absolute top-6 right-6 p-2 rounded transition-colors border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-neutral-100 hover:bg-neutral-200 border-neutral-200")}
        >
          <X className="w-4 h-4 text-white/70" />
        </button>

        <h2  className="text-3xl font-bold  text-[#3B82F6] mb-6">{editingEntry ? 'Edit Archive Entry' : 'New Archive Entry'}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <div className={cn(
                "aspect-[2/3] rounded-lg border flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-colors bg-[#1A1D24]",
                isDarkMode ? "border-white/10 hover:border-[#3B82F6]/50" : "border-neutral-300 hover:border-neutral-400"
              )}>
                {posterPreview ? (
                  <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-white/60 p-4 text-center">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Upload Poster</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePosterChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div>
                <label className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/70" : "text-neutral-600")}>Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={cn(
                    "w-full px-4 py-2 rounded border focus:outline-none text-sm transition-colors", isDarkMode ? "bg-white/5 border-white/10 focus:border-[#3B82F6]/50 text-white" : "bg-white border-neutral-200 focus:border-[#3B82F6] text-neutral-900"
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/70" : "text-neutral-600")}>Type</label>
                  <SearchableDropdown 
                    value={formData.type as string}
                    onChange={(val) => setFormData({ ...formData, type: val as MediaType })}
                    isDarkMode={isDarkMode}
                    options={Object.values(MediaType).map(t => ({ value: t, label: formatMediaType(t) }))}
                  />
                </div>
                <div>
                  <label className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/70" : "text-neutral-600")}>Status</label>
                  <SearchableDropdown 
                    value={formData.status as string}
                    onChange={(val) => setFormData({ ...formData, status: val as WatchStatus })}
                    isDarkMode={isDarkMode}
                    options={Object.values(WatchStatus).map(s => ({ value: s, label: formatWatchStatus(s) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/70" : "text-neutral-600")}>Rating (0-10)</label>
                  <div className="py-2"><StarRating value={formData.rating} onChange={(rating) => setFormData({ ...formData, rating })} isDarkMode={isDarkMode} size="md" /></div>
                </div>
                <div>
                  <label className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/70" : "text-neutral-600")}>Platform</label>
                  <SearchableDropdown
                    value={formData.platform || ''}
                    onChange={(val) => setFormData({ ...formData, platform: val })}
                    isDarkMode={isDarkMode}
                    allowAdd={true}
                    addLabel="Add Platform"
                    onAdd={handleAddPlatform}
                    placeholder="Select or Add Platform..."
                    options={[
                      
                      ...['Cineby', 'LokLok', 'Movie Box', 'Netflix', 'StreameX'].map(p => ({ value: p, label: p })),
                      ...customPlatforms.filter(p => p && p.toLowerCase() !== 'none').map(p => ({ value: p, label: p })),
                      { value: 'Other', label: 'Other' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/70" : "text-neutral-600")}>Date Started</label>
                  <input 
                    type="date" 
                    value={formData.dateStarted || ''}
                    onChange={e => setFormData({ ...formData, dateStarted: e.target.value })}
                    className={cn(
                      "w-full px-4 py-2 rounded border focus:outline-none text-sm transition-colors", isDarkMode ? "bg-white/5 border-white/10 focus:border-[#3B82F6]/50 text-white" : "bg-white border-neutral-200 focus:border-[#3B82F6] text-neutral-900",
                      isDarkMode && "[color-scheme:dark]"
                    )}
                  />
                </div>
                <div>
                  <label className={cn("block text-[10px] font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-white/70" : "text-neutral-600")}>Date Completed</label>
                  <input 
                    type="date" 
                    value={formData.dateCompleted || ''}
                    onChange={e => setFormData({ ...formData, dateCompleted: e.target.value })}
                    className={cn(
                      "w-full px-4 py-2 rounded border focus:outline-none text-sm transition-colors", isDarkMode ? "bg-white/5 border-white/10 focus:border-[#3B82F6]/50 text-white" : "bg-white border-neutral-200 focus:border-[#3B82F6] text-neutral-900",
                      isDarkMode && "[color-scheme:dark]"
                    )}
                  />
                </div>
              </div>

              <div>
                <label className={cn("block text-[10px] font-bold uppercase tracking-widest mb-2", isDarkMode ? "text-white/70" : "text-neutral-600")}>Genres</label>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PREDEFINED_GENRES.map(g => {
                    const isSelected = formData.genres?.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          const current = formData.genres || [];
                          if (isSelected) {
                            setFormData({ ...formData, genres: current.filter(x => x !== g) });
                          } else {
                            setFormData({ ...formData, genres: [...current, g] });
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-[10px] font-semibold transition-colors",
                          isSelected 
                            ? "bg-[#3B82F6] border-[#3B82F6] text-[#0A0B0E]"
                            : isDarkMode ? "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20" : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                        )}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.genres?.filter(g => !PREDEFINED_GENRES.includes(g)).map(g => (
                    <span key={g} className={cn("px-2 py-1 rounded border text-[10px] flex items-center gap-1", isDarkMode ? "bg-white/5 border-white/10 text-white/70" : "bg-neutral-100 border-neutral-200 text-neutral-700")}>
                      {g}
                      <button type="button" onClick={() => setFormData({ ...formData, genres: formData.genres?.filter(x => x !== g) })}>
                        <X className={cn("w-3 h-3", isDarkMode ? "text-white/60 hover:text-white" : "text-neutral-600 hover:text-neutral-900")} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newGenre}
                    onChange={e => setNewGenre(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newGenre && !formData.genres?.includes(newGenre)) {
                          setFormData({ ...formData, genres: [...(formData.genres || []), newGenre] });
                          setNewGenre('');
                        }
                      }
                    }}
                    placeholder="Add genre and press Enter"
                    className={cn(
                      "flex-1 px-4 py-2 rounded border focus:outline-none text-sm transition-colors", isDarkMode ? "bg-white/5 border-white/10 focus:border-[#3B82F6]/50 text-white" : "bg-white border-neutral-200 focus:border-[#3B82F6] text-neutral-900"
                    )}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (newGenre && !formData.genres?.includes(newGenre)) {
                        setFormData({ ...formData, genres: [...(formData.genres || []), newGenre] });
                        setNewGenre('');
                      }
                    }}
                    className={cn("p-2 rounded border transition-colors", isDarkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200")}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={cn("flex justify-end gap-3 pt-6 border-t", isDarkMode ? "border-white/5" : "border-neutral-200")}>
            <button 
              type="button" 
              onClick={onClose}
              className={cn("px-6 py-2 rounded font-semibold text-xs transition-colors", isDarkMode ? "text-white/70 hover:text-white hover:bg-white/5" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100")}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#0A0B0E] px-8 py-2 rounded font-semibold transition-colors text-xs"
            >
              {editingEntry ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
