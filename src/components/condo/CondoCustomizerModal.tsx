'use client';

import React, { useState } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { CondoCustomization } from '@/types/game';
import { X, Sparkles, Check, Home, Palette, Sun, Moon, TreePine } from 'lucide-react';

export const CondoCustomizerModal: React.FC = () => {
  const isCondoCustomizerOpen = useCatStore((state) => state.isCondoCustomizerOpen);
  const setIsCondoCustomizerOpen = useCatStore((state) => state.setIsCondoCustomizerOpen);
  const myCondo = useCatStore((state) => state.myCondo);
  const updateCondoCustomization = useCatStore((state) => state.updateCondoCustomization);
  const fishCoins = useCatStore((state) => state.fishCoins);

  const [activeTab, setActiveTab] = useState<'wallpaper' | 'flooring' | 'rug' | 'sofa' | 'catTree' | 'window'>('wallpaper');

  if (!isCondoCustomizerOpen) return null;

  const handleSelect = (key: keyof CondoCustomization, value: any) => {
    soundManager.playSparkle();
    const updated = { ...myCondo, [key]: value };
    updateCondoCustomization({ [key]: value });

    // Immediate Cloud DB Auto-Save if logged in
    fetch('/api/cat/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customization: useCatStore.getState().myCat,
        stats: useCatStore.getState().stats,
        condo: updated,
      }),
    }).catch(() => {});
  };

  const WALLPAPER_OPTIONS = [
    { id: 'cozy_cream', name: 'มินิมอลครีม 🌾', desc: 'ผนังครีมอบอุ่น บัวไม้คลาสสิก', color: 'bg-[#fdf0d5]', border: 'border-[#d4a373]' },
    { id: 'sakura_pink', name: 'ซากุระพาสเทล 🌸', desc: 'โทนสีชมพูอ่อน หวานละมุน', color: 'bg-[#ffe5ec]', border: 'border-[#ffb3c6]' },
    { id: 'midnight_star', name: 'ราตรีแสงจันทร์ 🌙', desc: 'สีกรมท่าลึก ประดับไฟดาว', color: 'bg-[#1b263b] text-white', border: 'border-[#415a77]' },
    { id: 'wooden_cabin', name: 'กระท่อมไม้สน 🪵', desc: 'ไม้สนธรรมชาติ แสนอบอุ่น', color: 'bg-[#ddb892]', border: 'border-[#7f5539]' },
  ];

  const FLOORING_OPTIONS = [
    { id: 'warm_parquet', name: 'ไม้ปาร์เกต์โอ๊ค 🪵', desc: 'พื้นไม้ลายก้างปลาคลาสสิก', color: 'bg-[#c68b59]', border: 'border-[#8f562b]' },
    { id: 'white_wood', name: 'ไม้ขาวนอร์ดิก 🤍', desc: 'ไม้สีขาวสแกนดิเนเวียน', color: 'bg-[#f8f9fa]', border: 'border-[#dee2e6]' },
    { id: 'tatami', name: 'เสื่อทาทามิ 🎋', desc: 'เสื่อทอไม้ไผ่สไตล์ญี่ปุ่น', color: 'bg-[#e9d8a6]', border: 'border-[#606c38]' },
    { id: 'pastel_tile', name: 'กระเบื้องพาสเทล 🧩', desc: 'กระเบื้องลายตารางสุดชิค', color: 'bg-[#bde0fe]', border: 'border-[#a2d2ff]' },
  ];

  const RUG_OPTIONS = [
    { id: 'paw_pink', name: 'พรมอุ้งเท้าชมพู 🐾', desc: 'พรมขนนุ่มลายอุ้งเท้าน้องแมว' },
    { id: 'cream_circle', name: 'พรมกลมขนนุ่ม ☁️', desc: 'พรมกลมสีครีมมินิมอล' },
    { id: 'boho_pattern', name: 'พรมถักโบโฮ 🧶', desc: 'ลวดลายชนเผ่าอบอุ่น' },
    { id: 'fluffy_cloud', name: 'พรมก้อนเมฆ ⛅', desc: 'นุ่มฟูเหมือนก้าวบนก้อนเมฆ' },
  ];

  const SOFA_OPTIONS = [
    { id: 'velvet_pink', name: 'ชมพูเวลเวท 💖', desc: 'กำมะหยี่สีชมพูคุณหนู', preview: '#ff758f' },
    { id: 'emerald_green', name: 'เขียวมัทฉะ 🍵', desc: 'สีเขียวธรรมชาติผ่อนคลาย', preview: '#52b788' },
    { id: 'creamy_latte', name: 'ครีมลาเต้ ☕', desc: 'สีครีมนมสไตล์คาเฟ่', preview: '#e6ccb2' },
    { id: 'denim_blue', name: 'ยีนส์บลู 👖', desc: 'สีน้ำเงินสไตล์เรโทร', preview: '#4895ef' },
  ];

  const CAT_TREE_OPTIONS = [
    { id: 'bamboo_castle', name: 'ปราสาทไม้ไผ่ 🎋', desc: 'คอนโด 3 ชั้นไม้ไผ่ญี่ปุ่น' },
    { id: 'modern_nordic', name: 'นอร์ดิกโมเดิร์น 🪵', desc: 'คอนโดไม้โอ๊คสไตล์มินิมอล' },
    { id: 'pink_princess', name: 'เจ้าหญิงพาสเทล 👑', desc: 'คอนโดสีชมพูประดับมงกุฎ' },
  ];

  const WINDOW_OPTIONS = [
    { id: 'sunny_garden', name: 'สวนแดดอุ่น ☀️', desc: 'วิวสวนดอกไม้และแสงแดดส่อง' },
    { id: 'sakura_breeze', name: 'ซากุระปลิว 🌸', desc: 'กลีบซากุระปลิวผ่านหน้าต่าง' },
    { id: 'night_stars', name: 'ท้องฟ้าราตรี 🌠', desc: 'ชมพระจันทร์และดาวตกยามค่ำ' },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#fff8eb] border-4 border-[#523e32] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#ffe5a3] via-[#ffcad4] to-[#bde0fe] border-b-3 border-[#523e32]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-[#523e32] flex items-center justify-center shadow-md">
              <Home size={22} className="text-[#523e32]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-fredoka font-bold text-[#523e32] flex items-center gap-1.5">
                ตกแต่งคอนโดแมว 🏡✨
              </h2>
              <p className="text-[11px] font-itim text-[#8d7568]">เปลี่ยนลายห้องและสไตล์เฟอร์นิเจอร์แบบ Real-time</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              setIsCondoCustomizerOpen(false);
            }}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#523e32] border-2 border-[#523e32] shadow-sm transition-transform active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-3 bg-white/80 border-b-2 border-[#ebd9c8] overflow-x-auto no-scrollbar">
          {[
            { id: 'wallpaper', label: 'ผนัง 🧱' },
            { id: 'flooring', label: 'พื้น 🪵' },
            { id: 'rug', label: 'พรม 🐾' },
            { id: 'sofa', label: 'โซฟา 🛋️' },
            { id: 'catTree', label: 'คอนโด 🏰' },
            { id: 'window', label: 'หน้าต่าง 🪟' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playPop();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-fredoka font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#523e32] text-white shadow-md scale-105'
                  : 'bg-[#fff8eb] text-[#523e32] border border-[#ebd9c8] hover:bg-[#ffe5a3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'wallpaper' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WALLPAPER_OPTIONS.map((opt) => {
                const isSelected = myCondo.wallpaper === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('wallpaper', opt.id)}
                    className={`btn-jelly p-3.5 rounded-2xl border-3 flex items-center justify-between text-left transition-all ${opt.color} ${
                      isSelected ? 'border-[#523e32] ring-4 ring-[#ffd166]/60 shadow-lg scale-102' : 'border-transparent shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="font-fredoka font-bold text-xs">{opt.name}</div>
                      <div className="font-itim text-[11px] opacity-80 mt-0.5">{opt.desc}</div>
                    </div>
                    {isSelected && <Check size={18} className="text-[#523e32] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'flooring' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FLOORING_OPTIONS.map((opt) => {
                const isSelected = myCondo.flooring === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('flooring', opt.id)}
                    className={`btn-jelly p-3.5 rounded-2xl border-3 flex items-center justify-between text-left transition-all ${opt.color} ${
                      isSelected ? 'border-[#523e32] ring-4 ring-[#ffd166]/60 shadow-lg scale-102' : 'border-transparent shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="font-fredoka font-bold text-xs text-[#523e32]">{opt.name}</div>
                      <div className="font-itim text-[11px] text-[#8d7568] mt-0.5">{opt.desc}</div>
                    </div>
                    {isSelected && <Check size={18} className="text-[#523e32] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'rug' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RUG_OPTIONS.map((opt) => {
                const isSelected = myCondo.rugStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('rugStyle', opt.id)}
                    className={`btn-jelly p-3.5 rounded-2xl border-3 bg-white flex items-center justify-between text-left transition-all ${
                      isSelected ? 'border-[#523e32] ring-4 ring-[#ffcad4]/60 shadow-lg scale-102' : 'border-[#ebd9c8] shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="font-fredoka font-bold text-xs text-[#523e32]">{opt.name}</div>
                      <div className="font-itim text-[11px] text-[#8d7568] mt-0.5">{opt.desc}</div>
                    </div>
                    {isSelected && <Check size={18} className="text-[#523e32] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'sofa' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOFA_OPTIONS.map((opt) => {
                const isSelected = myCondo.sofaColor === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('sofaColor', opt.id)}
                    className={`btn-jelly p-3.5 rounded-2xl border-3 bg-white flex items-center justify-between text-left transition-all ${
                      isSelected ? 'border-[#523e32] ring-4 ring-[#bde0fe]/60 shadow-lg scale-102' : 'border-[#ebd9c8] shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full border-2 border-[#523e32] shadow-inner" style={{ backgroundColor: opt.preview }} />
                      <div>
                        <div className="font-fredoka font-bold text-xs text-[#523e32]">{opt.name}</div>
                        <div className="font-itim text-[11px] text-[#8d7568] mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check size={18} className="text-[#523e32] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'catTree' && (
            <div className="grid grid-cols-1 gap-3">
              {CAT_TREE_OPTIONS.map((opt) => {
                const isSelected = myCondo.catTreeStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('catTreeStyle', opt.id)}
                    className={`btn-jelly p-3.5 rounded-2xl border-3 bg-white flex items-center justify-between text-left transition-all ${
                      isSelected ? 'border-[#523e32] ring-4 ring-[#ffe5a3]/60 shadow-lg scale-102' : 'border-[#ebd9c8] shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="font-fredoka font-bold text-xs text-[#523e32]">{opt.name}</div>
                      <div className="font-itim text-[11px] text-[#8d7568] mt-0.5">{opt.desc}</div>
                    </div>
                    {isSelected && <Check size={18} className="text-[#523e32] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'window' && (
            <div className="grid grid-cols-1 gap-3">
              {WINDOW_OPTIONS.map((opt) => {
                const isSelected = myCondo.windowScenery === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('windowScenery', opt.id)}
                    className={`btn-jelly p-3.5 rounded-2xl border-3 bg-white flex items-center justify-between text-left transition-all ${
                      isSelected ? 'border-[#523e32] ring-4 ring-[#ffd166]/60 shadow-lg scale-102' : 'border-[#ebd9c8] shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="font-fredoka font-bold text-xs text-[#523e32]">{opt.name}</div>
                      <div className="font-itim text-[11px] text-[#8d7568] mt-0.5">{opt.desc}</div>
                    </div>
                    {isSelected && <Check size={18} className="text-[#523e32] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t-2 border-[#ebd9c8] flex items-center justify-between">
          <span className="font-itim text-xs text-[#8d7568]">✨ ตกแต่งได้ฟรีตามใจชอบ ไม่มีค่าใช้จ่าย</span>
          <button
            onClick={() => {
              soundManager.playPop();
              setIsCondoCustomizerOpen(false);
            }}
            className="btn-jelly px-5 py-2 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb3c6] text-[#523e32] font-fredoka font-bold text-xs border-2 border-[#523e32] shadow-md cursor-pointer"
          >
            เสร็จสิ้น 🎉
          </button>
        </div>
      </div>
    </div>
  );
};
