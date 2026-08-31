import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '123456',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY || 'pusher_dummy_key',
  secret: process.env.PUSHER_SECRET || 'pusher_dummy_secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || 'ap1',
  useTLS: true,
});
