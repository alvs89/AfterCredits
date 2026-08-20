import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { CustomOption, EntryVersion, MediaEntry } from '../types';
import { useAuth } from './auth-context';
import { supabase } from './supabase';

interface DataContextType {
  entries: MediaEntry[]; customOptionsDB: CustomOption[]; loading: boolean;
  addEntry: (entry: MediaEntry) => Promise<void>; updateEntry: (id: number, data: Partial<MediaEntry>) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>; putEntry: (entry: MediaEntry) => Promise<void>;
  addCustomOption: (name: string, type: 'platform' | 'mediaType') => Promise<void>;
  editCustomOption: (oldValue: string, newName: string, type: 'platform' | 'mediaType') => Promise<void>;
  deleteCustomOption: (value: string, replacementValue: string | undefined, type: 'platform' | 'mediaType') => Promise<void>;
  checkOptionInUse: (value: string, type: 'platform' | 'mediaType') => number;
  getVersions: (id: number) => Promise<EntryVersion[]>; restoreVersion: (versionId: number) => Promise<MediaEntry>;
  restoreFromTrash: (id: number) => Promise<void>; deleteEntryPermanently: (id: number) => Promise<void>;
}

const empty = async () => {};
const DataContext = createContext<DataContextType>({ entries: [], customOptionsDB: [], loading: true, addEntry: empty, updateEntry: empty, deleteEntry: empty, putEntry: empty, addCustomOption: empty, editCustomOption: empty, deleteCustomOption: empty, checkOptionInUse: () => 0, getVersions: async () => [], restoreVersion: async () => { throw new Error('Data provider is unavailable'); }, restoreFromTrash: empty, deleteEntryPermanently: empty });

const fromRow = (r: any): MediaEntry => ({
  id: Number(r.id), title: r.title, type: r.type, status: r.status, rating: r.rating,
  posterBase64: r.poster_url || undefined, originalPosterBase64: r.original_poster_url || undefined, cropData: r.crop_data || undefined,
  summary: r.summary || '', review: r.review || '', notes: r.notes || '', genres: r.genres || [], tags: r.tags || [],
  dateStarted: r.date_started || undefined, dateCompleted: r.date_completed || undefined, platform: r.platform,
  episodesWatched: r.episodes_watched ?? undefined, totalEpisodes: r.total_episodes ?? undefined,
  createdAt: r.created_at, updatedAt: r.updated_at, favorite: r.favorite, journal: r.journal || [],
  deletedAt: r.deleted_at || undefined, lastViewedAt: r.last_viewed_at || undefined,
} as MediaEntry);

const toRow = (e: Partial<MediaEntry>) => {
  const row: any = {};
  const map: Record<string, string> = { posterBase64: 'poster_url', originalPosterBase64: 'original_poster_url', cropData: 'crop_data', dateStarted: 'date_started', dateCompleted: 'date_completed', episodesWatched: 'episodes_watched', totalEpisodes: 'total_episodes', createdAt: 'created_at', updatedAt: 'updated_at', deletedAt: 'deleted_at', lastViewedAt: 'last_viewed_at' };
  for (const [key, value] of Object.entries(e)) if (key !== 'id' && value !== undefined) row[map[key] || key] = value;
  return row;
};

