'use client';

import React, { useState } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import confetti from 'canvas-confetti';
import { Utensils, Droplets, Sparkles, Heart, Zap } from 'lucide-react';

export const QuickCareDock: React.FC = () => {
  const feedCat = useCatStore((state) => state.feedCat);
  const waterCat = useCatStore((state) => state.waterCat);
  const groomCat = useCatStore((state) => state.groomCat);
  const petCat = useCatStore((state) => state.petCat);
  const triggerZoomies = useCatStore((state) => state.triggerZoomies);
  const [showFoodSubmenu, setShowFoodSubmenu] = useState(false);

  return (
    <div className="relative flex items-center justify-center pointer-events-auto">
      
      {/* Food Selection Submenu */}
      {showFoodSubmenu && (
        <div className="absolute bottom-20 bg-white/95 backdrop-blur-md p-3 rounded-3xl border-3 border-[#523e32] shadow-2xl flex gap-2 animate-in fade-in slide-in-from-bottom-2 z-40">
          <button
            onClick={() => {
              soundManager.playEat();
              feedCat('wet');
              setShowFoodSubmenu(false);
            }}
            className="btn-jelly flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-[#ffe4e9] border-2 border-[#523e32] min-w-[80px]"
          >
            <span className="text-2xl">🐟</span>
            <span className="font-fredoka font-bold text-xs text-[#523e32]">อาหารเปียก</span>
            <span className="font-itim text-[10px] text-[#8d7568]">+35% อิ่ม +น้ำ</span>
          </button>

          <button
            onClick={() => {
              soundManager.playEat();
              feedCat('dry');
              setShowFoodSubmenu(false);
            }}
            className="btn-jelly flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-[#fff6d6] border-2 border-[#523e32] min-w-[80px]"
          >
            <span className="text-2xl">🥣</span>
            <span className="font-fredoka font-bold text-xs text-[#523e32]">อาหารเม็ด</span>
            <span className="font-itim text-[10px] text-[#8d7568]">+25% อิ่ม</span>
          </button>

          <button
            onClick={() => {
              soundManager.playEat();
              soundManager.playSparkle();
              feedCat('treat');
              setShowFoodSubmenu(false);
            }}
            className="btn-jelly flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-[#e8f4fc] border-2 border-[#523e32] min-w-[80px]"
          >
            <span className="text-2xl">🍣</span>
            <span className="font-fredoka font-bold text-xs text-[#523e32]">ขนมแมวเลีย</span>
            <span className="font-itim text-[10px] text-[#8d7568]">+20% สุข</span>
          </button>
        </div>
      )}

      {/* Main Dock Buttons */}
      <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border-3 border-[#ebd9c8] shadow-2xl flex items-center gap-2 sm:gap-3">
        
        {/* 1. Feed Button */}
        <button
          onClick={() => {
            soundManager.playPop();
            setShowFoodSubmenu(!showFoodSubmenu);
          }}
          className="btn-jelly flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#ffcad4] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
        >
          <span className="text-lg">🐟</span>
          <span className="hidden sm:inline">ให้อาหาร</span>
        </button>

        {/* 2. Water Button */}
        <button
          onClick={() => {
            soundManager.playWater();
            waterCat();
          }}
          className="btn-jelly flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#bde0fe] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
        >
          <span className="text-lg">💧</span>
          <span className="hidden sm:inline">ให้น้ำ</span>
        </button>

        {/* 3. Groom / Brush Button */}
        <button
          onClick={() => {
            soundManager.playPurr();
            groomCat();
          }}
          className="btn-jelly flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#caeedf] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
        >
          <span className="text-lg">🪮</span>
          <span className="hidden sm:inline">แปรงขน</span>
        </button>

        {/* 4. Pet / Cuddle Button */}
        <button
          onClick={() => {
            soundManager.playPurr();
            confetti({
              particleCount: 25,
              spread: 40,
              origin: { y: 0.8 },
              colors: ['#ffcad4', '#ff758f'],
            });
            petCat();
          }}
          className="btn-jelly flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#ffe494] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
        >
          <span className="text-lg">💖</span>
          <span className="hidden sm:inline">ลูบหัว</span>
        </button>

        {/* 5. Laser Zoomies Button */}
        <button
          onClick={() => {
            soundManager.playMeow(1.4);
            soundManager.playSparkle();
            triggerZoomies();
          }}
          className="btn-jelly flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#ff758f] border-2 border-[#523e32] text-xs font-fredoka font-bold text-white shadow-md animate-pulse"
        >
          <span className="text-lg">⚡</span>
          <span className="hidden sm:inline">Zoomies!</span>
        </button>
      </div>
    </div>
  );
};
