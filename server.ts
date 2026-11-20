import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { db } from './src/db/index.ts';
import { mediaEntries, customOptions, users, entryVersions } from './src/db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import cors from 'cors';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' })); // For base64 images
  app.use(cors());

  // API Routes
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      res.json({ user });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/data', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      
      const entries = await db.select().from(mediaEntries).where(eq(mediaEntries.userId, user.id));
      const options = await db.select().from(customOptions).where(eq(customOptions.userId, user.id));
      
      res.json({ entries, customOptions: options });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/migrate', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      const { media, options } = req.body;
      
      // Migrate options
      if (options && options.length > 0) {
        for (const opt of options) {
          const existing = await db.select().from(customOptions).where(
            and(eq(customOptions.userId, user.id), eq(customOptions.type, opt.type), eq(customOptions.value, opt.value))
          ).limit(1);
          if (existing.length === 0) {
            await db.insert(customOptions).values({
              userId: user.id,
              type: opt.type,
              name: opt.name,
              value: opt.value || opt.name,
            });
          }
        }
      }

      // Migrate media
      if (media && media.length > 0) {
        for (const m of media) {
          const createdAt = m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString();
          const updatedAt = m.updatedAt ? new Date(m.updatedAt).toISOString() : new Date().toISOString();
          
          await db.insert(mediaEntries).values({
            userId: user.id,
            title: m.title || 'Untitled',
            type: m.type || 'other',
            status: m.status || 'plan_to_watch',
            rating: m.rating || 0,
            posterBase64: m.posterBase64 || null,
            originalPosterBase64: m.originalPosterBase64 || null,
            cropData: m.cropData || null,
            summary: m.summary || '',
            review: m.review || '',
            notes: m.notes || '',
            genres: m.genres || [],
            tags: m.tags || [],
            dateStarted: m.dateStarted || null,
            dateCompleted: m.dateCompleted || null,
            platform: m.platform || 'Other',
            episodesWatched: m.episodesWatched || null,
            totalEpisodes: m.totalEpisodes || null,
            createdAt: createdAt,
            updatedAt: updatedAt,
            favorite: m.favorite || false,
            journal: m.journal || [],
          });
        }
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Migration error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/media', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      const data = req.body;
      const result = await db.insert(mediaEntries).values({
        ...data,
        userId: user.id,
      }).returning();
      
      // Create first version
      await db.insert(entryVersions).values({
        entryId: result[0].id,
        userId: user.id,
        timestamp: new Date().toISOString(),
        data: result[0]
      });
      
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/media/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      const data = req.body;
      const result = await db.update(mediaEntries)
        .set(data)
        .where(and(eq(mediaEntries.id, parseInt(req.params.id)), eq(mediaEntries.userId, user.id)))
        .returning();
        
      if (result.length > 0) {
        // Create new version
        await db.insert(entryVersions).values({
          entryId: result[0].id,
          userId: user.id,
          timestamp: new Date().toISOString(),
          data: result[0]
        });
      }
      
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/media/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      
      const { force } = req.query;
      if (force === 'true') {
        await db.delete(mediaEntries)
          .where(and(eq(mediaEntries.id, parseInt(req.params.id)), eq(mediaEntries.userId, user.id)));
      } else {
        await db.update(mediaEntries)
          .set({ deletedAt: new Date().toISOString() })
          .where(and(eq(mediaEntries.id, parseInt(req.params.id)), eq(mediaEntries.userId, user.id)));
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/media/:id/restore-trash', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      const result = await db.update(mediaEntries)
        .set({ deletedAt: null })
        .where(and(eq(mediaEntries.id, parseInt(req.params.id)), eq(mediaEntries.userId, user.id)))
        .returning();
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/media/:id/versions', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      const entryId = parseInt(req.params.id);
      
      // Verify ownership
      const entry = await db.select().from(mediaEntries).where(and(eq(mediaEntries.id, entryId), eq(mediaEntries.userId, user.id))).limit(1);
      if (entry.length === 0) return res.status(404).json({ error: 'Not found' });

      const versions = await db.select().from(entryVersions)
        .where(eq(entryVersions.entryId, entryId))
        .orderBy(desc(entryVersions.timestamp));
        
      res.json(versions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Options API
  app.post('/api/options', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      const data = req.body;
      const result = await db.insert(customOptions).values({
        ...data,
        userId: user.id,
      }).returning();
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/options/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      const data = req.body;
      const result = await db.update(customOptions)
        .set(data)
        .where(and(eq(customOptions.id, parseInt(req.params.id)), eq(customOptions.userId, user.id)))
        .returning();
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/options/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || '');
      await db.delete(customOptions)
        .where(and(eq(customOptions.id, parseInt(req.params.id)), eq(customOptions.userId, user.id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
  });
}

startServer();
