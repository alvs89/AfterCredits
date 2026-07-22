import Dexie, { type EntityTable } from 'dexie';
import { MediaEntry } from '../types';

export const db = new Dexie('LuminaDB') as Dexie & {
  media: EntityTable<MediaEntry, 'id'>;
};

db.version(1).stores({
  media: '++id, title, type, status, rating, platform, createdAt, updatedAt, favorite'
});
