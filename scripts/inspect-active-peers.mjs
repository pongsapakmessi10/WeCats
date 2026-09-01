import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('No DATABASE_URL found.');
    return;
  }

  let url = dbUrl;
  let authToken = process.env.TURSO_AUTH_TOKEN;

  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    const urlObj = new URL(dbUrl);
    authToken = urlObj.searchParams.get('authToken') || process.env.TURSO_AUTH_TOKEN || undefined;
    url = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  }

  const client = createClient({
    url,
    authToken,
  });

  const res = await client.execute(`SELECT id, roomId, userId, username, lastSeen, createdAt FROM ActivePeer ORDER BY lastSeen DESC;`);
  console.log('--- ALL ActivePeer ROWS in DB ---');
  console.table(res.rows);
}

main().catch(console.error);
