'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCatStore } from '@/store/catStore';
import { CatRenderer } from '@/game/renderer/CatRenderer';
import { soundManager } from '@/audio/soundManager';
import confetti from 'canvas-confetti';
import {
  CatCustomization,
  BreedType,
  BodyType,
  EarType,
  TailType,
  EyeType,
  PatternType,
  HeadAccessory,
  NeckAccessory,
  BackAccessory,
  FaceAccessory,
  AuraEffect,
  PersonalityType,
} from '@/types/game';
import { Sparkles, Heart, Shuffle, Check, X, Palette, Shirt, Cat, Flame } from 'lucide-react';
import { broadcastP2PPacket } from '@/game/multiplayer/p2pManager';
import { broadcastCrossTabCustomization } from '@/game/sync/crossTabSync';

const PASTEL_COLOR_SWATCHES = [
  '#ffa94d', // Orange Tabby
  '#ffffff', // Pure White
  '#2b2d42', // Midnight Black
  '#d4a373', // Caramel Brown
  '#faedcd', // Cream Vanilla
  '#ccd5ae', // Soft Matcha
  '#ffcad4', // Sakura Pink
  '#bde0fe', // Pastel Sky
  '#e29578', // Warm Terracotta
  '#b8b8d1', // Smoky Lilac
];

const EYE_COLOR_SWATCHES = [
  '#2ec4b6', // Emerald Teal
  '#ffbf69', // Golden Amber
  '#118ab2', // Sapphire Blue
  '#06d6a0', // Mint Green
  '#9d4edd', // Amethyst Violet
  '#ff70a6', // Rose Pink
  '#4a3b32', // Deep Hazel
];

