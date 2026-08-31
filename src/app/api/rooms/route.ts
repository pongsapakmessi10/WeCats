import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const dbRooms = await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Default Public Channels
    const defaultChannels = [
      {
        id: 'public-sakura',
        name: 'Plaza #1: สวนซากุระ 🌸',
        type: 'public',
        theme: 'sakura',
        maxCapacity: 20,
        currentCount: 14,
      },
      {
        id: 'public-sunshine',
        name: 'Plaza #2: ลานแดดอุ่น ☀️',
        type: 'public',
        theme: 'sunshine',
        maxCapacity: 20,
        currentCount: 8,
      },
      {
        id: 'public-moonlight',
        name: 'Plaza #3: แสงจันทร์ Lofi 🌙',
        type: 'public',
        theme: 'moonlight',
        maxCapacity: 20,
        currentCount: 5,
      },
    ];

    return NextResponse.json({
      publicChannels: defaultChannels,
      privateRooms: dbRooms.filter((r) => r.type === 'private').map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        theme: r.theme,
        maxCapacity: r.maxCapacity,
        currentCount: 1,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Fetch rooms error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการโหลดรายชื่อห้อง' }, { status: 500 });
  }
}
