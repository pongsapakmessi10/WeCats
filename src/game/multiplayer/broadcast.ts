import { getPusherClient } from '@/lib/pusherClient';
import { useCatStore } from '@/store/catStore';

export async function broadcastLiveChat(text?: string, emote?: string) {
  const currentRoom = useCatStore.getState().currentRoom;
  const channelName = currentRoom.id.startsWith('presence-')
    ? `presence-${currentRoom.id.replace(/^presence-/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`
    : `presence-${currentRoom.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const pusher = getPusherClient();
  const socketId = pusher?.connection?.socket_id;

  try {
    await fetch('/api/pusher/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: channelName,
        event: 'cat-chat',
        data: {
          text,
          emote,
          senderName: useCatStore.getState().myCat.name,
        },
        socketId,
      }),
    });
  } catch {}
}

export async function broadcastLiveFriendAction(type: 'request' | 'treat') {
  const currentRoom = useCatStore.getState().currentRoom;
  const channelName = currentRoom.id.startsWith('presence-')
    ? `presence-${currentRoom.id.replace(/^presence-/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`
    : `presence-${currentRoom.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const pusher = getPusherClient();
  const socketId = pusher?.connection?.socket_id;

  try {
    await fetch('/api/pusher/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: channelName,
        event: 'cat-friend-action',
        data: {
          type,
          senderName: useCatStore.getState().myCat.name,
        },
        socketId,
      }),
    });
  } catch {}
}
