'use client';

import React from 'react';
import { useCatStore } from '@/store/catStore';
import { Heart, Droplets, Utensils, Sparkles, Moon, Zap, Scale } from 'lucide-react';

export const BiologyStatsBar: React.FC = () => {
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);

  const getChonkyLabel = (kg: number) => {
    if (kg < 4.0) return { text: 'เพรียวลม (Slim)', color: 'bg-emerald-100 text-emerald-800' };
    if (kg < 6.0) return { text: 'นุ้มนุ่ม (Fluffy)', color: 'bg-amber-100 text-amber-800' };
    if (kg < 7.5) return { text: 'อ้วนตุ๊บ (Chonky)', color: 'bg-orange-100 text-orange-800' };
    return { text: 'ก้อนขนยักษ์ (Absolute Chonk!)', color: 'bg-red-100 text-red-800' };
  };

  const chonkInfo = getChonkyLabel(stats.weightKg);

  return (
    <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-3xl border-3 border-[#ebd9c8] shadow-lg flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
      
      {/* 1. Profile & Affection Level */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[#ffcad4] border-2 border-[#523e32] flex items-center justify-center text-2xl shadow-inner">
            🐱
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 bg-[#ffe5a3] border border-[#523e32] text-[#523e32] text-[10px] font-fredoka font-bold px-1.5 py-0.2 rounded-full">
            Lv.{stats.affectionLevel}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-fredoka font-bold text-sm text-[#523e32]">{myCat.name}</span>
            <span className={`badge-pill text-[10px] font-fredoka py-0.5 ${chonkInfo.color}`}>
              {stats.weightKg} kg • {chonkInfo.text}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-24 h-2 bg-[#ebd9c8] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ffcad4] to-[#ff758f] transition-all duration-300"
                style={{ width: `${(stats.affectionExp % 100)}%` }}
              />
            </div>
            <span className="font-itim text-[11px] text-[#8d7568]">Bonding Exp</span>
          </div>
        </div>
      </div>

      {/* 2. Realistic Biology Stat Gauges */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end flex-wrap">
        
        {/* Hunger */}
        <div className="flex items-center gap-2" title="ความอิ่ม (Hunger)">
          <div className="w-8 h-8 rounded-xl bg-[#ffe4e9] border border-[#523e32]/20 flex items-center justify-center text-sm shadow-sm">
            🐟
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
              <span>อิ่ม</span>
              <span>{Math.round(stats.hunger)}%</span>
            </div>
            <div className="w-16 sm:w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff9770] transition-all duration-500 rounded-full"
                style={{ width: `${stats.hunger}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hydration */}
        <div className="flex items-center gap-2" title="น้ำดื่ม (Hydration)">
          <div className="w-8 h-8 rounded-xl bg-[#e8f4fc] border border-[#523e32]/20 flex items-center justify-center text-sm shadow-sm">
            💧
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
              <span>น้ำ</span>
              <span>{Math.round(stats.hydration)}%</span>
            </div>
            <div className="w-16 sm:w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#70d6ff] transition-all duration-500 rounded-full"
                style={{ width: `${stats.hydration}%` }}
              />
            </div>
          </div>
        </div>

        {/* Happiness */}
        <div className="flex items-center gap-2" title="ความสุขและเสียงกรน (Happiness)">
          <div className="w-8 h-8 rounded-xl bg-[#fff0f3] border border-[#523e32]/20 flex items-center justify-center text-sm shadow-sm">
            💖
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
              <span>ความสุข</span>
              <span>{Math.round(stats.happiness)}%</span>
            </div>
            <div className="w-16 sm:w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff70a6] transition-all duration-500 rounded-full"
                style={{ width: `${stats.happiness}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hygiene / Grooming */}
        <div className="flex items-center gap-2" title="ความสะอาดขน ป้องกันก้อนขน (Hygiene)">
          <div className="w-8 h-8 rounded-xl bg-[#e5f8f0] border border-[#523e32]/20 flex items-center justify-center text-sm shadow-sm">
            ✨
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
              <span>ขนสวย</span>
              <span>{Math.round(stats.hygiene)}%</span>
            </div>
            <div className="w-16 sm:w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#06d6a0] transition-all duration-500 rounded-full"
                style={{ width: `${stats.hygiene}%` }}
              />
            </div>
          </div>
        </div>

        {/* Zoomies Energy */}
        <div className="flex items-center gap-2" title="พลังงาน Zoomies">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm shadow-sm transition-all ${
            stats.isZooming ? 'bg-amber-400 border-amber-600 animate-bounce' : 'bg-[#fff6d6] border-[#523e32]/20'
          }`}>
            ⚡
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
              <span>Zoomies</span>
              <span>{Math.round(stats.zoomiesEnergy)}%</span>
            </div>
            <div className="w-16 sm:w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffd166] transition-all duration-300 rounded-full"
                style={{ width: `${stats.zoomiesEnergy}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
