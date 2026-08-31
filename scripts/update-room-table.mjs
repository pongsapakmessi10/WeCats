import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://wecats-db-pongsapakmessi10.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODgxODkzNTgsImlkIjoiMDFhMDU4NjMtOTQwMS03ZmVkLWJjMTgtMDJhNWE1MGU1YTFkIiwia2lkIjoieEdqcTVMbDhsNS04T2ZiRzRSMTNXVm5XejdBcFpNQVhfNXRJcHdHN2JhMCIsInJpZCI6ImY0NWMwYjU5LTU0ZTUtNGRlMy04MzY4LWYyZjk3OTU4YzY1ZiJ9.ffGFepZ34P0Z24KP01POO_tjWiDAWkpmpg6TDuCXlgsoN6tqwf5rn4roE58E5VbYwSNOg3Uj68yJzqtJKaoPCA',
});

async function main() {
  try {
    await db.execute('ALTER TABLE Room ADD COLUMN ownerId TEXT;');
  } catch {}
  try {
    await db.execute('ALTER TABLE Room ADD COLUMN ownerName TEXT;');
  } catch {}
  console.log('✅ Room table updated with ownerId and ownerName!');
}

main().catch(console.error);
