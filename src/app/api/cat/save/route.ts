import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customization,
      stats,
      fishCoins,
      unlockedItems,
      photos,
      friends,
      diary,
      achievements,
      slotIndex = 0,
    } = body;

    // Update User Fish Coins
    if (typeof fishCoins === 'number') {
      await prisma.user.update({
        where: { id: session.userId },
        data: { fishCoins },
      }).catch(() => {});
    }

    // Find existing profile for this slotIndex
    const existingProfile = await prisma.catProfile.findFirst({
      where: {
        userId: session.userId,
        slotIndex,
      },
    });

    let savedProfile;
    if (existingProfile) {
      savedProfile = await prisma.catProfile.update({
        where: { id: existingProfile.id },
        data: {
          ...(customization
            ? {
                name: customization.name,
                gender: customization.gender,
                breed: customization.breed,
                bodyType: customization.bodyType,
                earType: customization.earType,
                tailType: customization.tailType,
                eyeType: customization.eyeType,
                eyeColorLeft: customization.eyeColorLeft,
                eyeColorRight: customization.eyeColorRight,
                baseColor: customization.baseColor,
                patternType: customization.patternType,
                patternColor: customization.patternColor,
                snoutColor: customization.snoutColor,
                pawColor: customization.pawColor,
                bellyColor: customization.bellyColor,
                accessoryHead: customization.accessoryHead,
                accessoryNeck: customization.accessoryNeck,
                accessoryBack: customization.accessoryBack,
                accessoryFace: customization.accessoryFace,
                aura: customization.aura,
                personality: customization.personality,
              }
            : {}),
          ...(stats ? { statsJson: JSON.stringify(stats) } : {}),
          ...(unlockedItems ? { unlockedItemsJson: JSON.stringify(unlockedItems) } : {}),
          ...(photos ? { photosJson: JSON.stringify(photos) } : {}),
          ...(friends ? { friendsJson: JSON.stringify(friends) } : {}),
          ...(diary ? { diaryJson: JSON.stringify(diary) } : {}),
          ...(achievements ? { achievementsJson: JSON.stringify(achievements) } : {}),
        },
      });
    } else {
      savedProfile = await prisma.catProfile.create({
        data: {
          userId: session.userId,
          slotIndex,
          name: customization?.name || 'Mochi',
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
          statsJson: JSON.stringify(stats || {}),
          unlockedItemsJson: JSON.stringify(unlockedItems || []),
          photosJson: JSON.stringify(photos || []),
          friendsJson: JSON.stringify(friends || []),
          diaryJson: JSON.stringify(diary || []),
          achievementsJson: JSON.stringify(achievements || []),
        },
      });
    }

    return NextResponse.json({ success: true, catProfile: savedProfile });
  } catch (error) {
    console.error('Cat save error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลน้องแมว' }, { status: 500 });
  }
}
