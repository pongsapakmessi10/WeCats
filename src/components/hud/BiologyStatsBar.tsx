'use client';

import React from 'react';
import { useCatStore } from '@/store/catStore';
import {
  CatPawIcon,
  FoodBowlIcon,
  WaterDropIcon,
  PetHeartIcon,
  GroomBrushIcon,
  LaserZapIcon,
} from '@/components/ui/GameIcons';

interface BiologyStatsBarProps {
  isAuthLoading?: boolean;
}

export const BiologyStatsBar: React.FC<BiologyStatsBarProps> = ({ isAuthLoading = false }) => {
  const [isMobileExpanded, setIsMobileExpanded] = React.useState(false);
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);

  const getChonkyLabel = (kg: number) => {
    if (kg < 4.0) return { text: 'เพรียวลม', color: 'bg-emerald-100 text-emerald-800' };
    if (kg < 6.0) return { text: 'นุ้มนุ่ม', color: 'bg-amber-100 text-amber-800' };
    if (kg < 7.5) return { text: 'อ้วนตุ๊บ', color: 'bg-orange-100 text-orange-800' };
    return { text: 'ก้อนขนยักษ์', color: 'bg-red-100 text-red-800' };
  };

  const chonkInfo = getChonkyLabel(stats.weightKg);

  if (isAuthLoading) {
    return (
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border-2 border-[#ebd9c8] shadow-sm flex items-center justify-center pointer-events-auto animate-pulse">
        <div className="w-32 h-3 bg-[#ebd9c8]/70 rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl pointer-events-auto flex flex-col items-center">
      
      {/* 📱 MOBILE COMPACT MICRO-CAPSULE (< lg screens) */}
      <div className="flex lg:hidden flex-col items-center w-full max-w-sm">
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="btn-jelly w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-[#ebd9c8] shadow-md text-xs font-fredoka font-bold text-[#523e32]"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <CatPawIcon size={14} color="#523e32" />
            <span>{myCat.name}</span>
            <span className="text-[10px] text-[#8d7568] font-normal">Lv.{stats.affectionLevel}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#523e32] shrink-0 font-medium">
            <span>🍗 {Math.round(stats.hunger)}%</span>
            <span>💧 {Math.round(stats.hydration)}%</span>
            <span>💕 {Math.round(stats.happiness)}%</span>
            <span>⚡ {Math.round(stats.zoomiesEnergy)}%</span>
          </div>

          <span className="text-[10px] text-[#8d7568] shrink-0">
            {isMobileExpanded ? '▴' : '▾'}
          </span>
        </button>

        {/* Mobile Expanded Dropdown Details */}
        {isMobileExpanded && (
          <div className="mt-1.5 w-full bg-white/95 backdrop-blur-md p-3 rounded-2xl border-2 border-[#ebd9c8] shadow-xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-[#ebd9c8] pb-1.5">
              <span className="font-fredoka font-bold text-xs text-[#523e32]">ความผูกพัน & น้ำหนัก</span>
              <span className={`badge-pill text-[9px] font-fredoka py-0.5 ${chonkInfo.color}`}>
                {stats.weightKg} kg • {chonkInfo.text}
              </span>
            </div>

            {/* Exp Bar */}
            <div className="flex items-center gap-2">
              <span className="font-itim text-[11px] text-[#8d7568] w-20 shrink-0">Bonding Exp</span>
              <div className="flex-1 h-2 bg-[#ebd9c8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ffcad4] to-[#ff758f] transition-all duration-300"
                  style={{ width: `${(stats.affectionExp % 100)}%` }}
                />
              </div>
              <span className="font-fredoka text-[10px] text-[#523e32]">{stats.affectionExp % 100}/100</span>
            </div>

            {/* Gauges Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-2 bg-[#ffe4e9]/40 p-1.5 rounded-xl">
                <FoodBowlIcon size={16} />
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>อิ่ม</span>
                    <span>{Math.round(stats.hunger)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f0e6df] rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-[#ff9770] rounded-full" style={{ width: `${stats.hunger}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#e8f4fc]/40 p-1.5 rounded-xl">
                <WaterDropIcon size={16} />
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>น้ำ</span>
                    <span>{Math.round(stats.hydration)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f0e6df] rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-[#70d6ff] rounded-full" style={{ width: `${stats.hydration}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#fff0f3]/40 p-1.5 rounded-xl">
                <PetHeartIcon size={16} />
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>ความสุข</span>
                    <span>{Math.round(stats.happiness)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f0e6df] rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-[#ff70a6] rounded-full" style={{ width: `${stats.happiness}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#e5f8f0]/40 p-1.5 rounded-xl">
                <GroomBrushIcon size={16} />
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>ขนสวย</span>
                    <span>{Math.round(stats.hygiene)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f0e6df] rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-[#06d6a0] rounded-full" style={{ width: `${stats.hygiene}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🖥️ DESKTOP FULL BIOLOGY GAUGE BAR (>= lg screens) */}
      <div className="hidden lg:flex w-full bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-3xl border-3 border-[#ebd9c8] shadow-lg items-center justify-between gap-4 animate-in fade-in">
        
        {/* 1. Profile & Affection Level */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ffcad4] to-[#ffe5a3] border-2 border-[#523e32] flex items-center justify-center shadow-inner">
              <CatPawIcon size={24} color="#523e32" />
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
        <div className="flex items-center gap-6 flex-1 justify-end flex-wrap">
          
          {/* Hunger */}
          <div className="flex items-center gap-2" title="ความอิ่ม (Hunger)">
            <div className="w-8 h-8 rounded-xl bg-[#ffe4e9] border border-[#523e32]/20 flex items-center justify-center shadow-sm">
              <FoodBowlIcon size={18} />
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
                <span>อิ่ม</span>
                <span>{Math.round(stats.hunger)}%</span>
              </div>
              <div className="w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff9770] transition-all duration-500 rounded-full"
                  style={{ width: `${stats.hunger}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hydration */}
          <div className="flex items-center gap-2" title="น้ำดื่ม (Hydration)">
            <div className="w-8 h-8 rounded-xl bg-[#e8f4fc] border border-[#523e32]/20 flex items-center justify-center shadow-sm">
              <WaterDropIcon size={18} />
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
                <span>น้ำ</span>
                <span>{Math.round(stats.hydration)}%</span>
              </div>
              <div className="w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#70d6ff] transition-all duration-500 rounded-full"
                  style={{ width: `${stats.hydration}%` }}
                />
              </div>
            </div>
          </div>

          {/* Happiness */}
          <div className="flex items-center gap-2" title="ความสุขและเสียงกรน (Happiness)">
            <div className="w-8 h-8 rounded-xl bg-[#fff0f3] border border-[#523e32]/20 flex items-center justify-center shadow-sm">
              <PetHeartIcon size={18} />
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
                <span>ความสุข</span>
                <span>{Math.round(stats.happiness)}%</span>
              </div>
              <div className="w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff70a6] transition-all duration-500 rounded-full"
                  style={{ width: `${stats.happiness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hygiene / Grooming */}
          <div className="flex items-center gap-2" title="ความสะอาดขน ป้องกันก้อนขน (Hygiene)">
            <div className="w-8 h-8 rounded-xl bg-[#e5f8f0] border border-[#523e32]/20 flex items-center justify-center shadow-sm">
              <GroomBrushIcon size={18} />
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
                <span>ขนสวย</span>
                <span>{Math.round(stats.hygiene)}%</span>
              </div>
              <div className="w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#06d6a0] transition-all duration-500 rounded-full"
                  style={{ width: `${stats.hygiene}%` }}
                />
              </div>
            </div>
          </div>

          {/* Zoomies Energy */}
          <div className="flex items-center gap-2" title="พลังงาน Zoomies">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-sm transition-all ${
              stats.isZooming ? 'bg-amber-400 border-amber-600 animate-bounce' : 'bg-[#fff6d6] border-[#523e32]/20'
            }`}>
              <LaserZapIcon size={18} />
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[11px] font-fredoka font-bold text-[#523e32]">
                <span>Zoomies</span>
                <span>{Math.round(stats.zoomiesEnergy)}%</span>
              </div>
              <div className="w-20 h-2 bg-[#f0e6df] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ffd166] transition-all duration-300 rounded-full"
                  style={{ width: `${stats.zoomiesEnergy}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
