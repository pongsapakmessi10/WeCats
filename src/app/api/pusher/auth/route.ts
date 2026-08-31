import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusherServer';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Invalid socket_id or channel_name' }, { status: 400 });
    }

    const userId = session?.userId || `guest_${Math.random().toString(36).substring(2, 9)}`;
    const username = session?.username || `Cat_${Math.floor(1000 + Math.random() * 9000)}`;

    const presenceData = {
      user_id: userId,
      user_info: {
        id: userId,
        username,
        isGuest: !session,
      },
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channelName, presenceData);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Unauthorized Pusher channel' }, { status: 403 });
  }
}
