import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'media_entries' table
export const mediaEntries = pgTable('media_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  rating: integer('rating').notNull(),
  
  posterBase64: text('poster_base64'),
  originalPosterBase64: text('original_poster_base64'),
  cropData: jsonb('crop_data'),
  
  summary: text('summary').notNull(),
  review: text('review').notNull(),
  notes: text('notes').notNull(),
  
  genres: jsonb('genres').notNull(), 
  tags: jsonb('tags').notNull(), 
  
  dateStarted: text('date_started'),
  dateCompleted: text('date_completed'),
  platform: text('platform').notNull(),
  episodesWatched: integer('episodes_watched'),
  totalEpisodes: integer('total_episodes'),
  
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  favorite: boolean('favorite').notNull().default(false),
  journal: jsonb('journal'),
  deletedAt: text('deleted_at'),
  lastViewedAt: text('last_viewed_at'),
});

export const customOptions = pgTable('custom_options', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  type: text('type').notNull(), 
  name: text('name').notNull(),
  value: text('value').notNull(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  entries: many(mediaEntries),
  options: many(customOptions),
}));

export const mediaEntriesRelations = relations(mediaEntries, ({ one }) => ({
  author: one(users, {
    fields: [mediaEntries.userId],
    references: [users.id],
  }),
}));

export const customOptionsRelations = relations(customOptions, ({ one }) => ({
  author: one(users, {
    fields: [customOptions.userId],
    references: [users.id],
  }),
}));


// Define the 'entry_versions' table
export const entryVersions = pgTable('entry_versions', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id')
    .references(() => mediaEntries.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  timestamp: text('timestamp').notNull(),
  data: jsonb('data').notNull(), // The complete entry state at that time
});

export const entryVersionsRelations = relations(entryVersions, ({ one }) => ({
  entry: one(mediaEntries, {
    fields: [entryVersions.entryId],
    references: [mediaEntries.id],
  }),
  author: one(users, {
    fields: [entryVersions.userId],
    references: [users.id],
  }),
}));
