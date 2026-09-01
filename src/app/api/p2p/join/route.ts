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

    let cleanRoomId = roomId;
    try {
      cleanRoomId = decodeURIComponent(roomId).trim().toLowerCase().replace(/^presence-/, '');
    } catch {
      cleanRoomId = roomId.trim().toLowerCase().replace(/^presence-/, '');
    }

    const now = new Date();
    const staleThreshold = new Date(Date.now() - 12000); // 12s cutoff (3 heartbeat cycles)
    const userId = session?.userId || null;
    const username = session?.username || catCustomization?.name || 'Player';

    // 1. Clean up stale peers in background
    prisma.activePeer
      .deleteMany({
        where: {
          lastSeen: { lt: staleThreshold },
        },
      })
      .catch(() => {});

    // 2. Prevent duplicate clone sessions for the same logged-in account
    if (userId) {
      await prisma.activePeer.deleteMany({
        where: {
          userId,
          id: { not: peerId },
        },
      }).catch(() => {});
    }

    const catDataToStore = {
      ...(catCustomization || {}),
      x: typeof pos?.x === 'number' ? pos.x : 700,
      y: typeof pos?.y === 'number' ? pos.y : 480,
      direction: pos?.direction || 'down',
    };

    // 3. Register / Update this peer in the room
    await prisma.activePeer.upsert({
      where: { id: peerId },
      update: {
        roomId: cleanRoomId,
        userId,
        username,
        catJson: JSON.stringify(catDataToStore),
        lastSeen: now,
      },
      create: {
        id: peerId,
        roomId: cleanRoomId,
        userId,
        username,
        catJson: JSON.stringify(catDataToStore),
        lastSeen: now,
      },
    });

    // 4. Query active peers in the same room (excluding myself and other tabs of my account)
    const activePeers = await prisma.activePeer.findMany({
      where: {
        roomId: cleanRoomId,
        id: { not: peerId },
        ...(userId ? { userId: { not: userId } } : {}),
        lastSeen: { gte: staleThreshold },
      },
      orderBy: { lastSeen: 'desc' },
    });

    // 5. Return all distinct active peers in the room
    const seen = new Set<string>();
    const uniquePeers: Array<{
      peerId: string;
      username: string;
      customization: any;
      x: number;
      y: number;
      direction: string;
    }> = [];

    for (const p of activePeers) {
      let cat: any = {};
      try {
        cat = JSON.parse(p.catJson);
      } catch {}

      const identifier = p.userId || p.id;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniquePeers.push({
          peerId: p.id,
          username: p.username,
          customization: cat,
          x: cat.x ?? 700,
          y: cat.y ?? 480,
          direction: cat.direction ?? 'down',
        });
      }
    }

    return NextResponse.json({
      success: true,
      peers: uniquePeers,
    });
  } catch (error) {
    console.error('P2P Join error:', error);
    return NextResponse.json({ error: 'Failed to register peer' }, { status: 500 });
  }
}
