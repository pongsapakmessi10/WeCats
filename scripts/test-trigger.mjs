import Pusher from 'pusher';

const pusher = new Pusher({
  appId: '2190587',
  key: 'c3033ba642dda6c25d10',
  secret: '3d67309adbf9c9bb602a',
  cluster: 'ap1',
  useTLS: true,
});

async function main() {
  try {
    const res = await pusher.trigger('presence-public-sakura', 'cat-joined', { test: true });
    console.log('✅ Trigger Result:', res);
  } catch (err) {
    console.error('❌ Trigger Error:', err);
  }
}

main();
