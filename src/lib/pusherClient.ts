import PusherClient from 'pusher-js';

let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient | null => {
  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1';

  if (!key || key === 'pusher_dummy_key') {
    return null; // Gracefully fallback if keys are not set yet
  }

  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(key, {
      cluster,
      authEndpoint: '/api/pusher/auth',
    });
  }

  return pusherClientInstance;
};
