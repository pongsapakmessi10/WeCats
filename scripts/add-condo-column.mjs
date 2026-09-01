import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const urlObj = new URL(process.env.DATABASE_URL);
const authToken = urlObj.searchParams.get('authToken');
const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

const client = createClient({
  url: cleanUrl,
  authToken,
});

async function main() {
  try {
    await client.execute(`ALTER TABLE "CatProfile" ADD COLUMN "condoJson" TEXT NOT NULL DEFAULT '{}';`);
    console.log('✅ Added condoJson column to CatProfile table on Turso!');
  } catch (err) {
    if (err.message?.includes('duplicate column name')) {
      console.log('Column condoJson already exists.');
    } else {
      console.log('Alter column result:', err.message);
    }
  }
}

main();
