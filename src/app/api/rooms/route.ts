import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const staleThreshold = new Date(Date.now() - 25000);

    const [dbRooms, activePeers] = await Promise.all([
      prisma.room.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }).catch(() => []),
      prisma.activePeer.findMany({
        where: {
          lastSeen: { gte: staleThreshold },
        },
      }).catch(() => []),
    ]);

    // Count peers per room
    const countMap: Record<string, number> = {};
    activePeers.forEach((p) => {
      countMap[p.roomId] = (countMap[p.roomId] || 0) + 1;
    });

    const defaultChannels = [
      {
        id: 'public-sakura',
        name: 'Plaza #1: สวนซากุระ',
        type: 'public',
        theme: 'sakura',
        maxCapacity: 20,
        currentCount: countMap['public-sakura'] || 0,
      },
      {
        id: 'public-sunshine',
        name: 'Plaza #2: ลานแดดอุ่น',
        type: 'public',
        theme: 'sunshine',
        maxCapacity: 20,
        currentCount: countMap['public-sunshine'] || 0,
      },
      {
        id: 'public-moonlight',
        name: 'Plaza #3: แสงจันทร์ Lofi',
        type: 'public',
        theme: 'moonlight',
        maxCapacity: 20,
        currentCount: countMap['public-moonlight'] || 0,
      },
    ];

    const privateRooms = dbRooms
      .filter((r) => r.type === 'private')
      .map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        theme: r.theme,
        maxCapacity: r.maxCapacity,
        ownerId: r.ownerId,
        ownerName: r.ownerName,
        currentCount: countMap[r.id] || 0,
        createdAt: r.createdAt,
      }));

    return NextResponse.json({
      publicChannels: defaultChannels,
      privateRooms,
    });
  } catch (error) {
    console.error('Fetch rooms error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดรายชื่อห้อง' }, { status: 500 });
  }
}
