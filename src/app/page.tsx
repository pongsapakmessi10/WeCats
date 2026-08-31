'use client';

import React, { useState, useEffect } from 'react';
import { TopNavBar } from '@/components/hud/TopNavBar';
import { BiologyStatsBar } from '@/components/hud/BiologyStatsBar';
import { GameCanvas } from '@/game/world/GameCanvas';
import { QuickCareDock } from '@/components/hud/QuickCareDock';
import { ChatAndEmoteBox } from '@/components/hud/ChatAndEmoteBox';
import { CatCustomizerModal } from '@/components/creator/CatCustomizerModal';
import { PhotoBoothModal } from '@/components/hud/PhotoBoothModal';
import { CatProfileModal } from '@/components/hud/CatProfileModal';
import { CatShopModal } from '@/components/shop/CatShopModal';
import { CatDiaryModal } from '@/components/diary/CatDiaryModal';
import { FriendListModal } from '@/components/social/FriendListModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { ServerChannelModal } from '@/components/hud/ServerChannelModal';
import { WelcomeTitleScreen } from '@/components/welcome/WelcomeTitleScreen';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [isInGame, setIsInGame] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; isGuest: boolean } | null>(null);

  const setCustomizerOpen = useCatStore((state) => state.setCustomizerOpen);
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);
  const updateCustomization = useCatStore((state) => state.updateCustomization);

  // Check existing session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setIsInGame(true); // Automatically enter game if already authenticated
          if (data.catProfile) {
            updateCustomization({
              name: data.catProfile.name,
              gender: data.catProfile.gender,
              breed: data.catProfile.breed,
              bodyType: data.catProfile.bodyType,
              earType: data.catProfile.earType,
              tailType: data.catProfile.tailType,
              eyeType: data.catProfile.eyeType,
              eyeColorLeft: data.catProfile.eyeColorLeft,
              eyeColorRight: data.catProfile.eyeColorRight,
              baseColor: data.catProfile.baseColor,
              patternType: data.catProfile.patternType,
              patternColor: data.catProfile.patternColor,
              snoutColor: data.catProfile.snoutColor,
              pawColor: data.catProfile.pawColor,
              bellyColor: data.catProfile.bellyColor,
              accessoryHead: data.catProfile.accessoryHead,
              accessoryNeck: data.catProfile.accessoryNeck,
              accessoryBack: data.catProfile.accessoryBack,
              accessoryFace: data.catProfile.accessoryFace,
              aura: data.catProfile.aura,
              personality: data.catProfile.personality,
            });
          }
        }
      })
      .catch(() => {});
  }, [updateCustomization]);

  // Periodic Auto-Save Cat Data to Backend (every 15 seconds if logged in)
  useEffect(() => {
    if (!currentUser || !isInGame) return;
    const saveInterval = setInterval(() => {
      fetch('/api/cat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customization: myCat, stats }),
      }).catch(() => {});
    }, 15000);

    return () => clearInterval(saveInterval);
  }, [currentUser, isInGame, myCat, stats]);

  const handleLogout = async () => {
    soundManager.playPop();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setIsInGame(false); // Return to grand Title Screen
      useCatStore.getState().setNotification('ออกจากระบบเรียบร้อยแล้ว 🐾');
    } catch {}
  };

  const handleQuickPlayGuest = async () => {
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setIsInGame(true);
        useCatStore.getState().setNotification(`ยินดีต้อนรับ ${data.user.username} สู่ WeCats Plaza! 🌸`);
      }
    } catch {
      setIsInGame(true);
    }
  };

  const handleFirstTimeOnboarding = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    setIsInGame(true);
    setCustomizerOpen(true);
  };

  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-[#b7e4c7]">
      
      {/* 1. GRAND WELCOME TITLE SCREEN (Shows if user hasn't entered game yet) */}
      {!isInGame && (
        <WelcomeTitleScreen
          onEnterCustomizer={() => {
            setIsInGame(true);
            setCustomizerOpen(true);
          }}
          onQuickPlay={handleQuickPlayGuest}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenChannels={() => setIsChannelsOpen(true)}
        />
      )}

      {/* 2. EDGE-TO-EDGE FULLSCREEN 2D WORLD CANVAS */}
      <div className="absolute inset-0 w-full h-full z-0">
        <GameCanvas onOpenCustomizer={() => setCustomizerOpen(true)} />
      </div>

      {/* 3. FLOATING TOP HUD */}
      {isInGame && (
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 z-30 pointer-events-none flex flex-col gap-2.5 items-center animate-in fade-in">
          <div className="w-full max-w-[96vw]">
            <TopNavBar
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenChannels={() => setIsChannelsOpen(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
          <div className="w-full max-w-4xl flex justify-center">
            <BiologyStatsBar />
          </div>
        </div>
      )}

      {/* 4. FLOATING BOTTOM HUD */}
      {isInGame && (
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-30 pointer-events-none flex items-end justify-between gap-4 max-w-[96vw] mx-auto animate-in fade-in">
          {/* Left: Chat & Emotes */}
          <div className="pointer-events-auto">
            <ChatAndEmoteBox />
          </div>

          {/* Center: Quick Care Dock */}
          <div className="flex-1 flex justify-center pb-1 pointer-events-auto">
            <QuickCareDock />
          </div>

          {/* Right: Tip Badge */}
          <div className="hidden lg:flex flex-col items-end gap-1 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-[#ebd9c8] shadow-lg flex flex-col items-end">
              <span className="font-fredoka font-bold text-xs text-[#523e32]">💡 ทริคทาสแมว</span>
              <span className="font-itim text-[11px] text-[#8d7568]">
                กดสลับห้องที่แถบด้านบน เพื่อเล่นในสวนซากุระ หรือสร้างห้องส่วนตัวใส่รหัส PIN 🌸
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODALS & OVERLAYS */}
      <CatCustomizerModal />
      <PhotoBoothModal />
      <CatProfileModal />
      <CatShopModal />
      <CatDiaryModal />
      <FriendListModal />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
              if (data.user) {
                setCurrentUser(data.user);
                setIsInGame(true);
              }
            })
            .catch(() => {});
        }}
        onSuccessFirstTime={handleFirstTimeOnboarding}
      />
      
      <ServerChannelModal
        isOpen={isChannelsOpen}
        onClose={() => setIsChannelsOpen(false)}
      />

    </main>
  );
}
