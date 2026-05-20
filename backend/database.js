import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

let db;

export async function getDb() {
  if (!db) {
    db = await open({ filename: 'sportsync.db', driver: sqlite3.Database });
    await db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}
