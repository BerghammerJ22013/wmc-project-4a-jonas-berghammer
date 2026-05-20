import bcrypt from 'bcryptjs';
import { getDb } from './database.js';

const SPORTS = [
  'Laufen', 'Klettern', 'Yoga', 'Fussball', 'Basketball',
  'Tennis', 'Radfahren', 'Schwimmen', 'Volleyball', 'Wandern',
  'Tischtennis', 'Krafttraining', 'Hyrox',
];

const SEED_USERS = [
  {
    email: 'anna@example.com',
    password: 'password123',
    name: 'Anna Mayer',
    age: 24,
    location: 'Linz',
    latitude: 48.3069,
    longitude: 14.2858,
    search_radius: 30,
    bio: 'Laufe gerne morgens und klettere am Wochenende.',
    language: 'de',
    sports: ['Laufen', 'Klettern', 'Yoga'],
  },
  {
    email: 'max@example.com',
    password: 'password123',
    name: 'Max Huber',
    age: 27,
    location: 'Wels',
    latitude: 48.1571,
    longitude: 14.0286,
    search_radius: 50,
    bio: 'Fussball ist meine Leidenschaft, suche Mitspieler.',
    language: 'de',
    sports: ['Fussball', 'Laufen', 'Radfahren'],
  },
  {
    email: 'sara@example.com',
    password: 'password123',
    name: 'Sara Gruber',
    age: 22,
    location: 'Grieskirchen',
    latitude: 48.2342,
    longitude: 13.8313,
    search_radius: 40,
    bio: 'Yoga-Liebhaberin und gelegentliche Schwimmerin.',
    language: 'de',
    sports: ['Yoga', 'Schwimmen', 'Wandern'],
  },
  {
    email: 'luca@example.com',
    password: 'password123',
    name: 'Luca Bauer',
    age: 26,
    location: 'Steyr',
    latitude: 48.0445,
    longitude: 14.4211,
    search_radius: 35,
    bio: 'Basketball und Tennis - immer auf der Suche nach Sparring.',
    language: 'de',
    sports: ['Basketball', 'Tennis', 'Volleyball'],
  },
  {
    email: 'mia@example.com',
    password: 'password123',
    name: 'Mia Schmidt',
    age: 23,
    location: 'Linz',
    latitude: 48.3099,
    longitude: 14.2900,
    search_radius: 25,
    bio: 'Radfahren und Wandern in der Natur.',
    language: 'en',
    sports: ['Radfahren', 'Wandern', 'Laufen'],
  },
  {
    email: 'felix@example.com',
    password: 'password123',
    name: 'Felix Wagner',
    age: 25,
    location: 'Linz',
    latitude: 48.3150,
    longitude: 14.2800,
    search_radius: 30,
    bio: 'Hyrox-Begeisterter und Krafttraining jeden Tag.',
    language: 'de',
    sports: ['Hyrox', 'Krafttraining', 'Laufen'],
  },
];

export async function seed() {
  const db = await getDb();

  const { count } = await db.get('SELECT COUNT(*) as count FROM sports');
  if (count > 0) {
    console.log('Already seeded, skipping');
    return;
  }

  for (const name of SPORTS) {
    await db.run('INSERT OR IGNORE INTO sports (name) VALUES (?)', name);
  }

  for (const u of SEED_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    const { lastID: userId } = await db.run(
      `INSERT INTO users
        (email, password_hash, name, age, location, latitude, longitude,
         search_radius, bio, language, onboarding_complete)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      u.email, hash, u.name, u.age, u.location,
      u.latitude, u.longitude, u.search_radius, u.bio, u.language,
    );

    for (const sportName of u.sports) {
      const sport = await db.get('SELECT id FROM sports WHERE name = ?', sportName);
      if (sport) {
        await db.run(
          'INSERT OR IGNORE INTO user_sports (user_id, sport_id) VALUES (?, ?)',
          userId, sport.id,
        );
      }
    }
  }

  // Sample match + messages between anna (1) and max (2)
  await db.run('INSERT OR IGNORE INTO swipes (swiper_id, swiped_id, direction) VALUES (1, 2, ?)', 'like');
  await db.run('INSERT OR IGNORE INTO swipes (swiper_id, swiped_id, direction) VALUES (2, 1, ?)', 'like');
  const { lastID: matchId } = await db.run('INSERT OR IGNORE INTO matches (user1_id, user2_id) VALUES (1, 2)');
  if (matchId) {
    await db.run('INSERT INTO messages (match_id, sender_id, content) VALUES (?, 1, ?)', matchId, 'Hey Max, laufen wir zusammen?');
    await db.run('INSERT INTO messages (match_id, sender_id, content) VALUES (?, 2, ?)', matchId, 'Klar! Wann passt dir?');
  }

  console.log('Seeded');
}
