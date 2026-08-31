import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { peerId, roomId, catCustomization, pos } = body;

    if (!peerId || !roomId) {
      return NextResponse.json({ error: 'Missing peerId or roomId' }, { status: 400 });
    }

    const isPrivate = !roomId.startsWith('public-');

    // If it's a private room, verify that the room still exists in DB
    if (isPrivate) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        // Room was deleted by host!
        return NextResponse.json({
          success: false,
          roomDeleted: true,
          roomId,
        });
      }
    }

    const now = new Date();
    const staleThreshold = new Date(Date.now() - 25000);

    const catDataToStore = {
      ...(catCustomization || {}),
      x: typeof pos?.x === 'number' ? pos.x : undefined,
      y: typeof pos?.y === 'number' ? pos.y : undefined,
      direction: pos?.direction || undefined,
    };

    // Update lastSeen for this peer
    await prisma.activePeer.updateMany({
      where: { id: peerId },
      data: {
        lastSeen: now,
        catJson: JSON.stringify(catDataToStore),
      },
    });

    // Query active peers in the room
    const activePeers = await prisma.activePeer.findMany({
      where: {
        roomId,
        id: { not: peerId },
        lastSeen: { gte: staleThreshold },
      },
    });

    return NextResponse.json({
      success: true,
      peers: activePeers.map((p) => {
        let cat: any = {};
        try {
          cat = JSON.parse(p.catJson);
        } catch {}
        return {
          peerId: p.id,
          username: p.username,
          customization: cat,
          x: cat.x ?? 700,
          y: cat.y ?? 480,
          direction: cat.direction ?? 'down',
        };
      }),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Heartbeat error' }, { status: 200 });
  }
}
