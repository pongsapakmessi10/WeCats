import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, passcode } = body;

    if (!roomId || !passcode) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสผ่าน PIN ห้อง' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'ไม่พบห้องที่ระบุ' }, { status: 404 });
    }

    if (room.passcode !== passcode) {
      return NextResponse.json({ error: 'รหัสผ่าน PIN ไม่ถูกต้อง' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        type: room.type,
        theme: room.theme,
        maxCapacity: room.maxCapacity,
      },
    });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าร่วมห้อง' }, { status: 500 });
  }
}
