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

    const isCustomPINRoom = !cleanRoomId.startsWith('public-') && !cleanRoomId.startsWith('condo-');

    // 1. If it's a custom PIN room, verify that the room still exists in DB
    if (isCustomPINRoom) {
      const room = await prisma.room.findUnique({
        where: { id: cleanRoomId },
      });

      if (!room) {
        return NextResponse.json({
          success: false,
          roomDeleted: true,
          roomId: cleanRoomId,
        });
      }
    }

    const now = new Date();
    const staleThreshold = new Date(Date.now() - 12000); // 12s cutoff (3 heartbeat cycles)
    const userId = session?.userId || null;
    const username = session?.username || catCustomization?.name || null;

    const catDataToStore = {
      ...(catCustomization || {}),
      x: typeof pos?.x === 'number' ? pos.x : undefined,
      y: typeof pos?.y === 'number' ? pos.y : undefined,
      direction: pos?.direction || undefined,
    };

    // 2. Remove any other peer sessions for the same logged-in account
    if (userId) {
      await prisma.activePeer.deleteMany({
        where: {
          userId,
          id: { not: peerId },
        },
      }).catch(() => {});
    }

    await prisma.activePeer.updateMany({
      where: { id: peerId },
      data: {
        roomId: cleanRoomId,
        lastSeen: now,
        catJson: JSON.stringify(catDataToStore),
      },
    });

    // 3. Query active peers in the room (excluding myself and other tabs of my account)
    const activePeers = await prisma.activePeer.findMany({
      where: {
        roomId: cleanRoomId,
        id: { not: peerId },
        ...(userId ? { userId: { not: userId } } : {}),
        lastSeen: { gte: staleThreshold },
      },
      orderBy: { lastSeen: 'desc' },
    });

    // 4. Return all distinct active peers in the room
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
    return NextResponse.json({ success: false, error: 'Heartbeat error' }, { status: 200 });
  }
}
