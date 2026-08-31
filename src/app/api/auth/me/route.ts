import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        catProfiles: {
          orderBy: { slotIndex: 'asc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const mainCat = user.catProfiles[0] || null;

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        isGuest: user.isGuest,
        fishCoins: user.fishCoins,
      },
      catProfile: mainCat,
      catProfiles: user.catProfiles,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}
