import Pusher from 'pusher';

const pusher = new Pusher({
  appId: '2190587',
  key: 'c3033ba642dda6c25d10',
  secret: '3d67309adbf9c9bb602a',
  cluster: 'ap1',
  useTLS: true,
});

async function main() {
  console.log('=== QUERYING LIVE USERS IN ALL ACTIVE PUSHER CHANNELS ===\n');

  const channels = [
    'presence-cmthgycao0004vlk8eymqw5bk',
    'presence-dusit',
    'presence-testroom',
    'presence-public-sakura',
    'presence-public-sunshine',
    'presence-public-moonlight',
  ];

  for (const ch of channels) {
    try {
      const res = await pusher.get({ path: `/channels/${ch}`, params: { info: 'user_count' } });
      const data = await res.json();
      const count = data?.user_count ?? 0;
      console.log(`📡 [${ch}]: ${count} active player(s) online`);

      if (count > 0) {
        try {
          const usersRes = await pusher.get({ path: `/channels/${ch}/users` });
          const usersData = await usersRes.json();
          console.log('   👥 Connected Users List:', JSON.stringify(usersData.users, null, 2));
        } catch (uErr) {
          console.log('   (Could not fetch user details)');
        }
      }
    } catch (err) {
      console.log(`📡 [${ch}]: 0 active players`);
    }
  }
}

main().catch(console.error);
