'use client';

import React from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import {
  X,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sunset,
  LogOut,
  Maximize2,
  Minimize2,
  Palette,
  Sparkles,
} from 'lucide-react';
import {
  BoutiqueBagIcon,
  DiaryJournalIcon,
  FriendsDuoIcon,
  PhotoCameraIcon,
  PassportBadgeIcon,
  FishCoinIcon,
  CatPawIcon,
} from '@/components/ui/GameIcons';

interface MobileDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { username: string; isGuest: boolean } | null;
  onLogout: () => void;
}

export const MobileDrawerMenu: React.FC<MobileDrawerMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
}) => {
  const setShopOpen = useCatStore((state) => state.setShopOpen);
  const setDiaryOpen = useCatStore((state) => state.setDiaryOpen);
  const setFriendsOpen = useCatStore((state) => state.setFriendsOpen);
  const setProfileOpen = useCatStore((state) => state.setProfileOpen);
  const setPhotoMode = useCatStore((state) => state.setPhotoMode);
  const setCustomizerOpen = useCatStore((state) => state.setCustomizerOpen);
  const pendingFriendRequests = useCatStore((state) => state.pendingFriendRequests);
  const isSoundEnabled = useCatStore((state) => state.isSoundEnabled);
  const toggleSound = useCatStore((state) => state.toggleSound);
  const timeOfDay = useCatStore((state) => state.timeOfDay);
  const fishCoins = useCatStore((state) => state.fishCoins);
  const myCat = useCatStore((state) => state.myCat);

  if (!isOpen) return null;

  const cycleTimeOfDay = () => {
    soundManager.playPop();
    const times: Array<'morning' | 'afternoon' | 'evening' | 'night'> = [
      'morning',
      'afternoon',
      'evening',
      'night',
    ];
    const nextIndex = (times.indexOf(timeOfDay) + 1) % times.length;
    useCatStore.setState({ timeOfDay: times[nextIndex] });
  };

  const getTimeLabel = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'บรรยากาศ: เช้า 08:00 ☀️';
      case 'afternoon':
        return 'บรรยากาศ: บ่าย 14:00 🌤️';
      case 'evening':
        return 'บรรยากาศ: เย็น 18:00 🌇';
      case 'night':
        return 'บรรยากาศ: ค่ำ 22:00 🌙';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in pointer-events-auto">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Card */}
      <div className="relative w-72 max-w-[85vw] h-full bg-[#fff8eb] border-l-3 border-[#523e32] shadow-2xl p-4 flex flex-col justify-between overflow-y-auto pb-8 z-10 animate-in slide-in-from-right duration-200">
        
        {/* Top Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#ebd9c8] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ffCAD4] border-2 border-[#523e32] flex items-center justify-center">
                <CatPawIcon size={18} color="#523e32" />
              </div>
              <div>
                <h3 className="font-fredoka font-bold text-sm text-[#523e32]">เมนูระบบ</h3>
                <span className="font-itim text-[11px] text-[#8d7568]">{myCat.name} • {currentUser?.username}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#ebd9c8]/50 hover:bg-[#ebd9c8] text-[#523e32] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Stats Capsule */}
          <div className="bg-white/80 rounded-2xl p-2.5 border-2 border-[#ebd9c8] flex items-center justify-between">
            <span className="font-itim text-xs text-[#8d7568]">เหรียญปลาทูสะสม</span>
            <div className="flex items-center gap-1.5 font-fredoka font-bold text-xs text-[#523e32] bg-[#fff3bf] px-2.5 py-1 rounded-full border border-[#d97706]/20">
              <FishCoinIcon size={16} />
              <span>{fishCoins} 🐟</span>
            </div>
          </div>

          {/* Nav Items List */}
          <div className="space-y-2">
            {/* 0. Condo / Home Button */}
            {useCatStore.getState().currentRoom.type === 'condo' ? (
              <>
                <button
                  onClick={() => {
                    soundManager.playSparkle();
                    onClose();
                    useCatStore.getState().setIsCondoCustomizerOpen(true);
                  }}
                  className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#ffcad4] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette size={18} />
                    <span>ตกแต่งคอนโดแมว 🎨</span>
                  </div>
                  <span className="text-[10px] text-[#8d7568] font-itim">เปลี่ยนลาย 🛋️</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playPop();
                    onClose();
                    useCatStore.getState().exitCondoToPlaza();
                  }}
                  className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#e8f4fc] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🌸</span>
                    <span>ออกสู่ลาน Plaza #1</span>
                  </div>
                  <span className="text-[10px] text-[#8d7568] font-itim">วาร์ป 🚪</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  soundManager.playPop();
                  onClose();
                  useCatStore.getState().enterMyCondo();
                }}
                className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#ffd166] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32] shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🏡</span>
                  <span>บ้านคอนโดส่วนตัว</span>
                </div>
                <span className="text-[10px] text-[#523e32] font-itim bg-white/80 px-2 py-0.5 rounded-full">เข้าบ้าน 🐾</span>
              </button>
            )}

            {/* 1. Shop */}
            <button
              onClick={() => {
                soundManager.playPop();
                onClose();
                setShopOpen(true);
              }}
              className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#ffe5a3] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
            >
              <div className="flex items-center gap-2.5">
                <BoutiqueBagIcon size={18} />
                <span>ร้านค้าแฟชั่น & ขนม</span>
              </div>
              <span className="text-[10px] text-[#8d7568] font-itim">เปิดช้อป 🛍️</span>
            </button>

            {/* 2. Friends */}
            <button
              onClick={() => {
                soundManager.playPop();
                onClose();
                setFriendsOpen(true);
              }}
              className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#bde0fe] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
            >
              <div className="flex items-center gap-2.5">
                <FriendsDuoIcon size={18} />
                <span>เพื่อนสนิท & แชท DM</span>
              </div>
              {pendingFriendRequests.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-[#ff4d6d] text-white text-[10px] font-fredoka font-bold animate-bounce shadow-sm">
                  {pendingFriendRequests.length} ใหม่
                </span>
              ) : (
                <span className="text-[10px] text-[#8d7568] font-itim">รายชื่อ 👥</span>
              )}
            </button>

            {/* 3. Diary */}
            <button
              onClick={() => {
                soundManager.playPop();
                onClose();
                setDiaryOpen(true);
              }}
              className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#caeedf] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
            >
              <div className="flex items-center gap-2.5">
                <DiaryJournalIcon size={18} />
                <span>สมุดไดอารี่ & อัลบั้ม</span>
              </div>
              <span className="text-[10px] text-[#8d7568] font-itim">บันทึก 📖</span>
            </button>

            {/* 4. Passport Profile */}
            <button
              onClick={() => {
                soundManager.playPurr();
                onClose();
                setProfileOpen(true);
              }}
              className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#fff0f3] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
            >
              <div className="flex items-center gap-2.5">
                <PassportBadgeIcon size={18} />
                <span>พาสปอร์ต & สถิติแมว</span>
              </div>
              <span className="text-[10px] text-[#8d7568] font-itim">ดูโปรไฟล์ 🪪</span>
            </button>

            {/* 5. Photo Mode */}
            <button
              onClick={() => {
                soundManager.playPop();
                onClose();
                setPhotoMode(true);
              }}
              className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
            >
              <div className="flex items-center gap-2.5">
                <PhotoCameraIcon size={18} />
                <span>โหมดกล้องถ่ายรูป</span>
              </div>
              <span className="text-[10px] text-[#8d7568] font-itim">แชะรูป 📷</span>
            </button>

            {/* 6. Cat Studio Customizer */}
            <button
              onClick={() => {
                soundManager.playSparkle();
                onClose();
                setCustomizerOpen(true);
              }}
              className="w-full btn-jelly flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#ffcad4] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32]"
            >
              <div className="flex items-center gap-2.5">
                <Palette size={18} />
                <span>ห้องแต่งตัว Cat Studio</span>
              </div>
              <span className="text-[10px] text-[#8d7568] font-itim">แปลงโฉม 🎨</span>
            </button>
          </div>
        </div>

        {/* Bottom Utility Controls */}
        <div className="pt-4 border-t-2 border-[#ebd9c8] space-y-2">
          {/* Time Switcher */}
          <button
            onClick={cycleTimeOfDay}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#ebd9c8] text-xs font-itim text-[#523e32]"
          >
            <span>{getTimeLabel()}</span>
            <span className="text-xs font-bold text-[#8d7568]">เปลี่ยน ↺</span>
          </button>

          {/* Sound Switcher */}
          <button
            onClick={() => {
              toggleSound();
              soundManager.setMuted(isSoundEnabled);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#ebd9c8] text-xs font-itim text-[#523e32]"
          >
            <div className="flex items-center gap-2">
              {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-400" />}
              <span>เสียงดนตรี & เอฟเฟกต์</span>
            </div>
            <span className={`text-xs font-bold ${isSoundEnabled ? 'text-emerald-600' : 'text-red-500'}`}>
              {isSoundEnabled ? 'เปิดอยู่ 🔊' : 'ปิดอยู่ 🔇'}
            </span>
          </button>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-fredoka font-bold text-red-600 transition-colors"
            >
              <LogOut size={14} />
              <span>ออกจากระบบ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
