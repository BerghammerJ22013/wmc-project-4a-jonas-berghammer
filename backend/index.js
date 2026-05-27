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

// ─── Start ────────────────────────────────────────────────────────────────────

await createTables();
await seed();

app.listen(PORT, () => console.log(`SportSync API running on http://localhost:${PORT}`));
