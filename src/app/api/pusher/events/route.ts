import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusherServer';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { channel, event, data, socketId } = body;

    if (!channel || !event || !data) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }

    // Preserve the client-provided senderId (which matches Pusher presence user_id)
    const payload = {
      ...data,
      senderId: data.senderId || session?.userId,
      senderName: data.senderName || session?.username,
      timestamp: Date.now(),
    };

    // Trigger event to all clients in channel (exclude sender socketId so sender doesn't process own event twice)
    if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
      await pusherServer.trigger(
        channel,
        event,
        payload,
        socketId ? { socket_id: socketId } : undefined
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Gracefully handle unconfigured pusher or rate limits without 500 spam
    console.warn('Pusher trigger warning:', error);
    return NextResponse.json({ success: false, warning: 'Pusher event trigger skipped' }, { status: 200 });
  }
}
