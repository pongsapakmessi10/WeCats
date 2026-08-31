import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const urlObj = new URL(process.env.DATABASE_URL);
const authToken = urlObj.searchParams.get('authToken');
const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

console.log('Connecting to Turso at:', cleanUrl);

const client = createClient({
  url: cleanUrl,
  authToken,
});

async function main() {
  console.log('Creating tables on Turso Cloud Database...');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "username" TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT,
      "isGuest" INTEGER NOT NULL DEFAULT 0,
      "fishCoins" INTEGER NOT NULL DEFAULT 150,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "CatProfile" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "slotIndex" INTEGER NOT NULL DEFAULT 0,
      "name" TEXT NOT NULL DEFAULT 'Mochi (โมจิ)',
      "gender" TEXT NOT NULL DEFAULT 'boy',
      "breed" TEXT NOT NULL DEFAULT 'orange_tabby',
      "bodyType" TEXT NOT NULL DEFAULT 'chonky',
      "earType" TEXT NOT NULL DEFAULT 'pointed',
      "tailType" TEXT NOT NULL DEFAULT 'fluffy',
      "eyeType" TEXT NOT NULL DEFAULT 'sparkle',
      "eyeColorLeft" TEXT NOT NULL DEFAULT '#2ec4b6',
      "eyeColorRight" TEXT NOT NULL DEFAULT '#ffbf69',
      "baseColor" TEXT NOT NULL DEFAULT '#ffa94d',
      "patternType" TEXT NOT NULL DEFAULT 'tabby',
      "patternColor" TEXT NOT NULL DEFAULT '#d97706',
      "snoutColor" TEXT NOT NULL DEFAULT '#ffffff',
      "pawColor" TEXT NOT NULL DEFAULT '#ffffff',
      "bellyColor" TEXT NOT NULL DEFAULT '#fff3bf',
      "accessoryHead" TEXT NOT NULL DEFAULT 'straw_hat',
      "accessoryNeck" TEXT NOT NULL DEFAULT 'gold_bell',
      "accessoryBack" TEXT NOT NULL DEFAULT 'backpack',
      "accessoryFace" TEXT NOT NULL DEFAULT 'cute_blush',
      "aura" TEXT NOT NULL DEFAULT 'sparkles',
      "personality" TEXT NOT NULL DEFAULT 'chaotic',
      "statsJson" TEXT NOT NULL DEFAULT '{}',
      "unlockedItemsJson" TEXT NOT NULL DEFAULT '["straw_hat","gold_bell","backpack","cute_blush","sparkles"]',
      "photosJson" TEXT NOT NULL DEFAULT '[]',
      "friendsJson" TEXT NOT NULL DEFAULT '[]',
      "diaryJson" TEXT NOT NULL DEFAULT '[]',
      "achievementsJson" TEXT NOT NULL DEFAULT '[]',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Room" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'public',
      "passcode" TEXT,
      "theme" TEXT NOT NULL DEFAULT 'sakura',
      "maxCapacity" INTEGER NOT NULL DEFAULT 20,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ All tables successfully created on Turso!');

  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log('Tables in Turso database:', tables.rows.map(r => r.name));
}

main().catch(err => {
  console.error('Error connecting or creating tables:', err);
  process.exit(1);
});
