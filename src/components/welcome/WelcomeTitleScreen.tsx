'use client';

import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '@/audio/soundManager';
import confetti from 'canvas-confetti';
import { Sparkles, Palette, Zap, LogIn, Radio, Heart, Award, Shield } from 'lucide-react';
import { useCatStore } from '@/store/catStore';

interface WelcomeTitleScreenProps {
  onEnterCustomizer: () => void;
  onQuickPlay: () => void;
  onOpenAuth: () => void;
  onOpenChannels: () => void;
}

export const WelcomeTitleScreen: React.FC<WelcomeTitleScreenProps> = ({
  onEnterCustomizer,
  onQuickPlay,
  onOpenAuth,
  onOpenChannels,
}) => {
  const [boxWobble, setBoxWobble] = useState(false);
  const [meowCount, setMeowCount] = useState(0);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background floating clouds and petals animation
  useEffect(() => {
    let animId: number;
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const petals: Array<{ x: number; y: number; vx: number; vy: number; rot: number; size: number }> = [];
    for (let i = 0; i < 40; i++) {
      petals.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 0.4 + Math.random() * 0.8,
        vy: 0.6 + Math.random() * 0.9,
        rot: Math.random() * Math.PI * 2,
        size: 5 + Math.random() * 5,
      });
    }

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render drifting cherry blossom petals
      petals.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += 0.02;
        if (p.y > canvas.height + 20) p.y = -10;
        if (p.x > canvas.width + 20) p.x = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleBoxClick = () => {
    soundManager.playRealisticRandomMeow();
    setBoxWobble(true);
    setMeowCount((prev) => prev + 1);
    setTimeout(() => setBoxWobble(false), 600);
  };

  const handleCreate = () => {
    soundManager.playSparkle();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffcad4', '#bde0fe', '#ffe5a3', '#caeedf'],
    });
    onEnterCustomizer();
  };

  return (
    <div className="fixed inset-0 z-40 w-screen h-screen overflow-hidden flex flex-col justify-between items-center p-6 sm:p-10 select-none bg-gradient-to-b from-[#e8f5e9] via-[#fbf7f0] to-[#ffe4e9]">
      
      {/* Background Canvas for Animated Petals */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* TOP BAR: Room Indicator & Version */}
      <div className="w-full max-w-6xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border-2 border-[#ebd9c8] shadow-md">
          <span className="text-sm">🌸</span>
          <span className="font-fredoka font-bold text-xs text-[#523e32]">Public Server: Sakura Plaza</span>
          <span className="badge-pill bg-emerald-100 text-emerald-800 text-[10px] py-0.5">Online ●</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenChannels();
            }}
            className="btn-jelly flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border-2 border-[#ebd9c8] text-xs font-fredoka font-bold text-[#523e32]"
          >
            <Radio size={13} />
            <span>เลือกเซิร์ฟเวอร์ / Private Room</span>
          </button>
        </div>
      </div>

      {/* CENTER HERO: GRAND LOGO & INTERACTIVE CAT ADOPTION BOX */}
      <div className="flex flex-col items-center text-center gap-5 z-10 max-w-xl my-auto">
        
        {/* Grand Title Logo */}
        <div className="space-y-2 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffcad4] border-2 border-[#523e32] shadow-sm text-xs sm:text-sm font-fredoka font-bold text-[#523e32] animate-bounce">
            <Sparkles size={15} /> 2D Cozy Feline Simulation & Online Plaza ✨
          </div>
          <h1 className="font-fredoka font-extrabold text-5xl sm:text-7xl text-[#523e32] tracking-tight drop-shadow-md flex items-center gap-3 justify-center">
            <span>🐾</span>
            <span className="bg-gradient-to-r from-[#523e32] via-[#e76f51] to-[#523e32] bg-clip-text text-transparent">
              WeCats
            </span>
            <span>🐾</span>
          </h1>
          <p className="font-itim text-sm sm:text-lg text-[#8d7568] max-w-md">
            เกมเลี้ยงแมวสุดอบอุ่น ปรับแต่งแมวได้ตามใจ สถิติสมจริง และเดินเล่นกับเพื่อนๆ ในโลกออนไลน์
          </p>
        </div>

        {/* Center Interactive Adoption Box */}
        <div
          onClick={handleBoxClick}
          className={`relative p-6 sm:p-8 rounded-[36px] bg-white/95 backdrop-blur-md border-4 border-[#523e32] shadow-2xl cursor-pointer transition-all ${
            boxWobble ? 'scale-110 rotate-3' : 'hover:scale-105'
          }`}
          title="กล่องรับเลี้ยงน้องแมวพิเศษแห่ง Plaza"
        >
          <div className="text-7xl sm:text-9xl drop-shadow-lg">
            📦
          </div>
          <div className="mt-3 bg-[#fbf7f0] px-4 py-1.5 rounded-full border border-[#ebd9c8] text-xs font-itim text-[#523e32]">
            กล่องรับเลี้ยงน้องแมวพิเศษแห่ง Plaza 💖
          </div>
        </div>

        {/* 3 Prominent Main Action Buttons */}
        <div className="w-full max-w-md space-y-3 pt-2">
          
          {/* Button 1: Create & Customize Cat */}
          <button
            onClick={handleCreate}
            className="btn-jelly w-full py-4 px-6 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] font-fredoka font-bold text-base sm:text-lg border-3 border-[#523e32] flex items-center justify-center gap-3 shadow-xl transform active:scale-95 transition-all"
          >
            <Palette size={22} />
            <span>🎀 ออกแบบและแต่งตัวแมวของฉัน (เริ่มเล่น)</span>
          </button>

          {/* Button 2: Quick Play as Guest */}
          <button
            onClick={() => {
              soundManager.playSparkle();
              onQuickPlay();
            }}
            className="btn-jelly w-full py-3.5 px-5 rounded-2xl bg-[#ffe5a3] hover:bg-[#ffd166] text-[#523e32] font-fredoka font-bold text-sm sm:text-base border-2 border-[#523e32] flex items-center justify-center gap-2 shadow-md"
          >
            <Zap size={18} />
            <span>⚡ เริ่มเล่นทันทีด้วยแมวสุ่ม (Quick Play / Guest)</span>
          </button>

          {/* Button 3: Login Existing Account */}
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenAuth();
            }}
            className="btn-jelly w-full py-3 px-5 rounded-2xl bg-white hover:bg-[#f5ebe0] text-[#523e32] font-fredoka font-bold text-xs sm:text-sm border-2 border-[#523e32] flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn size={16} />
            <span>🔑 เข้าสู่ระบบด้วยบัญชีเดิม (Login)</span>
          </button>
        </div>

      </div>

      {/* FOOTER BAR: Badges & Credits */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs font-itim text-[#8d7568] z-10 pt-4 border-t border-[#ebd9c8]/60">
        <div className="flex items-center gap-3">
          <span>🌿 Stardew & Animal Crossing Inspired</span>
          <span>•</span>
          <span>🐾 2D Skeletal & Dynamic Physics</span>
        </div>
        <div>
          <span>© 2026 WeCats MMO • Made with Cozy Love 💖</span>
        </div>
      </div>

    </div>
  );
};
