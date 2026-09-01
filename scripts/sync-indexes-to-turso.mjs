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

  console.log(`Connecting to Turso libSQL at: ${url}...`);
  const client = createClient({
    url,
    authToken,
  });

  console.log('Applying database indexes to ActivePeer table...');
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_active_peer_room_lastseen ON ActivePeer(roomId, lastSeen);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_active_peer_user_id ON ActivePeer(userId);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_active_peer_username ON ActivePeer(username);`);

  console.log('✅ Successfully created indexes on Turso Cloud Database:');
  console.log('   - idx_active_peer_room_lastseen ON ActivePeer(roomId, lastSeen)');
  console.log('   - idx_active_peer_user_id ON ActivePeer(userId)');
  console.log('   - idx_active_peer_username ON ActivePeer(username)');
}

main().catch(console.error);
