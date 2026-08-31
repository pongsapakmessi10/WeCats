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
    await pusherServer.trigger(channel, event, payload, socketId ? { socket_id: socketId } : undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return NextResponse.json({ error: 'Failed to broadcast event' }, { status: 500 });
  }
}
