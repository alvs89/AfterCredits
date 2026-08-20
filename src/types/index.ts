export enum MediaType {
  Movie = 'movie',
  TvSeries = 'tv_series',
  KDrama = 'k_drama',
  Anime = 'anime',
  Documentary = 'documentary',
  ConcertFilm = 'concert_film',
  Other = 'other'
}

export enum WatchStatus {
  PlanToWatch = 'plan_to_watch',
  Watching = 'watching',
  Completed = 'completed',
  OnHold = 'on_hold',
  Dropped = 'dropped',
  Rewatching = 'rewatching'
}

export interface CustomOption {
  id?: number;
  type: 'platform' | 'mediaType';
  name: string;
  value: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  title?: string;
}

export interface MediaEntry {
  journal?: JournalEntry[];
  id?: number;
  title: string;
  type: MediaType;
  status: WatchStatus;
  rating: number; // 0 to 10
  posterBase64?: string; 
  posterUrl?: string; // Cache url for object url
  originalPosterBase64?: string;
  cropData?: {
    crop: { x: number; y: number };
    zoom: number;
    croppedAreaPixels: { x: number; y: number; width: number; height: number } | null;
  };
  summary: string;
  review: string;
  notes: string;
  genres: string[];
  tags: string[];
  dateStarted?: string; // ISO format string
  dateCompleted?: string; // ISO format string
  platform: string; // Netflix, Cinema, etc.
  episodesWatched?: number;
  totalEpisodes?: number;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  deletedAt?: string;
  lastViewedAt?: string;
}


export interface EntryVersion {
  id: number;
  entryId: number;
  userId: number;
  timestamp: string;
  data: MediaEntry; // The complete snapshot
}
