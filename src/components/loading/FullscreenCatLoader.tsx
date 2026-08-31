'use client';

import React, { useState, useEffect } from 'react';

const LOADING_TIPS = [
  'กำลังหวีขนนุ่มฟูและเตรียมชามแซลมอน... 🍣',
  'กำลังเชื่อมต่อกับเพื่อนแมวในสวนซากุระ Plaza... 🌸',
  'กำลังเตรียมปลาทูทองคำและผงแคทนิปอินทรีย์... 🐟',
  'ตรวจเช็คพลัง Zoomies เต็ม 100%... ⚡',
  'กำลังจัดหมวกฟางและกระดิ่งทองให้น่ารักที่สุด... ✨',
];

export const FullscreenCatLoader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);

  // Cycle tips every 2.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  // Graceful unmount after fade-out transition
  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(timeout);
    } else {
      setShouldRender(true);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fff8eb] transition-opacity duration-700 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: '#fff8eb' }}
    >
      {/* Soft Ambient Floating Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40">
        <span className="absolute top-[15%] left-[10%] text-2xl animate-pulse">🌸</span>
        <span className="absolute top-[25%] right-[15%] text-2xl animate-bounce">✨</span>
        <span className="absolute bottom-[20%] left-[18%] text-2xl animate-pulse">🐾</span>
        <span className="absolute bottom-[25%] right-[12%] text-2xl animate-bounce">🐟</span>
        <span className="absolute top-[60%] left-[8%] text-xl animate-pulse">⭐</span>
        <span className="absolute top-[45%] right-[8%] text-xl animate-pulse">💖</span>
      </div>

      <div className="relative flex flex-col items-center z-10 p-6 max-w-sm text-center">
        
        {/* SPINNING & BOUNCING CAT MASCOT */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          
          {/* Pulsing Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ffcad4] via-[#ffe5a3] to-[#bde0fe] animate-spin opacity-70 blur-md" style={{ animationDuration: '4s' }} />

          {/* Inner Circle Frame */}
          <div className="absolute inset-2 rounded-full bg-white border-3 border-[#ebd9c8] shadow-inner flex items-center justify-center overflow-hidden" />

          {/* Animated Spinning Cat Avatar */}
          <div className="relative z-10 animate-bounce" style={{ animationDuration: '1.4s' }}>
            <div className="animate-spin" style={{ animationDuration: '3s' }}>
              <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ears */}
                <polygon points="22,35 12,12 40,24" fill="#ffa94d" stroke="#523e32" strokeWidth="4" strokeLinejoin="round" />
                <polygon points="24,32 17,17 37,25" fill="#ffcad4" />
                <polygon points="78,35 88,12 60,24" fill="#ffa94d" stroke="#523e32" strokeWidth="4" strokeLinejoin="round" />
                <polygon points="76,32 83,17 63,25" fill="#ffcad4" />

                {/* Head */}
                <circle cx="50" cy="52" r="34" fill="#ffa94d" stroke="#523e32" strokeWidth="4" />

                {/* Tabby Stripes on Head */}
                <path d="M50 20 L50 32 M42 22 L45 32 M58 22 L55 32" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />

                {/* White Snout */}
                <ellipse cx="50" cy="62" rx="16" ry="12" fill="#ffffff" stroke="#523e32" strokeWidth="3" />

                {/* Eyes (Sparkling) */}
                <ellipse cx="37" cy="48" rx="5" ry="6.5" fill="#2ec4b6" stroke="#523e32" strokeWidth="2.5" />
                <circle cx="35" cy="46" r="2" fill="#ffffff" />
                <ellipse cx="63" cy="48" rx="5" ry="6.5" fill="#2ec4b6" stroke="#523e32" strokeWidth="2.5" />
                <circle cx="61" cy="46" r="2" fill="#ffffff" />

                {/* Pink Nose & Cute Mouth */}
                <polygon points="50,58 46,54 54,54" fill="#ff70a6" />
                <path d="M46 62 Q50 66 50 61 Q50 66 54 62" stroke="#523e32" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                {/* Cute Cheeks */}
                <ellipse cx="30" cy="58" rx="4" ry="2.5" fill="#ff8aa1" opacity="0.6" />
                <ellipse cx="70" cy="58" rx="4" ry="2.5" fill="#ff8aa1" opacity="0.6" />

                {/* Bell Collar */}
                <circle cx="50" cy="85" r="7" fill="#ffd166" stroke="#523e32" strokeWidth="2.5" />
                <circle cx="50" cy="86" r="1.5" fill="#523e32" />
              </svg>
            </div>
          </div>

          {/* Soft Ground Shadow */}
          <div className="absolute -bottom-2 w-20 h-3 rounded-full bg-[#523e32]/15 blur-[2px] animate-pulse" />
        </div>

        {/* TITLE & LOGO */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl animate-pulse">🐾</span>
            <h1 className="font-fredoka font-bold text-2xl sm:text-3xl text-[#523e32] tracking-tight">
              WeCats Plaza
            </h1>
            <span className="text-xl animate-pulse">🌸</span>
          </div>
          <p className="font-fredoka font-bold text-xs text-[#d97706] tracking-wide uppercase">
            Online Multiplayer Cat World
          </p>
        </div>

        {/* ROTATING CUTE LOADING TIP */}
        <div className="min-h-[44px] flex items-center justify-center">
          <p className="font-itim text-sm text-[#8d7568] animate-in fade-in duration-500 key={tipIndex}">
            {LOADING_TIPS[tipIndex]}
          </p>
        </div>

        {/* BOUNCING PROGRESS DOTS */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffcad4] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffe5a3] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-[#bde0fe] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

      </div>
    </div>
  );
};
