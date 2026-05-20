import { getDb } from './database.js';

export async function createTables() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      email               TEXT    UNIQUE NOT NULL,
      password_hash       TEXT    NOT NULL,
      name                TEXT,
      age                 INTEGER,
      location            TEXT,
      latitude            REAL,
      longitude           REAL,
      search_radius       INTEGER DEFAULT 50,
      bio                 TEXT,
      profile_picture     TEXT,
      language            TEXT    DEFAULT 'de',
      is_online           INTEGER DEFAULT 0,
      last_seen           TEXT,
      onboarding_complete INTEGER DEFAULT 0,
      created_at          TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sports (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_sports (
      user_id  INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
      sport_id INTEGER NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, sport_id)
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      swiper_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      swiped_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      direction  TEXT    NOT NULL CHECK(direction IN ('like', 'pass')),
      created_at TEXT    DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(swiper_id, swiped_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT    DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id   INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      sender_id  INTEGER NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
      content    TEXT    NOT NULL,
      is_read    INTEGER DEFAULT 0,
      created_at TEXT    DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Tables created');
}
