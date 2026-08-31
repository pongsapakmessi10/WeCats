import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { name, passcode, theme = 'sakura', maxCapacity = 10 } = body;

    if (!name || !passcode) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อห้องและรหัสผ่าน PIN' }, { status: 400 });
    }

    if (passcode.length < 3) {
      return NextResponse.json({ error: 'รหัสผ่าน PIN ต้องมีอย่างน้อย 3 ตัวอักษร' }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        name,
        type: 'private',
        passcode,
        theme,
        maxCapacity: Number(maxCapacity) || 10,
        ownerId: session?.userId || null,
        ownerName: session?.username || 'Host',
      },
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        type: room.type,
        theme: room.theme,
        maxCapacity: room.maxCapacity,
        ownerId: room.ownerId,
        ownerName: room.ownerName,
      },
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างห้องส่วนตัว' }, { status: 500 });
  }
}
