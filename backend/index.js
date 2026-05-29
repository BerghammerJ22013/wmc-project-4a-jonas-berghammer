'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { getDb } from './database.js';
import { createTables } from './schema.js';
import { seed } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const upload = multer({ dest: 'uploads/' });

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors());
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
    // radius filter — skip if either has no location
    if (me.latitude && me.longitude && u.latitude && u.longitude) {
      const dist = haversineKm(me.latitude, me.longitude, u.latitude, u.longitude);
      if (dist > (me.search_radius ?? 50)) continue;
    }

    // sports filter — skip if no overlap (only when current user has sports set)
    if (mySportIds.size > 0) {
      const theirSports = await db.all(
        'SELECT sport_id FROM user_sports WHERE user_id = ?',
        u.id,
      );
      const overlap = theirSports.some((s) => mySportIds.has(s.sport_id));
      if (!overlap) continue;
    }

    const sports = await db.all(
      'SELECT s.name FROM sports s JOIN user_sports us ON us.sport_id = s.id WHERE us.user_id = ?',
      u.id,
    );
    results.push({ ...u, sports });
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
  res.json({ success: true });
});

// ─── Start ────────────────────────────────────────────────────────────────────

await createTables();
await seed();

app.listen(PORT, () => console.log(`SportSync API running on http://localhost:${PORT}`));
