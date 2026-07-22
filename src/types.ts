export enum MediaType {
  Movie = 'movie',
  TvSeries = 'tv_series',
  KDrama = 'k_drama',
  Anime = 'anime',
  Documentary = 'documentary',
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
  posterBlob?: Blob; 
  posterUrl?: string; // Cache url for object url
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
}