async function uploadImage(userId: string, value?: string, label = 'poster') {
  if (!value?.startsWith('data:')) return value;
  const blob = await (await fetch(value)).blob();
  const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'webp';
  const path = `${userId}/${crypto.randomUUID()}-${label}.${ext}`;
  const { error } = await supabase.storage.from('media-posters').upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from('media-posters').getPublicUrl(path).data.publicUrl;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MediaEntry[]>([]); const [customOptionsDB, setCustomOptionsDB] = useState<CustomOption[]>([]); const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setEntries([]); setCustomOptionsDB([]); setLoading(false); return; }
    setLoading(true);
    const [media, options] = await Promise.all([
      supabase.from('media_entries').select('*').order('created_at', { ascending: false }),
      supabase.from('custom_options').select('id,type,name,value').order('name'),
    ]);
    if (media.error) console.error(media.error); else setEntries((media.data || []).map(fromRow));
    if (options.error) console.error(options.error); else setCustomOptionsDB((options.data || []).map((o: any) => ({ ...o, id: Number(o.id) })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addEntry = async (entry: MediaEntry) => {
    if (!user) return;
    const poster = await uploadImage(user.id, entry.posterBase64, 'poster');
    const original = await uploadImage(user.id, entry.originalPosterBase64, 'original');
    const { data, error } = await supabase.from('media_entries').insert({ ...toRow(entry), user_id: user.id, poster_url: poster, original_poster_url: original }).select().single();
    if (error) throw error; setEntries(prev => [fromRow(data), ...prev]);
  };
  const updateEntry = async (id: number, changes: Partial<MediaEntry>) => {
    if (!user) return; const row = toRow(changes); row.updated_at = new Date().toISOString();
    if (changes.posterBase64?.startsWith('data:')) row.poster_url = await uploadImage(user.id, changes.posterBase64, 'poster');
    if (changes.originalPosterBase64?.startsWith('data:')) row.original_poster_url = await uploadImage(user.id, changes.originalPosterBase64, 'original');
    const { data, error } = await supabase.from('media_entries').update(row).eq('id', id).select().single();
    if (error) throw error; setEntries(prev => prev.map(e => e.id === id ? fromRow(data) : e));
  };
  const putEntry = async (entry: MediaEntry) => entry.id ? updateEntry(entry.id, entry) : addEntry(entry);
  const deleteEntry = async (id: number) => updateEntry(id, { deletedAt: new Date().toISOString() });
  const restoreFromTrash = async (id: number) => { const { data, error } = await supabase.from('media_entries').update({ deleted_at: null, updated_at: new Date().toISOString() }).eq('id', id).select().single(); if (error) throw error; setEntries(prev => prev.map(e => e.id === id ? fromRow(data) : e)); };
  const deleteEntryPermanently = async (id: number) => { const { error } = await supabase.from('media_entries').delete().eq('id', id); if (error) throw error; setEntries(prev => prev.filter(e => e.id !== id)); };
  const getVersions = useCallback(async (id: number): Promise<EntryVersion[]> => {
    let { data, error } = await supabase
      .from('entry_versions')
      .select('id,entry_id,timestamp,data,revision_kind,restored_from_id')
      .eq('entry_id', id)
      .order('timestamp', { ascending: false })
      .limit(200);
    if (error?.code === '42703') {
      const legacy = await supabase
        .from('entry_versions')
        .select('id,entry_id,timestamp,data')
        .eq('entry_id', id)
        .order('timestamp', { ascending: false })
        .limit(200);
      data = legacy.data as any;
      error = legacy.error;
    }
    if (error) throw error;
    return (data || []).map((version: any) => ({
      id: Number(version.id),
      entryId: Number(version.entry_id),
      timestamp: version.timestamp,
      data: version.data,
      revisionKind: version.revision_kind || 'autosave',
      restoredFromId: version.restored_from_id ? Number(version.restored_from_id) : undefined,
    }));
  }, []);

  const restoreVersion = useCallback(async (versionId: number): Promise<MediaEntry> => {
    if (!user) throw new Error('You must be signed in to restore a version.');
    const { data, error } = await supabase.rpc('restore_media_version', { version_id: versionId }).single();
    if (error) throw error;
    const restored = fromRow(data);
    setEntries(previous => previous.map(item => item.id === restored.id ? restored : item));
    return restored;
  }, [user]);

  const addCustomOption = async (name: string, type: 'platform' | 'mediaType') => { if (!user || !name.trim()) return; const value = name.trim(); const { data, error } = await supabase.from('custom_options').insert({ user_id: user.id, type, name: value, value }).select('id,type,name,value').single(); if (error) { if (error.code !== '23505') throw error; return; } setCustomOptionsDB(prev => [...prev, { ...data, id: Number(data.id) }]); };
  const editCustomOption = async (oldValue: string, newName: string, type: 'platform' | 'mediaType') => { const option = customOptionsDB.find(o => o.type === type && o.value === oldValue); if (!option?.id || !newName.trim()) return; const value = newName.trim(); const column = type === 'platform' ? 'platform' : 'type'; const { error } = await supabase.from('custom_options').update({ name: value, value }).eq('id', option.id); if (error) throw error; const media = await supabase.from('media_entries').update({ [column]: value, updated_at: new Date().toISOString() }).eq(column, oldValue); if (media.error) throw media.error; await fetchData(); };
  const deleteCustomOption = async (value: string, replacement: string | undefined, type: 'platform' | 'mediaType') => { const option = customOptionsDB.find(o => o.type === type && o.value === value); if (!option?.id) return; if (replacement) { const column = type === 'platform' ? 'platform' : 'type'; const media = await supabase.from('media_entries').update({ [column]: replacement, updated_at: new Date().toISOString() }).eq(column, value); if (media.error) throw media.error; } const { error } = await supabase.from('custom_options').delete().eq('id', option.id); if (error) throw error; await fetchData(); };
  const checkOptionInUse = (value: string, type: 'platform' | 'mediaType') => entries.filter(e => type === 'platform' ? e.platform === value : e.type === value).length;

  return <DataContext.Provider value={{ entries, customOptionsDB, loading, addEntry, updateEntry, deleteEntry, putEntry, addCustomOption, editCustomOption, deleteCustomOption, checkOptionInUse, getVersions, restoreVersion, restoreFromTrash, deleteEntryPermanently }}>{children}</DataContext.Provider>;
};
export const useData = () => useContext(DataContext);
