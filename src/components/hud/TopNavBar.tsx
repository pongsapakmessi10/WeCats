'use client';

import React, { useState, useEffect } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import {
  Camera,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sunset,
  Palette,
  User,
  Maximize2,
  Minimize2,
  LogIn,
  LogOut,
  Radio,
  ShoppingBag,
  BookOpen,
  Users,
} from 'lucide-react';

interface TopNavBarProps {
  onOpenAuth: () => void;
  onOpenChannels: () => void;
  currentUser: { username: string; isGuest: boolean } | null;
  onLogout: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onOpenAuth,
  onOpenChannels,
  currentUser,
  onLogout,
}) => {
  const myCat = useCatStore((state) => state.myCat);
  const fishCoins = useCatStore((state) => state.fishCoins);
  const setCustomizerOpen = useCatStore((state) => state.setCustomizerOpen);
  const setProfileOpen = useCatStore((state) => state.setProfileOpen);
  const setPhotoMode = useCatStore((state) => state.setPhotoMode);
  const setShopOpen = useCatStore((state) => state.setShopOpen);
  const setDiaryOpen = useCatStore((state) => state.setDiaryOpen);
  const setFriendsOpen = useCatStore((state) => state.setFriendsOpen);
  const isSoundEnabled = useCatStore((state) => state.isSoundEnabled);
  const toggleSound = useCatStore((state) => state.toggleSound);
  const timeOfDay = useCatStore((state) => state.timeOfDay);
  const notificationText = useCatStore((state) => state.notificationText);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    soundManager.playPop();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const cycleTimeOfDay = () => {
    soundManager.playPop();
    const next: Record<string, 'morning' | 'afternoon' | 'evening' | 'night'> = {
      morning: 'afternoon',
      afternoon: 'evening',
      evening: 'night',
      night: 'morning',
    };
    useCatStore.setState({ timeOfDay: next[timeOfDay] });
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return <Sun className="text-orange-400 shrink-0" size={16} />;
      case 'afternoon':
        return <Sun className="text-yellow-500 shrink-0" size={16} />;
      case 'evening':
        return <Sunset className="text-pink-500 shrink-0" size={16} />;
      case 'night':
        return <Moon className="text-indigo-400 shrink-0" size={16} />;
    }
  };

  const getTimeLabel = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'เช้า 08:00';
      case 'afternoon':
        return 'บ่าย 14:00';
      case 'evening':
        return 'เย็น 18:00';
      case 'night':
        return 'ค่ำ 22:00';
    }
  };

  return (
    <header className="w-full flex flex-col gap-2 z-30 pointer-events-auto">
      <div className="w-full flex items-center justify-between gap-2.5 sm:gap-3.5 bg-white/95 backdrop-blur-md px-3 sm:px-5 py-2.5 rounded-full border-3 border-[#ebd9c8] shadow-xl">
        
        {/* Left: Logo & Channel Switcher & Coin Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ffcad4] to-[#ffe5a3] flex items-center justify-center text-xl shadow-sm border-2 border-[#523e32] shrink-0">
            🐾
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-nowrap">
              <h1 className="font-fredoka font-bold text-lg text-[#523e32] tracking-tight whitespace-nowrap">
                WeCats
              </h1>
              
              {/* Channel Selector Button */}
              <button
                onClick={() => {
                  soundManager.playPop();
                  onOpenChannels();
                }}
                className="badge-pill bg-[#caeedf] hover:bg-[#b7e4c7] text-[#2b7a5a] text-xs font-fredoka py-1 px-3 transition-colors cursor-pointer border border-[#2b7a5a]/20 whitespace-nowrap flex items-center gap-1.5 shrink-0"
                title="คลิกเพื่อสลับห้อง / สร้างห้องส่วนตัว"
              >
                <Radio size={12} className="shrink-0" />
                <span className="whitespace-nowrap font-bold">{useCatStore((state) => state.currentRoom.name)}</span>
              </button>

              {/* Fish Coins Balance Pill */}
              <button
                onClick={() => {
                  soundManager.playPop();
                  setShopOpen(true);
                }}
                className="badge-pill bg-[#fff3bf] hover:bg-[#ffe5a3] text-[#523e32] border border-[#d97706]/30 text-xs font-fredoka font-bold py-1 px-2.5 flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                title="คลิกเพื่อเปิดร้านค้าบูติก"
              >
                <span>🐟</span>
                <span>{fishCoins}</span>
              </button>
            </div>
            <p className="font-itim text-[11px] text-[#8d7568] hidden sm:block whitespace-nowrap">
              2D Cozy Cat Sim MMO
            </p>
          </div>
        </div>

        {/* Center: Live Notification Banner */}
        <div className="hidden xl:flex items-center gap-2 bg-[#fffbf0] px-4 py-1.5 rounded-full border border-[#ebd9c8] max-w-sm shadow-inner flex-1 mx-2 overflow-hidden">
          <span className="text-sm shrink-0">🔔</span>
          <span className="font-itim text-xs text-[#523e32] truncate font-medium">
            {notificationText}
          </span>
        </div>

        {/* Right: Actions & Modals */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
          
          {/* User Auth Info / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-[#fbf7f0] px-3 py-1.5 rounded-full border-2 border-[#ebd9c8] shrink-0 whitespace-nowrap">
              <span className="text-xs">👤</span>
              <span className="font-fredoka font-bold text-xs text-[#523e32] max-w-[100px] truncate">
                {currentUser.username}
              </span>
              {currentUser.isGuest && (
                <span className="badge-pill bg-amber-100 text-amber-800 text-[9px] py-0.5 px-1.5 font-fredoka">
                  Guest
                </span>
              )}
              <button
                onClick={onLogout}
                className="text-[#8d7568] hover:text-red-500 ml-1 shrink-0"
                title="ออกจากระบบ"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenAuth();
              }}
              className="btn-jelly flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffe5a3] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32] shrink-0 whitespace-nowrap"
            >
              <LogIn size={14} className="shrink-0" />
              <span className="whitespace-nowrap">เข้าสู่ระบบ</span>
            </button>
          )}

          {/* Boutique Shop Button */}
          <button
            onClick={() => {
              soundManager.playPop();
              setShopOpen(true);
            }}
            className="btn-jelly flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffe5a3] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32] shrink-0 whitespace-nowrap shadow-sm"
            title="ร้านค้าแฟชั่น & ขนมแมว"
          >
            <ShoppingBag size={14} className="shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">ร้านค้า</span>
          </button>

          {/* Diary & Photo Album Button */}
          <button
            onClick={() => {
              soundManager.playPop();
              setDiaryOpen(true);
            }}
            className="btn-jelly flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#caeedf] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32] shrink-0 whitespace-nowrap shadow-sm"
            title="สมุดไดอารี่ & อัลบั้มภาพ"
          >
            <BookOpen size={14} className="shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">ไดอารี่</span>
          </button>

          {/* Social Friends Button */}
          <button
            onClick={() => {
              soundManager.playPop();
              setFriendsOpen(true);
            }}
            className="btn-jelly flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#bde0fe] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32] shrink-0 whitespace-nowrap shadow-sm"
            title="เพื่อนสนิท & แมวใกล้เคียง"
          >
            <Users size={14} className="shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">เพื่อน</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="btn-jelly p-2 rounded-full bg-[#e8f4fc] border-2 border-[#ebd9c8] text-[#523e32] shrink-0"
            title={isFullscreen ? 'ย่อจอ' : 'เต็มจอ'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Time Switcher */}
          <button
            onClick={cycleTimeOfDay}
            className="btn-jelly flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-[#ebd9c8] text-xs font-fredoka font-bold text-[#523e32] shrink-0 whitespace-nowrap"
            title="เปลี่ยนช่วงเวลา"
          >
            {getTimeIcon()}
            <span className="font-itim whitespace-nowrap hidden lg:inline">{getTimeLabel()}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleSound();
              soundManager.setMuted(isSoundEnabled);
            }}
            className="btn-jelly p-2 rounded-full bg-white border-2 border-[#ebd9c8] text-[#523e32] shrink-0"
            title={isSoundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
          >
            {isSoundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-red-400" />}
          </button>

          {/* Photo Mode Button */}
          <button
            onClick={() => {
              soundManager.playPop();
              setPhotoMode(true);
            }}
            className="btn-jelly flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#bde0fe] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32] shrink-0 whitespace-nowrap"
          >
            <Camera size={14} className="shrink-0" />
            <span className="whitespace-nowrap hidden sm:inline">ถ่ายรูป</span>
          </button>

          {/* Cat Customizer Studio */}
          <button
            onClick={() => {
              soundManager.playPop();
              setCustomizerOpen(true);
            }}
            className="btn-jelly flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffcad4] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32] shadow-sm shrink-0 whitespace-nowrap"
          >
            <Palette size={14} className="shrink-0" />
            <span className="whitespace-nowrap">แต่งตัว</span>
          </button>

          {/* Passport Profile Button */}
          <button
            onClick={() => {
              soundManager.playPurr();
              setProfileOpen(true);
            }}
            className="btn-jelly flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffe5a3] border-2 border-[#523e32] text-xs font-fredoka font-bold text-[#523e32] shrink-0 whitespace-nowrap"
          >
            <User size={14} className="shrink-0" />
            <span className="whitespace-nowrap">พาสปอร์ต</span>
          </button>
        </div>
      </div>
    </header>
  );
};
