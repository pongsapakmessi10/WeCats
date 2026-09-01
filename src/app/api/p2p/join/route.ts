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

    // 2. Prevent duplicate clone sessions for the same user account
    if (userId) {
      await prisma.activePeer.deleteMany({
        where: {
          userId,
          id: { not: peerId },
        },
      });
    } else if (username && username !== 'Player' && username !== 'เพื่อนแมว') {
      await prisma.activePeer.deleteMany({
        where: {
          username,
          id: { not: peerId },
        },
      });
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
        roomId,
        userId,
        username,
        catJson: JSON.stringify(catDataToStore),
        lastSeen: now,
      },
      create: {
        id: peerId,
        roomId,
        userId,
        username,
        catJson: JSON.stringify(catDataToStore),
        lastSeen: now,
      },
    });

    // 4. Query active peers in the same room (excluding myself and other tabs of my account)
    const activePeers = await prisma.activePeer.findMany({
      where: {
        roomId,
        id: { not: peerId },
        ...(userId ? { userId: { not: userId } } : {}),
        ...(username && username !== 'Player' ? { username: { not: username } } : {}),
        lastSeen: { gte: staleThreshold },
      },
    });

    // 4. Return strictly de-duplicated peers to all clients
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

      const identifier = p.userId || p.username || cat.name || p.id;
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
