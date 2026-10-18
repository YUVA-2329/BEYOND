import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { store } from './server/dataStore';
import { aiService } from './server/aiService';
import { extractAuth, requireAuth, requireAdmin, AuthenticatedRequest } from './server/middleware/auth';

dotenv.config();

const _dir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(extractAuth);

  // Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Directory Traversal & Security Filter Middleware
  app.use((req, res, next) => {
    const rawUrl = req.url || '';
    const decodedUrl = decodeURI(rawUrl);
    if (rawUrl.includes('..') || decodedUrl.includes('..') || rawUrl.includes('%2e%2e') || rawUrl.includes('%2f%2e%2e')) {
      return res.status(403).json({ error: 'Access forbidden: Directory traversal pattern detected' });
    }
    next();
  });

  // Static directory for uploads & public assets
  const publicDir = path.join(process.cwd(), 'public');
  app.use('/intro', express.static(path.join(publicDir, 'intro')));
  app.use('/uploads', express.static(path.join(publicDir, 'uploads')));
  app.use('/assets', express.static(path.join(publicDir, 'intro', 'assets')));
  app.use(express.static(publicDir));

  // ==========================================
  // BEYOND AUTHENTICATION & SESSIONS
  // ==========================================

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, username, password } = req.body;
      const id = email || username;
      if (!id) return res.status(400).json({ error: 'Email or username is required' });
      const auth = store.authenticate(id, password);
      res.json(auth);
    } catch (err: any) {
      res.status(500).json({ error: 'Authentication failed', details: err?.message });
    }
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, handle, password } = req.body;
      if (!email || !name) return res.status(400).json({ error: 'Name and email are required' });
      const auth = store.authenticate(email, password);
      auth.user.name = name;
      if (handle) auth.user.handle = handle;
      res.status(201).json(auth);
    } catch (err: any) {
      res.status(500).json({ error: 'Registration failed', details: err?.message });
    }
  });

  // Auth: Current Session
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const currentUser = store.getCurrentUser();
      return res.json({ user: currentUser, authenticated: true });
    }
    const user = store.getUserByToken(authHeader);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
    res.json({ user, authenticated: true });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (_req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Auth: Real Firebase Google Login Synchronization
  app.post('/api/auth/firebase-login', (req, res) => {
    try {
      const { email, name, avatarUrl } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required for Firebase auth sync' });
      }
      const user = store.recordUserSession({
        email,
        name: name || email.split('@')[0],
        avatarUrl,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'explorer',
      });
      res.json({
        success: true,
        user,
        token: user.token,
        message: 'Firebase Google session synchronized successfully',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to sync Firebase session', details: err?.message });
    }
  });

  // Auth: Google & Supabase OAuth Session Synchronization
  app.post(['/api/auth/google-sync', '/api/auth/supabase-sync'], (req, res) => {
    try {
      const { email, name, avatarUrl, id } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required for session sync' });
      }
      const user = store.recordUserSession({
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatarUrl || '/intro/assets/rohit_avatar.png',
        role: email.toLowerCase().includes('admin') ? 'admin' : 'explorer',
      });
      if (id) {
        // Map user id if supplied from Supabase
        user.id = id;
      }
      res.json({
        success: true,
        user,
        token: user.token,
        message: 'Google / Supabase session synchronized successfully with BEYOND backend',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to sync Google/Supabase session', details: err?.message });
    }
  });

  // ==========================================
  // BEYOND ADMIN PORTAL & ACTIVE USER CONTROL
  // ==========================================

  // Admin: List All Users & Live Activity
  app.get('/api/admin/users', (_req, res) => {
    try {
      const users = store.getUsers();
      const onlineCount = users.filter((u) => u.status === 'online').length;
      const inactiveCount = users.filter((u) => u.status === 'inactive').length;
      const idleCount = users.filter((u) => u.status === 'idle').length;
      res.json({
        users,
        total: users.length,
        onlineCount,
        inactiveCount,
        idleCount,
        serverTime: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch admin users', details: err?.message });
    }
  });

  // Admin: Delete a Specific User
  app.delete('/api/admin/users/:id', (req, res) => {
    try {
      const ok = store.deleteUser(req.params.id);
      if (!ok) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, deletedId: req.params.id });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete user', details: err?.message });
    }
  });

  // Admin: Purge All Inactive Users ("Remove all who are not there")
  app.post('/api/admin/users/purge-inactive', (_req, res) => {
    try {
      const result = store.purgeInactiveUsers();
      res.json({
        success: true,
        message: `Successfully purged ${result.purgedCount} inactive users`,
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to purge inactive users', details: err?.message });
    }
  });

  // Admin: Update User Role
  app.patch('/api/admin/users/:id/role', (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !['admin', 'curator', 'explorer'].includes(role)) {
        return res.status(400).json({ error: 'Valid role is required (admin, curator, explorer)' });
      }
      const updated = store.setUserRole(req.params.id, role);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update user role', details: err?.message });
    }
  });

  // Admin: Update User Status (online, idle, inactive)
  app.patch('/api/admin/users/:id/status', (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['online', 'inactive', 'idle'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required' });
      }
      const updated = store.setUserStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update user status', details: err?.message });
    }
  });

  // ==========================================
  // BEYOND CORE REST API
  // ==========================================

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'BEYOND — Location-Based Discovery & Social Exploration',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Radar Search Results Pack: 3 Famous Landmarks + 3 Scanned Nearby Places
  app.get(['/api/places/radar', '/api/discoveries/radar'], (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 12.2958;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : 76.6394;
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 15;
      const pack = store.getRadarPack(lat, lng, radius);
      res.json(pack);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to execute radar scan', details: err?.message });
    }
  });

  // Top 3 World Famous Landmarks
  app.get(['/api/places/famous', '/api/discoveries/famous'], (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 12.2958;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : 76.6394;
      const famous = store.getFamousPlaces(lat, lng);
      res.json(famous);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch famous landmarks', details: err?.message });
    }
  });

  // Top 3 Scanned Nearby Places
  app.get(['/api/places/nearby', '/api/discoveries/nearby'], (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 12.2958;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : 76.6394;
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 25;
      const nearby = store.getNearbyPlaces(lat, lng, radius);
      res.json(nearby);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch nearby places', details: err?.message });
    }
  });

  // Discoveries Feed (with optional category, query, lat, lng, radius)
  app.get(['/api/discoveries', '/api/places'], (req, res) => {
    try {
      const category = (req.query.category as string) || undefined;
      const query = (req.query.q as string) || undefined;
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : undefined;
      const results = store.getDiscoveries(category, query, lat, lng, radius);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch discoveries', details: err?.message });
    }
  });

  // Single Discovery
  app.get(['/api/discoveries/:id', '/api/places/:id'], (req, res) => {
    try {
      const item = store.getDiscoveryById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Discovery not found' });
      }
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch discovery', details: err?.message });
    }
  });

  // Delete Discovery — STRICTLY PROTECTED: ONLY ADMIN CAN DELETE IT!
  app.delete(['/api/discoveries/:id', '/api/places/:id'], requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const ok = store.deleteDiscovery(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Discovery not found' });
      console.log(`[ADMIN AUDIT] Verified Admin Deleted Discovery: ${req.params.id} (Authorized: ${req.user?.email || 'admin-secret'})`);
      res.json({
        success: true,
        id: req.params.id,
        message: 'Discovery deleted successfully by verified administrator.',
        deletedBy: req.user?.name || 'Administrator',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete discovery', details: err?.message });
    }
  });

  // Admin Discovery Management: Dedicated Admin List with Deletion Access
  app.get('/api/admin/discoveries', requireAdmin, (_req: AuthenticatedRequest, res) => {
    try {
      const discoveries = store.getDiscoveries();
      res.json({
        discoveries,
        total: discoveries.length,
        adminDeletionAuthorized: true,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch admin discoveries', details: err?.message });
    }
  });

  // Dedicated Admin Delete Route
  app.delete('/api/admin/discoveries/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const ok = store.deleteDiscovery(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Discovery not found' });
      console.log(`[ADMIN AUDIT] Admin Portal Purged Discovery: ${req.params.id}`);
      res.json({ success: true, id: req.params.id, message: 'Purged by Administrator' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to purge discovery', details: err?.message });
    }
  });

  // Create Discovery (Supports Google / Supabase Authenticated Explorers)
  app.post(['/api/discoveries', '/api/places'], (req: AuthenticatedRequest, res) => {
    try {
      const { title, location, categories, description, imageUrl, coordinates, usefulInfo, author } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      // Resolve author: prefer authenticated session (Google / Supabase / Store user)
      const sessionUser = req.user;
      const currentUser = store.getCurrentUser();

      const authorPayload = {
        id: author?.id || sessionUser?.id || currentUser.id,
        name: author?.name || sessionUser?.name || currentUser.name,
        handle: author?.handle || sessionUser?.handle || currentUser.handle,
        avatarUrl: author?.avatarUrl || sessionUser?.avatarUrl || currentUser.avatarUrl,
        isFollowing: true,
      };

      const created = store.createDiscovery({
        title,
        location: location || 'Mysuru, Karnataka',
        distanceKm: req.body.distanceKm || 1.5,
        coordinates: coordinates || { lat: 12.2958, lng: 76.6394 },
        description,
        categories: categories && categories.length ? categories : ['Viewpoint'],
        imageUrl: imageUrl || '/intro/assets/chamundi_hills_sunset.png',
        author: authorPayload,
        isHiddenGem: req.body.isHiddenGem ?? true,
        usefulInfo: usefulInfo || {
          bestTime: 'Sunset (5:00 - 6:30 PM)',
          entryFee: 'Free',
          crowdLevel: 'Low',
        },
      });

      console.log(`[POST DISCOVERY] Created "${created.title}" by ${authorPayload.name} (${authorPayload.handle})`);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create discovery', details: err?.message });
    }
  });

  // Like Toggle
  app.post('/api/discoveries/:id/like', (req, res) => {
    try {
      const result = store.toggleLike(req.params.id);
      if (!result) return res.status(404).json({ error: 'Discovery not found' });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to toggle like', details: err?.message });
    }
  });

  // Bookmark / Save Toggle
  app.post('/api/discoveries/:id/save', (req, res) => {
    try {
      const result = store.toggleSave(req.params.id);
      if (!result) return res.status(404).json({ error: 'Discovery not found' });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to toggle save', details: err?.message });
    }
  });

  // Comments List & Add
  app.get('/api/discoveries/:id/comments', (req, res) => {
    try {
      const comments = store.getComments(req.params.id);
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch comments', details: err?.message });
    }
  });

  app.post('/api/discoveries/:id/comments', (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Comment text is required' });
      }
      const comment = store.addComment(req.params.id, text.trim());
      res.status(201).json(comment);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to post comment', details: err?.message });
    }
  });

  // Saved Places
  app.get('/api/saved', (_req, res) => {
    try {
      const saved = store.getSavedPlaces();
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch saved places', details: err?.message });
    }
  });

  // Collections
  app.get('/api/collections', (_req, res) => {
    try {
      const collections = store.getCollections();
      res.json(collections);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch collections', details: err?.message });
    }
  });

  app.post('/api/collections', (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Collection name is required' });
      const col = store.createCollection(name, description);
      res.status(201).json(col);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create collection', details: err?.message });
    }
  });

  app.post('/api/collections/:id/items', (req, res) => {
    try {
      const { discoveryId } = req.body;
      if (!discoveryId) return res.status(400).json({ error: 'discoveryId is required' });
      const added = store.addDiscoveryToCollection(req.params.id, discoveryId);
      res.json({ success: added });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to add item to collection', details: err?.message });
    }
  });

  // User Profile
  app.get('/api/profile', (_req, res) => {
    try {
      const user = store.getCurrentUser();
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch profile', details: err?.message });
    }
  });

  app.patch('/api/profile', (req, res) => {
    try {
      const updated = store.updateProfile(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update profile', details: err?.message });
    }
  });

  // Follow User
  app.post('/api/users/:id/follow', (req, res) => {
    try {
      const result = store.toggleFollow(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to toggle follow', details: err?.message });
    }
  });

  // Gamification & Discoverer Levels
  app.get('/api/achievements', (_req, res) => {
    try {
      const data = store.getAchievements();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch achievements', details: err?.message });
    }
  });

  // Notifications
  app.get('/api/notifications', (_req, res) => {
    try {
      res.json(store.getNotifications());
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch notifications', details: err?.message });
    }
  });

  app.post('/api/notifications/read', (_req, res) => {
    try {
      store.markNotificationsRead();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to mark notifications read', details: err?.message });
    }
  });

  // Image Upload Endpoint (supports base64 data URI or raw JSON)
  app.post('/api/upload', (req, res) => {
    try {
      const { dataUri, filename } = req.body;
      if (!dataUri) {
        return res.status(400).json({ error: 'dataUri is required' });
      }
      const uploadsDir = path.join(__dirname, 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const cleanName = (filename || `upload-${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(uploadsDir, cleanName);

      const base64Data = dataUri.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      res.json({ url: `/uploads/${cleanName}`, filename: cleanName, success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Upload failed', details: err?.message });
    }
  });

  // Delete Comment
  app.delete('/api/discoveries/:id/comments/:commentId', (req, res) => {
    try {
      const ok = store.deleteComment(req.params.commentId);
      if (!ok) return res.status(404).json({ error: 'Comment not found' });
      res.json({ success: true, commentId: req.params.commentId });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete comment', details: err?.message });
    }
  });

  // ==========================================
  // BEYOND LOCAL AI SERVICES
  // ==========================================

  // AI Hardware & Model Status
  app.get('/api/ai/status', (_req, res) => {
    res.json(aiService.getStatus());
  });

  // AI Natural-Language Discovery Assistant
  app.post('/api/ai/discover', (req, res) => {
    try {
      const { query } = req.body;
      if (!query || !query.trim()) {
        return res.status(400).json({ error: 'Query is required' });
      }
      const result = aiService.parseNaturalLanguageQuery(query.trim());
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to process AI query', details: err?.message });
    }
  });

  // AI Description & Tag Assistant
  app.post('/api/ai/describe', (req, res) => {
    try {
      const { placeName, category, rawNotes } = req.body;
      const result = aiService.generateDiscoveryDescription(placeName || 'Hidden Spot', category || 'Viewpoint', rawNotes || '');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate AI description', details: err?.message });
    }
  });

  // AI Category Suggestions
  app.post('/api/ai/suggest-categories', (req, res) => {
    try {
      const { text } = req.body;
      const result = aiService.suggestCategories(text || '');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to suggest categories', details: err?.message });
    }
  });

  // JSON parse error & generic error handler middleware
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Malformed JSON payload', details: err.message });
    }
    next(err);
  });

  // ==========================================
  // UNMATCHED API & ASSET ROUTES (404)
  // ==========================================
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  app.all(['/intro/*', '/uploads/*'], (_req, res) => {
    res.status(404).json({ error: 'Asset not found' });
  });

  // ==========================================
  // STATIC SERVE & VITE INTEGRATION
  // ==========================================
  const distPath = path.join(process.cwd(), 'dist');
  if (process.env.NODE_ENV === 'production' || process.env.SERVE_DIST === 'true' || fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log(`📦 Serving compiled bundle from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BEYOND Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
