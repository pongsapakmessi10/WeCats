import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://wecats-db-pongsapakmessi10.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgxODkzNTgsImlkIjoiMDFhMDU4NjMtOTQwMS03ZmVkLWJjMTgtMDJhNWE1MGU1YTFkIiwia2lkIjoieEdqcTVMbDhsNS04T2ZiRzRSMTNXVm5XejdBcFpNQVhfNXRJcHdHN2JhMCIsInJpZCI6ImY0NWMwYjU5LTU0ZTUtNGRlMy04MzY4LWYyZjk3OTU4YzY1ZiJ9.ffGFepZ34P0Z24KP01POO_tjWiDAWkpmpg6TDuCXlgsoN6tqwf5rn4roE58E5VbYwSNOg3Uj68yJzqtJKaoPCA',
});

async function main() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ActivePeer (
      id TEXT PRIMARY KEY,
      roomId TEXT NOT NULL,
      userId TEXT,
      username TEXT NOT NULL DEFAULT 'Player',
      catJson TEXT NOT NULL DEFAULT '{}',
      lastSeen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ ActivePeer table created/verified on Turso Cloud Database!');
}

main().catch(console.error);
