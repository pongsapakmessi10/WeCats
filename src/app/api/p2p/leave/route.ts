import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    let peerId: string | undefined;

    try {
      const text = await request.text();
      if (text) {
        const parsed = JSON.parse(text);
        peerId = parsed?.peerId;
      }
    } catch {}

    if (peerId) {
      await prisma.activePeer.deleteMany({
        where: { id: peerId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
