import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, customization } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว กรุณาเลือกชื่ออื่น' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create User & CatProfile
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        isGuest: false,
        fishCoins: 150,
        catProfiles: {
          create: {
            slotIndex: 0,
            name: customization?.name || `${username}'s Cat`,
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

    // Set JWT Cookie
    await setSessionCookie({
      userId: user.id,
      username: user.username,
      isGuest: false,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isGuest: false,
        fishCoins: user.fishCoins,
      },
      catProfile: user.catProfiles[0],
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' }, { status: 500 });
  }
}
