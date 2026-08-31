import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { peerId, roomId, catCustomization, pos } = body;

    if (!peerId || !roomId) {
      return NextResponse.json({ error: 'Missing peerId or roomId' }, { status: 400 });
    }

    const now = new Date();
    const staleThreshold = new Date(Date.now() - 25000); // 25s cutoff

    // Clean up stale peers in background
    prisma.activePeer
      .deleteMany({
        where: {
          lastSeen: { lt: staleThreshold },
        },
      })
      .catch(() => {});

    const catDataToStore = {
      ...(catCustomization || {}),
      x: typeof pos?.x === 'number' ? pos.x : 700,
      y: typeof pos?.y === 'number' ? pos.y : 480,
      direction: pos?.direction || 'down',
    };

    // Register / Update this peer in the room
    await prisma.activePeer.upsert({
      where: { id: peerId },
      update: {
        roomId,
        userId: session?.userId || null,
        username: session?.username || catCustomization?.name || 'Player',
        catJson: JSON.stringify(catDataToStore),
        lastSeen: now,
      },
      create: {
        id: peerId,
        roomId,
        userId: session?.userId || null,
        username: session?.username || catCustomization?.name || 'Player',
        catJson: JSON.stringify(catDataToStore),
        lastSeen: now,
      },
    });

    // Query active peers in the same room (excluding myself)
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
    console.error('P2P Join error:', error);
    return NextResponse.json({ error: 'Failed to register peer' }, { status: 500 });
  }
}
