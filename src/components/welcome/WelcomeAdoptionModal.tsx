'use client';

import React, { useState, useEffect } from 'react';
import { soundManager } from '@/audio/soundManager';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Palette, Zap, LogIn, X } from 'lucide-react';
import { useCatStore } from '@/store/catStore';

interface WelcomeAdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomizer: () => void;
  onOpenAuth: () => void;
}

export const WelcomeAdoptionModal: React.FC<WelcomeAdoptionModalProps> = ({
  isOpen,
  onClose,
  onOpenCustomizer,
  onOpenAuth,
}) => {
  const [boxWobble, setBoxWobble] = useState(false);
  const [meowCount, setMeowCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      soundManager.playMeow(1.2);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBoxClick = () => {
    soundManager.playRealisticRandomMeow();
    setBoxWobble(true);
    setMeowCount((prev) => prev + 1);
    setTimeout(() => setBoxWobble(false), 600);
  };

  const handleCreateMyCat = () => {
    soundManager.playSparkle();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffcad4', '#bde0fe', '#ffe5a3', '#caeedf'],
    });
    localStorage.setItem('wecats_has_visited', 'true');
    onClose();
    onOpenCustomizer();
  };

  const handleQuickPlay = async () => {
    soundManager.playSparkle();
    localStorage.setItem('wecats_has_visited', 'true');
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.user) {
        useCatStore.getState().setNotification(`ยินดีต้อนรับ ${data.user.username} สู่ WeCats Plaza! 🌸`);
      }
    } catch {}
    onClose();
  };

  const handleLoginExisting = () => {
    soundManager.playPop();
    localStorage.setItem('wecats_has_visited', 'true');
    onClose();
    onOpenAuth();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center gap-4">
        
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playPop();
            localStorage.setItem('wecats_has_visited', 'true');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#ebd9c8] text-[#523e32] transition-colors"
          title="ปิดหน้าต่าง"
        >
          <X size={20} />
        </button>

        {/* Title Header */}
        <div className="space-y-1 mt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffcad4] border border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]">
            <Sparkles size={13} /> ศูนย์รับเลี้ยงน้องแมว WeCats 🌸
          </div>
          <h2 className="font-fredoka font-bold text-xl sm:text-2xl text-[#523e32] tracking-tight">
            ยินดีต้อนรับสู่โลกแมว!
          </h2>
          <p className="font-itim text-xs sm:text-sm text-[#8d7568]">
            มารับเลี้ยงและออกแบบน้องแมวตัวแรกของคุณกันเถอะ
          </p>
        </div>

        {/* Interactive Animated Adoption Box */}
        <div
          onClick={handleBoxClick}
          className={`relative my-2 p-5 rounded-3xl bg-gradient-to-b from-[#fff6d6] to-[#ffe4e9] border-3 border-[#523e32] shadow-lg cursor-pointer transition-transform select-none ${
            boxWobble ? 'animate-bounce scale-105' : 'hover:scale-105'
          }`}
          title="กล่องรับเลี้ยงน้องแมว WeCats"
        >
          <div className="text-6xl sm:text-7xl drop-shadow-md">
            📦
          </div>
          <span className="absolute -top-2 -right-2 text-2xl animate-pulse">
            🐾
          </span>
          <div className="mt-2 font-itim text-xs font-bold text-[#523e32] bg-white/90 px-3 py-1 rounded-full border border-[#ebd9c8]">
            ✨ กล่องรับเลี้ยงน้องแมวพิเศษ 💖
          </div>
        </div>

        {/* 3 Main Action Choices */}
        <div className="w-full space-y-2.5 pt-1">
          
          {/* 1. Create My Cat (Primary Button) */}
          <button
            onClick={handleCreateMyCat}
            className="btn-jelly w-full py-3.5 px-4 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] font-fredoka font-bold text-sm sm:text-base border-3 border-[#523e32] flex items-center justify-center gap-2 shadow-lg"
          >
            <Palette size={18} />
            <span>🎀 ออกแบบและแต่งตัวแมวของฉัน</span>
          </button>

          {/* 2. Quick Play as Guest */}
          <button
            onClick={handleQuickPlay}
            className="btn-jelly w-full py-3 px-4 rounded-2xl bg-[#ffe5a3] hover:bg-[#ffd166] text-[#523e32] font-fredoka font-bold text-xs sm:text-sm border-2 border-[#523e32] flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            <span>⚡ เริ่มเล่นทันทีด้วยแมวสุ่ม (Quick Play / Guest)</span>
          </button>

          {/* 3. Existing User Login */}
          <button
            onClick={handleLoginExisting}
            className="btn-jelly w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#f5ebe0] text-[#523e32] font-fredoka font-bold text-xs border-2 border-[#523e32] flex items-center justify-center gap-2"
          >
            <LogIn size={15} />
            <span>🔑 ฉันมีบัญชีอยู่แล้ว (เข้าสู่ระบบ)</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="font-itim text-[11px] text-[#8d7568]">
          แมวของคุณจะสามารถปรับเปลี่ยนชุดและสีขนใหม่ได้ตลอดเวลาในเกม 💖
        </p>

      </div>
    </div>
  );
};
