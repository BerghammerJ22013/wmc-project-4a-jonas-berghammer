'use strict';

import 'dotenv/config';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { Server } from 'socket.io';
import { getDb } from './database.js';
import { createTables } from './schema.js';
import { seed } from './seed.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const upload = multer({ dest: 'uploads/' });

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGIN },
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────

app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const db = await getDb();
  const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hash = await bcrypt.hash(password, 10);
  const { lastID } = await db.run(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    email, hash,
  );

  const token = jwt.sign({ id: lastID, email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) return res.status(401).json({ error: 'Ungültige E-Mail oder Passwort' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Ungültige E-Mail oder Passwort' });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, onboarding_complete: !!user.onboarding_complete });
});

// Stateless JWT – Client löscht Token, Server bestätigt nur
app.post('/auth/logout', auth, (_req, res) => {
  res.json({ success: true });
});

// ─── Sports ──────────────────────────────────────────────────────────────────

app.get('/sports', async (_req, res) => {
  const db = await getDb();
  res.json(await db.all('SELECT * FROM sports ORDER BY name'));
});

// ─── User / Profil ───────────────────────────────────────────────────────────

app.get('/users/me', auth, async (req, res) => {
  const db = await getDb();
  const user = await db.get(
    'SELECT id, email, name, age, location, latitude, longitude, search_radius, bio, profile_picture, language, onboarding_complete FROM users WHERE id = ?',
    req.user.id,
  );
  const sports = await db.all(
    'SELECT s.id, s.name FROM sports s JOIN user_sports us ON us.sport_id = s.id WHERE us.user_id = ?',
    req.user.id,
  );
  res.json({ ...user, sports });
});

app.put('/users/me', auth, async (req, res) => {
  const { name, age, location, latitude, longitude, search_radius, bio, language, onboarding_complete } = req.body;
  const db = await getDb();
  await db.run(
    `UPDATE users SET name = ?, age = ?, location = ?, latitude = ?, longitude = ?,
     search_radius = ?, bio = ?, language = ?, onboarding_complete = ? WHERE id = ?`,
    name, age, location, latitude, longitude, search_radius, bio, language,
    onboarding_complete ? 1 : 0, req.user.id,
  );
  res.json({ success: true });
});

app.put('/users/me/sports', auth, async (req, res) => {
  const { sports } = req.body;
  if (!Array.isArray(sports)) return res.status(400).json({ error: 'sports must be an array of ids' });
  const db = await getDb();
  await db.run('DELETE FROM user_sports WHERE user_id = ?', req.user.id);
  for (const sportId of sports) {
    await db.run('INSERT OR IGNORE INTO user_sports (user_id, sport_id) VALUES (?, ?)', req.user.id, sportId);
  }
  res.json({ success: true });
});

app.post('/users/me/picture', auth, upload.single('picture'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const db = await getDb();
  await db.run('UPDATE users SET profile_picture = ? WHERE id = ?', req.file.filename, req.user.id);
  res.json({ filename: req.file.filename });
});

// ─── Discover ────────────────────────────────────────────────────────────────

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

app.get('/discover', auth, async (req, res) => {
  const db = await getDb();

  const me = await db.get(
    'SELECT latitude, longitude, search_radius FROM users WHERE id = ?',
    req.user.id,
  );
  const mySports = await db.all(
    'SELECT sport_id FROM user_sports WHERE user_id = ?',
    req.user.id,
  );
  const mySportIds = new Set(mySports.map((s) => s.sport_id));

  const candidates = await db.all(
    `SELECT id, name, age, location, bio, profile_picture, latitude, longitude
     FROM users
     WHERE id != ?
       AND id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = ?)`,
    req.user.id, req.user.id,
  );

  const results = [];
  for (const u of candidates) {
    let distance_km = null;

    // radius filter — skip if either has no location
    if (me.latitude && me.longitude && u.latitude && u.longitude) {
      const dist = haversineKm(me.latitude, me.longitude, u.latitude, u.longitude);
      if (dist > (me.search_radius ?? 50)) continue;
      distance_km = Math.round(dist);
    }

    // sports filter — only apply if both users have sports set
    if (mySportIds.size > 0) {
      const theirSports = await db.all(
        'SELECT sport_id FROM user_sports WHERE user_id = ?',
        u.id,
      );
      if (theirSports.length > 0) {
        const overlap = theirSports.some((s) => mySportIds.has(s.sport_id));
        if (!overlap) continue;
      }
    }

    const sports = await db.all(
      'SELECT s.name FROM sports s JOIN user_sports us ON us.sport_id = s.id WHERE us.user_id = ?',
      u.id,
    );
    results.push({ ...u, sports, distance_km });
  }

  res.json(results);
});

app.post('/swipes', auth, async (req, res) => {
  const { swiped_id, direction } = req.body;
  if (!swiped_id || !['like', 'pass'].includes(direction)) {
    return res.status(400).json({ error: 'swiped_id and direction (like/pass) required' });
  }
  const db = await getDb();
  await db.run(
    'INSERT OR IGNORE INTO swipes (swiper_id, swiped_id, direction) VALUES (?, ?, ?)',
    req.user.id, swiped_id, direction,
  );

  let matched = false;
  if (direction === 'like') {
    const mutual = await db.get(
      'SELECT id FROM swipes WHERE swiper_id = ? AND swiped_id = ? AND direction = ?',
      swiped_id, req.user.id, 'like',
    );
    if (mutual) {
      await db.run(
        'INSERT OR IGNORE INTO matches (user1_id, user2_id) VALUES (?, ?)',
        Math.min(req.user.id, swiped_id), Math.max(req.user.id, swiped_id),
      );
      matched = true;
      const me = await db.get('SELECT id, name, profile_picture, location FROM users WHERE id = ?', req.user.id);
      io.to(`user:${swiped_id}`).emit('match', me);
    }
  }

  res.json({ success: true, matched });
});

// ─── Chats / Matches ─────────────────────────────────────────────────────────

app.get('/likes/received', auth, async (req, res) => {
  const db = await getDb();
  const rows = await db.all(
    `SELECT u.id, u.name, u.profile_picture, u.location
     FROM swipes s
     JOIN users u ON u.id = s.swiper_id
     WHERE s.swiped_id = ?
       AND s.direction = 'like'
       AND NOT EXISTS (
         SELECT 1 FROM swipes s2
         WHERE s2.swiper_id = ? AND s2.swiped_id = s.swiper_id
       )`,
    req.user.id, req.user.id,
  );
  res.json(rows);
});

app.get('/matches', auth, async (req, res) => {
  const db = await getDb();
  const rows = await db.all(
    `SELECT m.id, m.created_at,
            u.id AS partner_id, u.name, u.profile_picture, u.location,
            (SELECT content    FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) AS last_content,
            (SELECT sender_id  FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) AS last_sender_id,
            (SELECT created_at FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) AS last_at,
            (SELECT COUNT(*)   FROM messages WHERE match_id = m.id AND sender_id != ? AND is_read = 0) AS unread
     FROM matches m
     JOIN users u ON u.id = CASE WHEN m.user1_id = ? THEN m.user2_id ELSE m.user1_id END
     WHERE m.user1_id = ? OR m.user2_id = ?
     ORDER BY COALESCE(last_at, m.created_at) DESC`,
    req.user.id, req.user.id, req.user.id, req.user.id,
  );
  res.json(rows);
});

app.get('/matches/:id/messages', auth, async (req, res) => {
  const db = await getDb();
  const match = await db.get(
    'SELECT id FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    req.params.id, req.user.id, req.user.id,
  );
  if (!match) return res.status(404).json({ error: 'Match not found' });

  await db.run(
    'UPDATE messages SET is_read = 1 WHERE match_id = ? AND sender_id != ?',
    req.params.id, req.user.id,
  );

  const messages = await db.all(
    'SELECT id, sender_id, content, is_read, created_at FROM messages WHERE match_id = ? ORDER BY created_at ASC',
    req.params.id,
  );
  res.json(messages);
});

app.post('/matches/:id/messages', auth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'content required' });

  const db = await getDb();
  const match = await db.get(
    'SELECT id FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
    req.params.id, req.user.id, req.user.id,
  );
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const { lastID } = await db.run(
    'INSERT INTO messages (match_id, sender_id, content) VALUES (?, ?, ?)',
    req.params.id, req.user.id, content.trim(),
  );
  const msg = await db.get('SELECT id, match_id, sender_id, content, is_read, created_at FROM messages WHERE id = ?', lastID);
  io.to(`match:${req.params.id}`).emit('new_message', msg);
  res.status(201).json(msg);
});

// ─── Socket.io ───────────────────────────────────────────────────────────────

io.use((socket, next) => {
  try {
    socket.user = jwt.verify(socket.handshake.auth.token, JWT_SECRET);
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${socket.user.id}`);

  socket.on('join_match', async (matchId) => {
    const db = await getDb();
    const match = await db.get(
      'SELECT id FROM matches WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      matchId, socket.user.id, socket.user.id,
    );
    if (match) socket.join(`match:${matchId}`);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

await createTables();
await seed();

httpServer.listen(PORT, () => console.log(`SportSync API running on http://localhost:${PORT}`));
