'use client';

import React, { useState, useEffect } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { Sparkles, MessageCircle, Heart, Hand } from 'lucide-react';

export const MobileActionButton: React.FC = () => {
  const activeNearbyProp = useCatStore((state) => state.activeNearbyProp);
  const selectedNearbyCat = useCatStore((state) => state.selectedNearbyCat);
  const interactWithProp = useCatStore((state) => state.interactWithProp);
  const sniffCat = useCatStore((state) => state.sniffCat);
  const sendEmote = useCatStore((state) => state.sendEmote);
  const isMobileDrawerOpen = useCatStore((state) => state.isMobileDrawerOpen);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  const handleAction = () => {
    soundManager.playPop();
    if (activeNearbyProp) {
      interactWithProp(activeNearbyProp);
    } else if (selectedNearbyCat) {
      sniffCat(selectedNearbyCat.id);
    } else {
      // Default: send cute heart emote
      sendEmote('💖');
    }
  };

  // Determine icon & label
  let icon = '🐾';
  let label = 'ทักทาย';
  let badgeText = '[E]';

  if (activeNearbyProp) {
    icon = activeNearbyProp.icon || '✨';
    label = activeNearbyProp.name.split(' ')[0] || 'โต้ตอบ';
    badgeText = 'โต้ตอบ';
  } else if (selectedNearbyCat) {
    icon = '👃';
    label = `ดม ${selectedNearbyCat.customization.name}`;
    badgeText = 'ทักทาย';
  }

  return (
    <div
      className={`fixed right-4 bottom-6 z-40 select-none pointer-events-auto transition-all duration-300 ${
        isMobileDrawerOpen
          ? 'opacity-0 pointer-events-none scale-90'
          : isTouchDevice
          ? 'opacity-100'
          : 'opacity-90 lg:hidden'
      }`}
    >
      <button
        onClick={handleAction}
        className={`btn-jelly relative w-20 h-20 rounded-full border-4 border-[#523e32] shadow-xl flex flex-col items-center justify-center transition-all ${
          activeNearbyProp || selectedNearbyCat
            ? 'bg-gradient-to-br from-[#ffd166] to-[#ffb703] scale-110 animate-bounce'
            : 'bg-gradient-to-br from-[#bde0fe] to-[#a2d2ff]'
        }`}
        title="แตะเพื่อโต้ตอบ / ทักทาย"
      >
        <span className="text-2xl filter drop-shadow-sm">{icon}</span>
        <span className="text-[10px] font-fredoka font-bold text-[#523e32] mt-0.5 max-w-[60px] truncate leading-tight">
          {label}
        </span>

        {/* Small Action Badge */}
        <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-[#ffCAD4] border-2 border-[#523e32] text-[9px] font-fredoka font-bold text-[#523e32] shadow-sm">
          {badgeText}
        </span>
      </button>
    </div>
  );
};
