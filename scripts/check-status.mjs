import { createClient } from '@libsql/client';
import Pusher from 'pusher';

const db = createClient({
  url: 'libsql://wecats-db-pongsapakmessi10.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgxODkzNTgsImlkIjoiMDFhMDU4NjMtOTQwMS03ZmVkLWJjMTgtMDJhNWE1MGU1YTFkIiwia2lkIjoieEdqcTVMbDhsNS04T2ZiRzRSMTNXVm5XejdBcFpNQVhfNXRJcHdHN2JhMCIsInJpZCI6ImY0NWMwYjU5LTU0ZTUtNGRlMy04MzY4LWYyZjk3OTU4YzY1ZiJ9.ffGFepZ34P0Z24KP01POO_tjWiDAWkpmpg6TDuCXlgsoN6tqwf5rn4roE58E5VbYwSNOg3Uj68yJzqtJKaoPCA',
});

const pusher = new Pusher({
  appId: '2190587',
  key: 'c3033ba642dda6c25d10',
  secret: '3d67309adbf9c9bb602a',
  cluster: 'ap1',
  useTLS: true,
});

async function main() {
  console.log('--- 1. DATABASE USERS & CATS ---');
  const users = await db.execute('SELECT id, username, isGuest, fishCoins, createdAt FROM User ORDER BY createdAt DESC LIMIT 10;');
  console.log('Users Count:', users.rows.length);
  console.table(users.rows);

  const cats = await db.execute('SELECT id, userId, name, breed, baseColor, patternType, slotIndex, updatedAt FROM CatProfile ORDER BY updatedAt DESC LIMIT 10;');
  console.log('\nCat Profiles:');
  console.table(cats.rows);

  const rooms = await db.execute('SELECT id, name, type, theme, maxCapacity, createdAt FROM Room ORDER BY createdAt DESC LIMIT 10;');
  console.log('\nRooms in DB:');
  console.table(rooms.rows);

  console.log('\n--- 2. REAL-TIME PUSHER PRESENCE CHANNELS ---');
  const channelsToCheck = [
    'presence-public-sakura',
    'presence-public-sunshine',
    'presence-public-moonlight',
    ...rooms.rows.map((r) => `presence-${r.id}`),
  ];

  for (const ch of channelsToCheck) {
    try {
      const res = await pusher.get({ path: `/channels/${ch}`, params: { info: 'user_count' } });
      const data = await res.json();
      console.log(`📡 Channel [${ch}]: ${data.user_count ?? 0} active player(s) online`);

      if (data.user_count > 0) {
        try {
          const userListRes = await pusher.get({ path: `/channels/${ch}/users` });
          const userData = await userListRes.json();
          console.log(`   👥 Users in ${ch}:`, userData.users);
        } catch (uErr) {
          console.log(`   (User details: ${JSON.stringify(uErr)})`);
        }
      }
    } catch (err) {
      console.log(`📡 Channel [${ch}]: 0 active players (or not subscribed yet)`);
    }
  }
}

main().catch(console.error);
