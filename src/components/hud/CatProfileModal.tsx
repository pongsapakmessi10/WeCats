'use client';

import React, { useState } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import confetti from 'canvas-confetti';
import {
  X,
  Award,
  Sparkles,
  Heart,
  Shield,
  CheckCircle,
  Plus,
  ArrowRightLeft,
  Check,
  Zap,
} from 'lucide-react';

export const CatProfileModal: React.FC = () => {
  const isProfileOpen = useCatStore((state) => state.isProfileOpen);
  const setProfileOpen = useCatStore((state) => state.setProfileOpen);
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);
  const achievements = useCatStore((state) => state.achievements);
  const claimAchievement = useCatStore((state) => state.claimAchievement);
  const catSlots = useCatStore((state) => state.catSlots);
  const currentSlotIndex = useCatStore((state) => state.currentSlotIndex);
  const switchCatSlot = useCatStore((state) => state.switchCatSlot);
  const setCustomizerOpen = useCatStore((state) => state.setCustomizerOpen);

  const [activeTab, setActiveTab] = useState<'passport' | 'achievements' | 'slots'>('passport');

  if (!isProfileOpen) return null;

  const handleClaim = (achId: string) => {
    soundManager.playSparkle();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffe5a3', '#ffcad4', '#bde0fe'],
    });
    claimAchievement(achId);
  };

  const handleAdoptSecondCat = () => {
    soundManager.playPop();
    setProfileOpen(false);
    // Switch to slot 1 and open customizer to design
    useCatStore.getState().createCatSlot(1, {
      ...myCat,
      name: 'Latte (ลาเต้)',
      breed: 'siamese',
      baseColor: '#f5ebe0',
      patternType: 'siamese',
      patternColor: '#4a3728',
    });
    setCustomizerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[88vh] bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#ffe5a3] via-[#ffcad4] to-[#ffe5a3] border-b-3 border-[#ebd9c8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-md border-2 border-[#523e32]">
              🪪
            </div>
            <div>
              <h3 className="font-fredoka font-bold text-lg sm:text-xl text-[#523e32]">
                พาสปอร์ตพลเมืองแมว & ความสำเร็จ
              </h3>
              <p className="font-itim text-xs text-[#8d7568]">WeCats Official Feline Citizen Passport</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              setProfileOpen(false);
            }}
            className="p-1.5 rounded-full hover:bg-white/60 text-[#523e32]"
          >
            <X size={22} />
          </button>
        </div>

        {/* TABS */}
        <div className="px-6 py-2.5 bg-[#f5ebd9] border-b-2 border-[#ebd9c8] flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('passport');
            }}
            className={`btn-jelly px-4 py-1.5 rounded-full text-xs font-fredoka font-bold border-2 transition-all ${
              activeTab === 'passport'
                ? 'bg-[#523e32] text-white border-[#523e32] shadow-sm'
                : 'bg-white text-[#523e32] border-[#ebd9c8]'
            }`}
          >
            🪪 ข้อมูลพาสปอร์ต
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('achievements');
            }}
            className={`btn-jelly px-4 py-1.5 rounded-full text-xs font-fredoka font-bold border-2 transition-all ${
              activeTab === 'achievements'
                ? 'bg-[#523e32] text-white border-[#523e32] shadow-sm'
                : 'bg-white text-[#523e32] border-[#ebd9c8]'
            }`}
          >
            🏅 ตราความสำเร็จ ({achievements.filter((a) => a.isClaimed).length}/{achievements.length})
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('slots');
            }}
            className={`btn-jelly px-4 py-1.5 rounded-full text-xs font-fredoka font-bold border-2 transition-all ${
              activeTab === 'slots'
                ? 'bg-[#523e32] text-white border-[#523e32] shadow-sm'
                : 'bg-white text-[#523e32] border-[#ebd9c8]'
            }`}
          >
            🐾 ช่องเลี้ยงแมว ({catSlots.length}/3)
          </button>
        </div>

        {/* TAB 1: PASSPORT CARD */}
        {activeTab === 'passport' && (
          <div className="p-6 overflow-y-auto max-h-[58vh] space-y-4">
            <div className="bg-white p-5 rounded-3xl border-3 border-[#ebd9c8] shadow-sm space-y-4">
              
              {/* Top Cat ID Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ffcad4] to-[#ffe5a3] border-2 border-[#523e32] flex items-center justify-center text-3xl shadow-md">
                  🐱
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-fredoka font-bold text-lg text-[#523e32]">{myCat.name}</h4>
                    <span className="badge-pill bg-[#ffe5a3] text-xs font-fredoka py-0.5">
                      Lv.{stats.affectionLevel} สายสัมพันธ์
                    </span>
                  </div>
                  <p className="font-itim text-xs text-[#8d7568]">
                    นิสัย: <b className="text-[#523e32]">{myCat.personality}</b> • เพศ: <b>{myCat.gender === 'boy' ? 'ผู้ ♂' : 'เมีย ♀'}</b>
                  </p>
                </div>
              </div>

              {/* Genetic & Physical Info Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#f0e6df] font-itim text-xs text-[#523e32]">
                <div className="bg-[#fbf7f0] p-2.5 rounded-xl border border-[#ebd9c8]">
                  <span className="text-[#8d7568] block">สายพันธุ์ & สรีระ:</span>
                  <b className="capitalize">{myCat.breed} ({myCat.bodyType})</b>
                </div>
                <div className="bg-[#fbf7f0] p-2.5 rounded-xl border border-[#ebd9c8]">
                  <span className="text-[#8d7568] block">น้ำหนักตัว (Chonky):</span>
                  <b>{stats.weightKg} kg</b>
                </div>
                <div className="bg-[#fbf7f0] p-2.5 rounded-xl border border-[#ebd9c8]">
                  <span className="text-[#8d7568] block">ทรงหู & หาง:</span>
                  <b>หู{myCat.earType} • หาง{myCat.tailType}</b>
                </div>
                <div className="bg-[#fbf7f0] p-2.5 rounded-xl border border-[#ebd9c8]">
                  <span className="text-[#8d7568] block">ดวงตาสองสี (Heterochromia):</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: myCat.eyeColorLeft }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: myCat.eyeColorRight }} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ACHIEVEMENTS & STAMPS */}
        {activeTab === 'achievements' && (
          <div className="p-6 overflow-y-auto max-h-[58vh] space-y-3">
            {achievements.map((ach) => {
              const isCompleted = ach.progress >= ach.target;

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border-3 flex items-center justify-between gap-3 transition-all ${
                    ach.isClaimed
                      ? 'bg-[#f0f4f1] border-[#b7e4c7] opacity-80'
                      : isCompleted
                      ? 'bg-amber-50 border-amber-300 shadow-md animate-pulse'
                      : 'bg-white border-[#ebd9c8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#fffbf0] border border-[#ebd9c8] flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {ach.icon}
                    </div>
                    <div>
                      <h4 className="font-fredoka font-bold text-sm text-[#523e32]">
                        {ach.title}
                      </h4>
                      <p className="font-itim text-xs text-[#8d7568]">
                        {ach.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-pill bg-amber-100 text-amber-900 text-[10px]">
                          รางวัล: 🐟 {ach.rewardCoins} เหรียญ
                        </span>
                        <span className="font-itim text-[11px] text-[#8d7568]">
                          ความคืบหน้า: {Math.min(ach.progress, ach.target)}/{ach.target}
                        </span>
                      </div>
                    </div>
                  </div>

                  {ach.isClaimed ? (
                    <div className="badge-pill bg-[#caeedf] text-[#2b7a5a] text-xs font-fredoka font-bold py-1 px-3">
                      ✓ รับแล้ว
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(ach.id)}
                      className="btn-jelly px-4 py-2 rounded-2xl bg-[#ffe5a3] hover:bg-[#ffd166] text-[#523e32] border-2 border-[#523e32] text-xs font-fredoka font-bold shadow-md"
                    >
                      🎁 รับรางวัล!
                    </button>
                  ) : (
                    <div className="text-xs font-itim text-[#8d7568]">
                      ยังไม่สำเร็จ
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: MULTI-CAT ADOPTION SLOTS */}
        {activeTab === 'slots' && (
          <div className="p-6 overflow-y-auto max-h-[58vh] space-y-4">
            <p className="font-itim text-xs text-[#8d7568]">
              คุณสามารถรับเลี้ยงน้องแมวได้สูงสุด 3 ตัวใน 1 บัญชี และเลือกสลับตัวพาออกมาเดินเล่นใน Plaza ได้อิสระ 🐾
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2].map((slotIdx) => {
                const catInSlot = catSlots[slotIdx];
                const isActive = currentSlotIndex === slotIdx;

                if (catInSlot) {
                  return (
                    <div
                      key={slotIdx}
                      className={`p-4 rounded-3xl border-3 flex flex-col justify-between gap-3 ${
                        isActive
                          ? 'bg-gradient-to-tr from-[#ffe5a3]/40 to-[#ffcad4]/40 border-[#523e32] shadow-md'
                          : 'bg-white border-[#ebd9c8]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#523e32] flex items-center justify-center text-2xl shadow-sm">
                          🐱
                        </div>
                        <div>
                          <h4 className="font-fredoka font-bold text-sm text-[#523e32]">
                            {catInSlot.customization.name}
                          </h4>
                          <p className="font-itim text-xs text-[#8d7568]">
                            สายพันธุ์ {catInSlot.customization.breed} • {catInSlot.stats.weightKg} kg
                          </p>
                        </div>
                      </div>

                      {isActive ? (
                        <div className="w-full py-1.5 rounded-xl bg-[#caeedf] text-[#2b7a5a] font-fredoka font-bold text-xs flex items-center justify-center gap-1">
                          <Check size={14} />
                          <span>กำลังพาเดินเล่นอยู่</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            soundManager.playPop();
                            switchCatSlot(slotIdx);
                          }}
                          className="btn-jelly w-full py-1.5 rounded-xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] font-fredoka font-bold text-xs border-2 border-[#523e32] flex items-center justify-center gap-1.5"
                        >
                          <ArrowRightLeft size={13} />
                          <span>สลับมาเป็นตัวนี้</span>
                        </button>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={slotIdx}
                      className="p-5 rounded-3xl border-3 border-dashed border-[#ebd9c8] bg-[#fffbf0]/60 flex flex-col items-center justify-center text-center gap-2 hover:border-[#ffcad4] transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#8d7568] border border-[#ebd9c8]">
                        <Plus size={20} />
                      </div>
                      <div>
                        <h5 className="font-fredoka font-bold text-xs text-[#523e32]">
                          ช่องรับเลี้ยงที่ #{slotIdx + 1} (ว่าง)
                        </h5>
                        <p className="font-itim text-[11px] text-[#8d7568]">
                          พร้อมรับเลี้ยงน้องแมวเพิ่ม
                        </p>
                      </div>
                      <button
                        onClick={handleAdoptSecondCat}
                        className="btn-jelly px-4 py-1.5 rounded-xl bg-[#caeedf] hover:bg-[#b7e4c7] text-[#2b7a5a] font-fredoka font-bold text-xs border border-[#2b7a5a]/20 flex items-center gap-1 shadow-sm"
                      >
                        <Plus size={13} />
                        <span>รับเลี้ยงตัวใหม่ 🌸</span>
                      </button>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-6 py-3 bg-[#fbf7f0] border-t-2 border-[#ebd9c8] flex justify-end">
          <button
            onClick={() => {
              soundManager.playPop();
              setProfileOpen(false);
            }}
            className="btn-jelly px-6 py-2 rounded-2xl bg-[#ffcad4] text-[#523e32] font-fredoka font-bold text-xs border-2 border-[#523e32]"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
