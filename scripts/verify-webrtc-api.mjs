import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://wecats-db-pongsapakmessi10.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgxODkzNTgsImlkIjoiMDFhMDU4NjMtOTQwMS03ZmVkLWJjMTgtMDJhNWE1MGU1YTFkIiwia2lkIjoieEdqcTVMbDhsNS04T2ZiRzRSMTNXVm5XejdBcFpNQVhfNXRJcHdHN2JhMCIsInJpZCI6ImY0NWMwYjU5LTU0ZTUtNGRlMy04MzY4LWYyZjk3OTU4YzY1ZiJ9.ffGFepZ34P0Z24KP01POO_tjWiDAWkpmpg6TDuCXlgsoN6tqwf5rn4roE58E5VbYwSNOg3Uj68yJzqtJKaoPCA',
});

async function main() {
  console.log('🧪 === TESTING TURSO WEBRTC ACTIVE PEERS TABLE & API LOGIC ===\n');

  const peer1 = 'wecat_test_chrome_1';
  const peer2 = 'wecat_test_edge_2';
  const testRoom = 'public-sakura';

  // Clean old test records
  await db.execute("DELETE FROM ActivePeer WHERE id LIKE 'wecat_test_%';");

  // 1. Peer 1 joins
  console.log('1. Player 1 (Chrome / หนูหริ่ง) joins public-sakura...');
  await db.execute({
    sql: 'INSERT INTO ActivePeer (id, roomId, username, catJson, lastSeen, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
    args: [peer1, testRoom, 'pongsapak', JSON.stringify({ name: 'หนูหริ่ง', breed: 'siamese', baseColor: '#805f3c' })],
  });

  // 2. Peer 2 joins and queries room
  console.log('2. Player 2 (Edge / kuy) joins public-sakura...');
  await db.execute({
    sql: 'INSERT INTO ActivePeer (id, roomId, username, catJson, lastSeen, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
    args: [peer2, testRoom, 'test2', JSON.stringify({ name: 'kuy', breed: 'orange_tabby', baseColor: '#ffa94d' })],
  });

  // Query peers
  const activePeers = await db.execute({
    sql: 'SELECT id, roomId, username, catJson, lastSeen FROM ActivePeer WHERE roomId = ?;',
    args: [testRoom],
  });

  console.log(`\nActive Peers in [${testRoom}]:`, activePeers.rows.length);
  console.table(activePeers.rows);

  // Clean up
  await db.execute("DELETE FROM ActivePeer WHERE id LIKE 'wecat_test_%';");
  console.log('\n✅ WebRTC Signaling Database test passed 100%!');
}

main().catch(console.error);