const ColorPickerInput: React.FC<{
  label: string;
  value?: string;
  onChange: (color: string) => void;
  swatches?: string[];
}> = ({ label, value = '#ffa94d', onChange, swatches = PASTEL_COLOR_SWATCHES }) => {
  const safeValue = typeof value === 'string' && value.startsWith('#') ? value : '#ffa94d';
  const displayHex = typeof value === 'string' ? value : safeValue;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="font-itim font-bold text-xs text-[#523e32]">{label}</label>
        {/* Hex Code & Color Picker Pill */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border-2 border-[#ebd9c8] shadow-sm">
          <label className="relative w-5 h-5 rounded-lg border-2 border-[#523e32]/50 overflow-hidden shadow-inner cursor-pointer" style={{ backgroundColor: safeValue }}>
            <input
              type="color"
              value={safeValue.length === 7 ? safeValue : '#ffa94d'}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="คลิกเพื่อเลือกสีอิสระ (Color Wheel)"
            />
          </label>
          <input
            type="text"
            value={displayHex}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#FFA94D"
            maxLength={7}
            className="w-18 font-fredoka font-bold text-xs text-[#523e32] bg-transparent focus:outline-none uppercase"
          />
        </div>
      </div>

      {/* Preset Swatches + Color Wheel Button */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 rounded-2xl border-2 border-[#ebd9c8]">
        {swatches.map((color) => (
          <button
            key={color}
            onClick={() => {
              soundManager.playPop();
              onChange(color);
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 transition-transform cursor-pointer ${
              safeValue.toLowerCase() === color.toLowerCase()
                ? 'border-[#523e32] scale-110 shadow-md ring-2 ring-[#ffcad4]'
                : 'border-white/60 hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}

        {/* Custom Color Wheel Picker */}
        <label
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 border-dashed border-[#523e32] bg-gradient-to-tr from-[#ff0055] via-[#00ff88] to-[#0088ff] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform shadow-sm ml-auto"
          title="จานสีอิสระ (Custom Hex Color Wheel)"
        >
          <Palette size={14} className="text-white drop-shadow" />
          <input
            type="color"
            value={safeValue.length === 7 ? safeValue : '#ffa94d'}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
};

const DEFAULT_CUSTOMIZER_CAT: CatCustomization = {
  name: 'Mochi (โมจิ)',
  gender: 'boy',
  breed: 'orange_tabby',
  bodyType: 'chonky',
  earType: 'pointed',
  tailType: 'fluffy',
  eyeType: 'sparkle',
  eyeColorLeft: '#2ec4b6',
  eyeColorRight: '#ffbf69',
  baseColor: '#ffa94d',
  patternType: 'tabby',
  patternColor: '#d97706',
  snoutColor: '#ffffff',
  pawColor: '#ffffff',
  bellyColor: '#fff3bf',
  accessoryHead: 'straw_hat',
  accessoryNeck: 'gold_bell',
  accessoryBack: 'backpack',
  accessoryFace: 'cute_blush',
  aura: 'sparkles',
  personality: 'chaotic',
};

export const CatCustomizerModal: React.FC = () => {
  const isCustomizerOpen = useCatStore((state) => state.isCustomizerOpen);
  const setCustomizerOpen = useCatStore((state) => state.setCustomizerOpen);
  const myCat = useCatStore((state) => state.myCat);
  const updateCustomization = useCatStore((state) => state.updateCustomization);

  const [activeTab, setActiveTab] = useState<'anatomy' | 'coat' | 'fashion' | 'personality'>('anatomy');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeCat: CatCustomization = {
    ...DEFAULT_CUSTOMIZER_CAT,
    ...myCat,
  };

  // Animate live preview
  useEffect(() => {
    if (!isCustomizerOpen) return;

    let animId: number;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (timeMs: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background soft circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 + 10, 110, 0, Math.PI * 2);
      ctx.fillStyle = '#fff6d6';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ebd9c8';
      ctx.stroke();

      CatRenderer.render({
        ctx,
        custom: activeCat,
        behavior: 'idle',
        direction: 'down',
        x: canvas.width / 2,
        y: canvas.height / 2 + 20,
        scale: 2.2,
        timeMs,
        isMoving: false,
        showNameTag: false,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isCustomizerOpen, myCat, activeCat]);

  if (!isCustomizerOpen) return null;

  // Randomize Cat
  const handleRandomize = () => {
    soundManager.playSparkle();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ffcad4', '#bde0fe', '#ffe5a3', '#caeedf'],
    });

    const breeds: BreedType[] = ['persian', 'munchkin', 'siamese', 'calico', 'scottish', 'bengal', 'orange_tabby', 'black_cat'];
    const bodies: BodyType[] = ['slim', 'normal', 'chonky', 'munchkin'];
    const ears: EarType[] = ['pointed', 'folded', 'curled', 'round'];
    const tails: TailType[] = ['straight', 'fluffy', 'bobtail', 'kinked'];
    const patterns: PatternType[] = ['solid', 'tabby', 'tuxedo', 'calico', 'siamese', 'cow', 'tiger'];
    const hats: HeadAccessory[] = ['none', 'straw_hat', 'flower_crown', 'wizard_hat', 'beret', 'pink_bow', 'chef_hat'];
    const necks: NeckAccessory[] = ['none', 'gold_bell', 'red_ribbon', 'pink_scarf', 'fish_pendant', 'bowtie'];
    const backs: BackAccessory[] = ['none', 'backpack', 'angel_wings', 'toast_slice', 'cape'];
    const faces: FaceAccessory[] = ['none', 'sunglasses', 'monocle', 'cute_blush'];
    const auras: AuraEffect[] = ['none', 'sparkles', 'hearts', 'music_notes', 'paw_prints'];
    const personalities: PersonalityType[] = ['cuddly', 'chaotic', 'curious', 'timid', 'sleepy', 'noble'];

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    updateCustomization({
      breed: pick(breeds),
      bodyType: pick(bodies),
      earType: pick(ears),
      tailType: pick(tails),
      baseColor: pick(PASTEL_COLOR_SWATCHES),
      patternType: pick(patterns),
      patternColor: pick(PASTEL_COLOR_SWATCHES),
      eyeColorLeft: pick(EYE_COLOR_SWATCHES),
      eyeColorRight: Math.random() > 0.4 ? pick(EYE_COLOR_SWATCHES) : undefined,
      accessoryHead: pick(hats),
      accessoryNeck: pick(necks),
      accessoryBack: pick(backs),
      accessoryFace: pick(faces),
      aura: pick(auras),
      personality: pick(personalities),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: LIVE CAT PREVIEW & NAME */}
        <div className="w-full md:w-5/12 bg-gradient-to-b from-[#fff6d6] to-[#ffe4e9] p-6 flex flex-col items-center justify-between border-b-4 md:border-b-0 md:border-r-4 border-[#523e32]">
          
          {/* Header Title */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐱</span>
              <h2 className="font-fredoka font-bold text-xl text-[#523e32]">Cat Studio</h2>
            </div>
            <span className="badge-pill bg-white text-xs text-[#523e32] font-fredoka">
              {myCat.gender === 'boy' ? '♂️ เด็กชาย' : '♀️ เด็กหญิง'}
            </span>
          </div>

          {/* Live Canvas Preview */}
          <div className="relative my-2">
            <canvas
              ref={previewCanvasRef}
              width={260}
              height={260}
              className="drop-shadow-lg select-none"
            />
          </div>

          {/* Name & Quick Controls */}
          <div className="w-full space-y-3">
            <div className="space-y-1">
              <label className="font-itim text-xs text-[#8d7568] font-bold">ชื่อน้องแมว</label>
              <input
                type="text"
                value={myCat.name}
                onChange={(e) => updateCustomization({ name: e.target.value })}
                className="w-full px-4 py-2 rounded-2xl bg-white border-2 border-[#ebd9c8] font-fredoka font-bold text-[#523e32] text-center focus:outline-none focus:border-[#ffcad4]"
                placeholder="ตั้งชื่อน้องแมว..."
              />
            </div>

            {/* Randomize Button */}
            <button
              onClick={handleRandomize}
              className="btn-jelly w-full py-2.5 rounded-2xl bg-[#ffe494] text-[#523e32] font-fredoka font-bold text-sm border-2 border-[#523e32] flex items-center justify-center gap-2"
            >
              <Shuffle size={16} />
              สุ่มดีไซน์น่ารัก (Randomize)
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMIZATION CONTROLS */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
          
          {/* Tabs Navigation */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('anatomy');
              }}
              className={`btn-jelly py-2 rounded-2xl font-fredoka font-bold text-xs flex flex-col items-center gap-1 border-2 border-[#523e32] ${
                activeTab === 'anatomy' ? 'bg-[#ffcad4] text-[#523e32]' : 'bg-white text-[#8d7568]'
              }`}
            >
              <Cat size={16} />
              สรีระ
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('coat');
              }}
              className={`btn-jelly py-2 rounded-2xl font-fredoka font-bold text-xs flex flex-col items-center gap-1 border-2 border-[#523e32] ${
                activeTab === 'coat' ? 'bg-[#bde0fe] text-[#523e32]' : 'bg-white text-[#8d7568]'
              }`}
            >
              <Palette size={16} />
              ลวดลาย
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('fashion');
              }}
              className={`btn-jelly py-2 rounded-2xl font-fredoka font-bold text-xs flex flex-col items-center gap-1 border-2 border-[#523e32] ${
                activeTab === 'fashion' ? 'bg-[#ffe5a3] text-[#523e32]' : 'bg-white text-[#8d7568]'
              }`}
            >
              <Shirt size={16} />
              แฟชั่น
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('personality');
              }}
              className={`btn-jelly py-2 rounded-2xl font-fredoka font-bold text-xs flex flex-col items-center gap-1 border-2 border-[#523e32] ${
                activeTab === 'personality' ? 'bg-[#caeedf] text-[#523e32]' : 'bg-white text-[#8d7568]'
              }`}
            >
              <Flame size={16} />
              นิสัย & ออร่า
            </button>
          </div>

          {/* TAB 1: ANATOMY & GENETICS */}
          {activeTab === 'anatomy' && (
            <div className="space-y-5">
              {/* Body Type */}
              <div className="space-y-2">
                <label className="font-itim font-bold text-sm text-[#523e32]">ประเภทร่างกาย (Body Type)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'slim', label: 'เพรียวบาง 🏃' },
                    { id: 'normal', label: 'สมส่วน 🐈' },
                    { id: 'chonky', label: 'อ้วนกลม 🍞' },
                    { id: 'munchkin', label: 'ขาสั้น 🐾' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playPop();
                        updateCustomization({ bodyType: item.id as BodyType });
                      }}
                      className={`btn-jelly py-2 px-1 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.bodyType === item.id ? 'bg-[#ffcad4]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ears */}
              <div className="space-y-2">
                <label className="font-itim font-bold text-sm text-[#523e32]">ทรงหู (Ear Shape)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'pointed', label: 'หูตั้งตรง 📐' },
                    { id: 'folded', label: 'หูพับ 🍂' },
                    { id: 'curled', label: 'หูม้วน 🌀' },
                    { id: 'round', label: 'หูมน 🐻' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playPop();
                        updateCustomization({ earType: item.id as EarType });
                      }}
                      className={`btn-jelly py-2 px-1 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.earType === item.id ? 'bg-[#bde0fe]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tails */}
              <div className="space-y-2">
                <label className="font-itim font-bold text-sm text-[#523e32]">ทรงหาง (Tail Shape)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'straight', label: 'หางตรง 🎋' },
                    { id: 'fluffy', label: 'หางฟูพวง 🦊' },
                    { id: 'bobtail', label: 'หางกุด 🐇' },
                    { id: 'kinked', label: 'หางคด ⚡' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playPop();
                        updateCustomization({ tailType: item.id as TailType });
                      }}
                      className={`btn-jelly py-2 px-1 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.tailType === item.id ? 'bg-[#ffe5a3]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heterochromia Eyes (ตาสองสี) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-itim font-bold text-sm text-[#523e32]">
                    สีดวงตา (Heterochromia ตาสองสี)
                  </label>
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      updateCustomization({
                        eyeColorRight: myCat.eyeColorLeft,
                      });
                    }}
                    className="text-xs font-itim text-[#8d7568] hover:text-[#523e32] underline cursor-pointer"
                  >
                    ตั้งสีตาให้เท่ากัน
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ColorPickerInput
                    label="ตาข้างซ้าย (Left Eye)"
                    value={myCat.eyeColorLeft}
                    onChange={(color) => updateCustomization({ eyeColorLeft: color })}
                    swatches={EYE_COLOR_SWATCHES}
                  />
                  <ColorPickerInput
                    label="ตาข้างขวา (Right Eye)"
                    value={myCat.eyeColorRight}
                    onChange={(color) => updateCustomization({ eyeColorRight: color })}
                    swatches={EYE_COLOR_SWATCHES}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COAT & PATTERNS */}
          {activeTab === 'coat' && (
            <div className="space-y-5">
              {/* Pattern Type */}
              <div className="space-y-2">
                <label className="font-itim font-bold text-sm text-[#523e32]">ลวดลายขน (Coat Pattern)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'solid', label: 'สีล้วน 🥛' },
                    { id: 'tabby', label: 'ลายสลิด 🐅' },
                    { id: 'tuxedo', label: 'ทักซิโด้ 🤵' },
                    { id: 'calico', label: 'สามสี 🍰' },
                    { id: 'siamese', label: 'วิเชียรมาศ ☕' },
                    { id: 'cow', label: 'ลายวัว 🐮' },
                    { id: 'tiger', label: 'ลายเสือ 🐯' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playPop();
                        updateCustomization({ patternType: item.id as PatternType });
                      }}
                      className={`btn-jelly py-2 px-1 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.patternType === item.id ? 'bg-[#ffcad4]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Fur Color */}
              <ColorPickerInput
                label="สีขนหลัก (Base Fur Color)"
                value={myCat.baseColor}
                onChange={(color) => updateCustomization({ baseColor: color })}
                swatches={PASTEL_COLOR_SWATCHES}
              />

              {/* Secondary Pattern Color */}
              <ColorPickerInput
                label="สีลวดลาย (Pattern Stripe Color)"
                value={myCat.patternColor}
                onChange={(color) => updateCustomization({ patternColor: color })}
                swatches={PASTEL_COLOR_SWATCHES}
              />

              {/* Snout & Muzzle Color */}
              <ColorPickerInput
                label="สีปาก & จมูก (Snout & Muzzle Color)"
                value={myCat.snoutColor}
                onChange={(color) => updateCustomization({ snoutColor: color })}
                swatches={['#ffffff', '#fff3bf', '#faedcd', '#ffa94d', '#2b2d42', '#d4a373', '#ffcad4']}
              />

              {/* Belly Color */}
              <ColorPickerInput
                label="สีพุง & หน้าอก (Belly Color)"
                value={myCat.bellyColor}
                onChange={(color) => updateCustomization({ bellyColor: color })}
                swatches={['#fff3bf', '#ffffff', '#faedcd', '#ffcad4', '#d4a373', '#2b2d42']}
              />

              {/* Paw Color */}
              <ColorPickerInput
                label="สีอุ้งเท้า (Paws Color)"
                value={myCat.pawColor}
                onChange={(color) => updateCustomization({ pawColor: color })}
                swatches={['#ffffff', '#fff3bf', '#ffcad4', '#ffa94d', '#2b2d42', '#d4a373']}
              />
            </div>
          )}

          {/* TAB 3: FASHION & ACCESSORIES */}
          {activeTab === 'fashion' && (
            <div className="space-y-4">
              {/* Head Accessory */}
              <div className="space-y-1">
                <label className="font-itim font-bold text-xs text-[#523e32]">หมวก & ศีรษะ (Head)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'ไม่ใส่' },
                    { id: 'straw_hat', label: 'หมวกฟาง 👒' },
                    { id: 'flower_crown', label: 'มงกุฎดอกไม้ 🌸' },
                    { id: 'frog_hat', label: 'หมวกกบ 🐸' },
                    { id: 'princess_tiara', label: 'มงกุฎเจ้าหญิง 👑' },
                    { id: 'detective_hat', label: 'หมวกนักสืบ 🕵️' },
                    { id: 'party_hat', label: 'หมวกปาร์ตี้ 🥳' },
                    { id: 'wizard_hat', label: 'หมวกพ่อมด 🧙' },
                    { id: 'pink_bow', label: 'โบว์ชมพู 🎀' },
                    { id: 'chef_hat', label: 'หมวกเชฟ 👨‍🍳' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playPop();
                        updateCustomization({ accessoryHead: item.id as HeadAccessory });
                      }}
                      className={`btn-jelly py-2 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.accessoryHead === item.id ? 'bg-[#ffe5a3]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neck Accessory */}
              <div className="space-y-1">
                <label className="font-itim font-bold text-xs text-[#523e32]">ปลอกคอ & สร้อย (Neck)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'ไม่ใส่' },
                    { id: 'gold_bell', label: 'กระดิ่งทอง 🔔' },
                    { id: 'red_ribbon', label: 'ริบบิ้นแดง 🎀' },
                    { id: 'rainbow_collar', label: 'ปลอกคอรุ้ง 🌈' },
                    { id: 'pearl_necklace', label: 'สร้อยไข่มุก 🦪' },
                    { id: 'pink_scarf', label: 'ผ้าพันคอ 🧣' },
                    { id: 'fish_pendant', label: 'จี้ปลา 🐟' },
                    { id: 'bowtie', label: 'หูกระต่าย 👔' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playBell();
                        updateCustomization({ accessoryNeck: item.id as NeckAccessory });
                      }}
                      className={`btn-jelly py-2 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.accessoryNeck === item.id ? 'bg-[#ffcad4]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Back Accessory */}
              <div className="space-y-1">
                <label className="font-itim font-bold text-xs text-[#523e32]">หลัง & ปีก (Back)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'ไม่ใส่' },
                    { id: 'backpack', label: 'เป้นักเรียน 🎒' },
                    { id: 'angel_wings', label: 'ปีกนางฟ้า 🪽' },
                    { id: 'dragon_wings', label: 'ปีกมังกร 🐉' },
                    { id: 'butterfly_wings', label: 'ปีกผีเสื้อ 🦋' },
                    { id: 'toast_slice', label: 'ขนมปังปิ้ง 🍞' },
                    { id: 'cape', label: 'ผ้าคลุม 🦸' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playPop();
                        updateCustomization({ accessoryBack: item.id as BackAccessory });
                      }}
                      className={`btn-jelly py-2 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.accessoryBack === item.id ? 'bg-[#bde0fe]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Face Accessory */}
              <div className="space-y-1">
                <label className="font-itim font-bold text-xs text-[#523e32]">ใบหน้า & แว่นตา (Face)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'ไม่ใส่' },
                    { id: 'cute_blush', label: 'แก้มแดงน่ารัก 🌸' },
                    { id: 'sunglasses', label: 'แว่นกันแดดเท่ 🕶️' },
                    { id: 'heart_glasses', label: 'แว่นหัวใจ 💖' },
                    { id: 'mustache', label: 'หนวดคุณชาย 🥸' },
                    { id: 'monocle', label: 'แว่นขุนนาง 🧐' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playPop();
                        updateCustomization({ accessoryFace: item.id as FaceAccessory });
                      }}
                      className={`btn-jelly py-2 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.accessoryFace === item.id ? 'bg-[#caeedf]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AURA & PERSONALITY */}
          {activeTab === 'personality' && (
            <div className="space-y-5">
              {/* Personality Archetype */}
              <div className="space-y-2">
                <label className="font-itim font-bold text-sm text-[#523e32]">นิสัยประจำตัว (Personality)</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'cuddly', name: 'ขี้อ้อน (Cuddly)', desc: 'ชอบมานอนเกย purr เสียงดัง' },
                    { id: 'chaotic', name: 'จอมซน (Chaotic)', desc: 'วิ่ง Zoomies บ่อย ตะปบทุกสิ่ง' },
                    { id: 'curious', name: 'นักสำรวจ (Curious)', desc: 'ชอบมุดกล่อง สำรวจของใหม่' },
                    { id: 'timid', name: 'ขี้ระแวง (Timid)', desc: 'ตกใจง่าย แต่รักเจ้าของมาก' },
                    { id: 'sleepy', name: 'ขี้เซา (Sleepy)', desc: 'นอน 18 ชม./วัน นอนแผ่พุง' },
                    { id: 'noble', name: 'คุณหนูไฮโซ (Noble)', desc: 'เดินสง่างาม กินอาหารเปียก' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playPurr();
                        updateCustomization({ personality: item.id as PersonalityType });
                      }}
                      className={`btn-jelly p-3 rounded-2xl text-left border-2 border-[#523e32] ${
                        myCat.personality === item.id ? 'bg-[#ffcad4]' : 'bg-white'
                      }`}
                    >
                      <div className="font-fredoka font-bold text-xs text-[#523e32]">{item.name}</div>
                      <div className="font-itim text-[11px] text-[#8d7568]">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aura Effects */}
              <div className="space-y-2">
                <label className="font-itim font-bold text-sm text-[#523e32]">เอฟเฟกต์ออร่าลอย (Aura)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'ไม่มีออร่า' },
                    { id: 'sparkles', label: 'ประกายวิ้ง ✨' },
                    { id: 'hearts', label: 'ฟองหัวใจ 💖' },
                    { id: 'music_notes', label: 'ตัวโน้ตดนตรี 🎵' },
                    { id: 'paw_prints', label: 'รอยเท้านำโชค 🐾' },
                    { id: 'stars', label: 'ดวงดาวส่องแสง ⭐' },
                    { id: 'rainbow', label: 'สายรุ้ง 🌈' },
                    { id: 'cherry_blossoms', label: 'ซากุระปลิว 🌸' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundManager.playSparkle();
                        updateCustomization({ aura: item.id as AuraEffect });
                      }}
                      className={`btn-jelly py-2.5 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                        myCat.aura === item.id ? 'bg-[#ffe5a3]' : 'bg-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM CONFIRM BUTTON */}
          <div className="pt-6 border-t-2 border-[#ebd9c8] flex items-center justify-end gap-3">
            <button
              onClick={() => {
                soundManager.playPop();
                setCustomizerOpen(false);
              }}
              className="btn-jelly px-5 py-2.5 rounded-2xl bg-white text-[#523e32] font-fredoka font-bold text-sm border-2 border-[#523e32]"
            >
              ยกเลิก
            </button>
            <button
              onClick={async () => {
                soundManager.playMeow(1.3);
                soundManager.playSparkle();
                setCustomizerOpen(false);

                // 1. Broadcast updated cat appearance & name tag over WebRTC in real-time
                let currentPos = { x: 700, y: 480, direction: 'down' };
                try {
                  const saved = localStorage.getItem('wecats_player_pos');
                  if (saved) currentPos = { ...currentPos, ...JSON.parse(saved) };
                } catch {}

                broadcastP2PPacket({
                  type: 'cat-joined',
                  customization: myCat,
                  stats: useCatStore.getState().stats,
                  x: currentPos.x,
                  y: currentPos.y,
                  direction: currentPos.direction,
                  isGreeting: false,
                });

                broadcastP2PPacket({
                  type: 'cat-move',
                  customization: myCat,
                  x: currentPos.x,
                  y: currentPos.y,
                  direction: currentPos.direction,
                  isMoving: false,
                  behavior: 'idle',
                });

                // Sync cat customization to other tabs of the same browser instantly
                broadcastCrossTabCustomization(myCat);

                useCatStore.getState().setNotification(`แปลงโฉมและบันทึก "${myCat.name}" เรียบร้อย! 🌸✨`);

                // 2. Persist to Cloud Database
                try {
                  await fetch('/api/cat/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customization: myCat }),
                  });
                } catch {}
              }}
              className="btn-jelly px-8 py-2.5 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] font-fredoka font-bold text-sm border-2 border-[#523e32] flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Check size={18} />
              บันทึกและพาน้องแมวออกเดินเล่น!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
