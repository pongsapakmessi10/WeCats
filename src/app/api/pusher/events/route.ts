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

    const payload = {
      ...data,
      senderId: session?.userId || data.senderId,
      senderName: session?.username || data.senderName,
      timestamp: Date.now(),
    };

    // Trigger event to all clients in channel (optionally exclude sender socketId)
    if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
      await pusherServer.trigger(channel, event, payload, socketId ? { socket_id: socketId } : undefined);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Gracefully handle unconfigured pusher or rate limits without 500 spam
    console.warn('Pusher trigger warning:', error);
    return NextResponse.json({ success: false, warning: 'Pusher event trigger skipped' }, { status: 200 });
  }
}
