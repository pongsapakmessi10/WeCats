import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customization } = body;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const guestUsername = `Guest_Neko_${randomSuffix}`;

    const user = await prisma.user.create({
      data: {
        username: guestUsername,
        isGuest: true,
        fishCoins: 150,
        catProfiles: {
          create: {
            slotIndex: 0,
            name: customization?.name || `Mochi #${randomSuffix}`,
            gender: customization?.gender || 'boy',
            breed: customization?.breed || 'orange_tabby',
            bodyType: customization?.bodyType || 'chonky',
            earType: customization?.earType || 'pointed',
            tailType: customization?.tailType || 'fluffy',
            eyeType: customization?.eyeType || 'sparkle',
            eyeColorLeft: customization?.eyeColorLeft || '#2ec4b6',
            eyeColorRight: customization?.eyeColorRight || '#ffbf69',
            baseColor: customization?.baseColor || '#ffa94d',
            patternType: customization?.patternType || 'tabby',
            patternColor: customization?.patternColor || '#d97706',
            snoutColor: customization?.snoutColor || '#ffffff',
            pawColor: customization?.pawColor || '#ffffff',
            bellyColor: customization?.bellyColor || '#fff3bf',
            accessoryHead: customization?.accessoryHead || 'straw_hat',
            accessoryNeck: customization?.accessoryNeck || 'gold_bell',
            accessoryBack: customization?.accessoryBack || 'backpack',
            accessoryFace: customization?.accessoryFace || 'cute_blush',
            aura: customization?.aura || 'sparkles',
            personality: customization?.personality || 'chaotic',
            statsJson: JSON.stringify({
              hunger: 80,
              hydration: 80,
              energy: 90,
              happiness: 90,
              hygiene: 80,
              weightKg: 5.4,
              zoomiesEnergy: 50,
              affectionLevel: 1,
              affectionExp: 0,
            }),
            unlockedItemsJson: JSON.stringify(['straw_hat', 'gold_bell', 'backpack', 'cute_blush', 'sparkles']),
          },
        },
      },
      include: {
        catProfiles: true,
      },
    });

    await setSessionCookie({
      userId: user.id,
      username: user.username,
      isGuest: true,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isGuest: true,
        fishCoins: user.fishCoins,
      },
      catProfile: user.catProfiles[0],
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบแบบ Guest' }, { status: 500 });
  }
}
