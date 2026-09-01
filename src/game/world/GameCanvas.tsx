'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCatStore } from '@/store/catStore';
import { CatRenderer } from '@/game/renderer/CatRenderer';
import { soundManager } from '@/audio/soundManager';
import { InteractiveProp, OnlineCat, CondoCustomization, DEFAULT_CONDO, RoomData } from '@/types/game';
import { useMultiplayer } from '@/game/multiplayer/useMultiplayer';
import {
  CatPawIcon,
  FoodBowlIcon,
  WaterDropIcon,
  ScratchPostIcon,
  SunshineSunIcon,
  AmacatBoxIcon,
  PetHeartIcon,
} from '@/components/ui/GameIcons';
import { UserPlus, DoorOpen, Palette } from 'lucide-react';
import { broadcastCrossTabPos, subscribeCrossTabSync } from '@/game/sync/crossTabSync';

// --- VIRTUAL WORLD CONSTANTS ---
export const WORLD_WIDTH = 2200;
export const WORLD_HEIGHT = 1400;
export const WORLD_CENTER_X = 1100;
export const WORLD_CENTER_Y = 700;

export const CONDO_WIDTH = 1600;
export const CONDO_HEIGHT = 1000;
export const CONDO_CENTER_X = 800;
export const CONDO_CENTER_Y = 500;

// Themed Interactive Props per Room Theme
function getThemedProps(room: RoomData): InteractiveProp[] {
  const theme = room.theme;

  // CONDO INDOOR PROPS
  if (theme === 'condo' || room.type === 'condo') {
    const ownerName = room.ownerName || 'เจ้าของบ้าน';
    return [
      {
        id: 'prop-condo-tower',
        type: 'cat_tree',
        name: 'คอนโดแมว 3 ชั้น 🏰',
        prompt: 'กด [E] ปีนขึ้นไปนอนบนคอนโด (+Comfort & Energy)',
        x: 1240,
        y: 380,
        width: 100,
        height: 120,
        icon: '🏰',
        actionType: 'sleep',
      },
      {
        id: 'prop-condo-sofa',
        type: 'tea_table',
        name: 'โซฟารับแขกปาร์ตี้ 🛋️',
        prompt: 'กด [E] นั่งพักผ่อนบนโซฟานุ่ม (+Happiness 100%)',
        x: 420,
        y: 480,
        width: 130,
        height: 90,
        icon: '🛋️',
        actionType: 'tea',
      },
      {
        id: 'prop-condo-hammock',
        type: 'sun_patch',
        name: 'เปลนอนริมหน้าต่าง 🪟',
        prompt: 'กด [E] นอนอาบแดดมองวิวริมหน้าต่าง (+Energy 100%)',
        x: 800,
        y: 280,
        width: 100,
        height: 70,
        icon: '🪟',
        actionType: 'sleep',
      },
      {
        id: 'prop-condo-toy',
        type: 'laser_pointer',
        name: 'รางลูกบอลไฟกลิ้ง 🧶',
        prompt: 'กด [E] ตะปบลูกบอลไฟกลิ้งวน (+Zoomies Energy)',
        x: 380,
        y: 750,
        width: 75,
        height: 75,
        icon: '🧶',
        actionType: 'laser',
      },
      {
        id: 'prop-condo-box',
        type: 'cardboard_box',
        name: `กล่องส่วนตัวของ ${ownerName} 📦`,
        prompt: 'กด [E] มุดกล่องซ่อนตัว (+Comfort & Privacy)',
        x: 1100,
        y: 760,
        width: 75,
        height: 75,
        icon: '📦',
        actionType: 'box',
      },
      {
        id: 'prop-condo-door',
        type: 'water_fountain',
        name: 'ประตูกระจกระเบียงสู่ Plaza 🚪',
        prompt: 'กด [E] ก้าวออกสู่สวนซากุระ Plaza #1 🌸',
        x: 1400,
        y: 760,
        width: 120,
        height: 90,
        icon: '🚪',
        actionType: 'exit_condo',
      },
      {
        id: 'prop-condo-food',
        type: 'food_bowl',
        name: 'ถาดแซลมอนบุฟเฟ่ต์ในบ้าน 🍣',
        prompt: 'กด [E] ทานแซลมอนสดใหม่ (+Hunger & Coins)',
        x: 980,
        y: 480,
        width: 75,
        height: 75,
        icon: '🍣',
        actionType: 'food',
      },
    ];
  }

  if (theme === 'moonlight') {
    return [
      {
        id: 'prop-moon-telescope',
        type: 'telescope',
        name: 'กล้องโทรทรรศน์ดูดาวโบราณ 🔭',
        prompt: 'กด [E] ส่องดูดวงดาวและดาวตก (+Affection & Coins)',
        x: 1100,
        y: 420,
        width: 90,
        height: 90,
        icon: '🔭',
        actionType: 'telescope',
      },
      {
        id: 'prop-moon-gramophone',
        type: 'gramophone',
        name: 'เครื่องเล่นแผ่นเสียง Lofi 🎵',
        prompt: 'กด [E] ฟังเพลง Lofi คลาสสิก (+Happiness 100%)',
        x: 480,
        y: 680,
        width: 80,
        height: 80,
        icon: '🎵',
        actionType: 'gramophone',
      },
      {
        id: 'prop-moon-campfire',
        type: 'campfire',
        name: 'กองไฟแคมป์ไฟร์แสงดาว 🔥',
        prompt: 'กด [E] ผิงไฟอุ่นๆ ยามค่ำคืน (+Comfort & Coins)',
        x: 1720,
        y: 680,
        width: 85,
        height: 85,
        icon: '🔥',
        actionType: 'campfire',
      },
      {
        id: 'prop-moon-water',
        type: 'water_fountain',
        name: 'สระน้ำสะท้อนเงาพระจันทร์ 🌕',
        prompt: 'กด [E] ดื่มน้ำแร่แสงจันทร์ (+Hydration & Coins)',
        x: 1100,
        y: 860,
        width: 80,
        height: 80,
        icon: '🌕',
        actionType: 'water',
      },
      {
        id: 'prop-moon-scratch',
        type: 'scratch_post',
        name: 'เสาหินลับเล็บคริสตัล 💎',
        prompt: 'กด [E] ลับเล็บกับหินเรืองแสง (+Hygiene)',
        x: 680,
        y: 1060,
        width: 70,
        height: 90,
        icon: '💎',
        actionType: 'scratch',
      },
      {
        id: 'prop-moon-box',
        type: 'cardboard_box',
        name: 'กล่องนีออนเรืองแสง 📦',
        prompt: 'กด [E] มุดกล่องซ่อนตัวยามค่ำคืน (+Comfort)',
        x: 1520,
        y: 1060,
        width: 70,
        height: 70,
        icon: '📦',
        actionType: 'box',
      },
      {
        id: 'prop-moon-food',
        type: 'food_bowl',
        name: 'ถาดปลาทูทองคำแสงจันทร์ 🐟',
        prompt: 'กด [E] กินปลาทูทองมื้อดึก (+Hunger & Coins)',
        x: 880,
        y: 680,
        width: 75,
        height: 75,
        icon: '🐟',
        actionType: 'food',
      },
    ];
  }

  if (theme === 'sunshine') {
    return [
      {
        id: 'prop-sun-windmill',
        type: 'windmill',
        name: 'กังหันลมไม้ทุ่งหญ้า 🌾',
        prompt: 'กด [E] ยืนรับลมชมกังหันลมหมุน (+Zoomies Energy)',
        x: 1100,
        y: 380,
        width: 100,
        height: 120,
        icon: '🌾',
        actionType: 'windmill',
      },
      {
        id: 'prop-sun-catnip',
        type: 'catnip_patch',
        name: 'แปลงหญ้าแคทนิป & ทานตะวัน 🌻',
        prompt: 'กด [E] ดมแคทนิปสดใหม่ (+Happiness & Coins)',
        x: 480,
        y: 680,
        width: 90,
        height: 90,
        icon: '🌻',
        actionType: 'food',
      },
      {
        id: 'prop-sun-tent',
        type: 'tent',
        name: 'เต็นท์กระโจมแคมป์ปิ้ง ⛺',
        prompt: 'กด [E] นอนพักผ่อนบนกองฟาง (+Energy & Coins)',
        x: 1720,
        y: 680,
        width: 95,
        height: 95,
        icon: '⛺',
        actionType: 'tent',
      },
      {
        id: 'prop-sun-fountain',
        type: 'water_fountain',
        name: 'โอ่งน้ำดื่มดินเผาเย็นฉ่ำ 🏺',
        prompt: 'กด [E] ดื่มน้ำโอ่งดินเผาชื่นใจ (+Hydration)',
        x: 1100,
        y: 840,
        width: 75,
        height: 75,
        icon: '🏺',
        actionType: 'water',
      },
      {
        id: 'prop-sun-grill',
        type: 'food_bowl',
        name: 'เตาปิ้งย่างแซลมอนบาร์บีคิว 🍣',
        prompt: 'กด [E] กินแซลมอนย่างหอมกรุ่น (+Hunger)',
        x: 1500,
        y: 1060,
        width: 75,
        height: 75,
        icon: '🍣',
        actionType: 'food',
      },
      {
        id: 'prop-sun-scratch',
        type: 'scratch_post',
        name: 'เสาลับเล็บขอนไม้คาวบอย 🪵',
        prompt: 'กด [E] ลับเล็บกับขอนไม้อบอุ่น (+Hygiene)',
        x: 700,
        y: 1060,
        width: 70,
        height: 90,
        icon: '🪵',
        actionType: 'scratch',
      },
      {
        id: 'prop-sun-sun',
        type: 'sun_patch',
        name: 'จุดนอนผึ่งพุงรับแดดบ่าย ☀️',
        prompt: 'กด [E] นอนอาบแดดอุ่นสบาย (+Energy Recovery)',
        x: 1100,
        y: 1160,
        width: 130,
        height: 85,
        icon: '☀️',
        actionType: 'sleep',
      },
    ];
  }

  // Default Sakura Theme (Plaza #1)
  return [
    {
      id: 'prop-sakura-fountain',
      type: 'water_fountain',
      name: 'น้ำพุหินอ่อนปลาคาร์ป ⛲',
      prompt: 'กด [E] ดื่มน้ำพุแร่ธรรมชาติ (+Hydration & Coins)',
      x: 1100,
      y: 720,
      width: 85,
      height: 85,
      icon: '⛲',
      actionType: 'water',
    },
    {
      id: 'prop-sakura-koi',
      type: 'fish_pond',
      name: 'บ่อปลาคาร์ป & สะพานไม้แดง 🐟',
      prompt: 'กด [E] ให้อาหารปลาคาร์ปญี่ปุ่น (+Affection & Coins)',
      x: 480,
      y: 440,
      width: 95,
      height: 95,
      icon: '🐟',
      actionType: 'koi',
    },
    {
      id: 'prop-sakura-tea',
      type: 'tea_table',
      name: 'ซุ้มเสื่อปิกนิก & ดังโงะ 3 สี 🍡',
      prompt: 'กด [E] กินดังโงะและจิบชาเขียวมัทฉะ (+Hunger & Happiness)',
      x: 1720,
      y: 440,
      width: 90,
      height: 90,
      icon: '🍡',
      actionType: 'tea',
    },
    {
      id: 'prop-sakura-tree',
      type: 'cat_tree',
      name: 'คอนโดแมวไม้ไผ่ทรงปราสาท 🏰',
      prompt: 'กด [E] ปีนขึ้นไปนอนชมวิวมุมสูง (+Comfort & Coins)',
      x: 1850,
      y: 620,
      width: 85,
      height: 100,
      icon: '🏰',
      actionType: 'box',
    },
    {
      id: 'prop-sakura-scratch',
      type: 'scratch_post',
      name: 'เสาลับเล็บเชือกป่าน 🪵',
      prompt: 'กด [E] ลับเล็บสุดมันส์ (+Happiness & Hygiene)',
      x: 1520,
      y: 960,
      width: 70,
      height: 90,
      icon: '🪵',
      actionType: 'scratch',
    },
    {
      id: 'prop-sakura-box',
      type: 'cardboard_box',
      name: 'กล่องพัสดุลับซากุระ 📦',
      prompt: 'กด [E] มุดกล่องซ่อนตัว (+Comfort)',
      x: 680,
      y: 980,
      width: 70,
      height: 70,
      icon: '📦',
      actionType: 'box',
    },
    {
      id: 'prop-sakura-sun',
      type: 'sun_patch',
      name: 'ลานแดดอุ่นชมดอกไม้ ☀️',
      prompt: 'กด [E] นอนอาบแดดอุ่นสบาย (+Energy Recovery)',
      x: 1100,
      y: 1180,
      width: 130,
      height: 85,
      icon: '☀️',
      actionType: 'sleep',
    },
    {
      id: 'prop-sakura-food',
      type: 'food_bowl',
      name: 'ชามบุฟเฟ่ต์ปลาแซลมอน 🍣',
      prompt: 'กด [E] กินแซลมอนสดใหม่ (+Hunger & Coins)',
      x: 1380,
      y: 720,
      width: 75,
      height: 75,
      icon: '🍣',
      actionType: 'food',
    },
  ];
}

interface GameCanvasProps {
  onOpenCustomizer: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onOpenCustomizer }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store bindings
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);
  const onlineCats = useCatStore((state) => state.onlineCats);
  const timeOfDay = useCatStore((state) => state.timeOfDay);
  const interactWithProp = useCatStore((state) => state.interactWithProp);
  const sniffCat = useCatStore((state) => state.sniffCat);
  const allogroomCat = useCatStore((state) => state.allogroomCat);
  const setSelectedNearbyCat = useCatStore((state) => state.setSelectedNearbyCat);
  const setActiveNearbyProp = useCatStore((state) => state.setActiveNearbyProp);
  const activeNearbyProp = useCatStore((state) => state.activeNearbyProp);
  const selectedNearbyCat = useCatStore((state) => state.selectedNearbyCat);
  const tickBiology = useCatStore((state) => state.tickBiology);
  const myCatChat = useCatStore((state) => state.myCatChat);
  const friends = useCatStore((state) => state.friends);
  const sendFriendRequestToCat = useCatStore((state) => state.sendFriendRequestToCat);
  const setActiveDirectChatFriend = useCatStore((state) => state.setActiveDirectChatFriend);
  const cameraZoomMode = useCatStore((state) => state.cameraZoomMode);
  const setIsCondoCustomizerOpen = useCatStore((state) => state.setIsCondoCustomizerOpen);
  const exitCondoToPlaza = useCatStore((state) => state.exitCondoToPlaza);
  const currentRoom = useCatStore((state) => state.currentRoom);
  const cameraZoomRef = useRef(cameraZoomMode);
  const myCatChatRef = useRef(myCatChat);
  const lastCrossTabSyncRef = useRef<number>(0);

  useEffect(() => {
    cameraZoomRef.current = cameraZoomMode;
  }, [cameraZoomMode]);

  useEffect(() => {
    myCatChatRef.current = myCatChat;
  }, [myCatChat]);

  // Canvas Dimensions (responsive to window size)
  const [dimensions, setDimensions] = useState({ width: 1400, height: 900 });

  const isCondo = currentRoom.theme === 'condo' || currentRoom.type === 'condo';
  const worldW = isCondo ? CONDO_WIDTH : WORLD_WIDTH;
  const worldH = isCondo ? CONDO_HEIGHT : WORLD_HEIGHT;

  // Local Player State
  const playerPosRef = useRef<{ x: number; y: number; vx: number; vy: number; dir: 'up' | 'down' | 'left' | 'right' }>({
    x: isCondo ? 800 : 1100,
    y: isCondo ? 580 : 750,
    vx: 0,
    vy: 0,
    dir: 'down',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wecats_player_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          playerPosRef.current.x = Math.max(80, Math.min(worldW - 80, parsed.x));
          playerPosRef.current.y = Math.max(100, Math.min(worldH - 100, parsed.y));
          playerPosRef.current.dir = parsed.dir || 'down';
        }
      }
    } catch {}
  }, [worldW, worldH]);

  // Listen for Cross-Tab & Cross-Session Real-Time Position Sync
  useEffect(() => {
    const applySync = (data: { x?: number; y?: number; dir?: 'up' | 'down' | 'left' | 'right'; direction?: 'up' | 'down' | 'left' | 'right' }) => {
      const isLocallyPressing = Object.values(keysRef.current).some(Boolean);
      if (!isLocallyPressing && typeof data?.x === 'number' && typeof data?.y === 'number') {
        playerPosRef.current.x = data.x;
        playerPosRef.current.y = data.y;
        const d = data.dir || data.direction;
        if (d) playerPosRef.current.dir = d;
      }
    };

    const unsubscribe = subscribeCrossTabSync((msg) => {
      if (msg.type === 'pos-sync') {
        applySync(msg);
      }
    });

    const handleSelfPosSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) applySync(detail);
    };

    window.addEventListener('wecats-self-pos-sync', handleSelfPosSync);

    return () => {
      unsubscribe();
      window.removeEventListener('wecats-self-pos-sync', handleSelfPosSync);
    };
  }, []);

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const joystickRef = useRef<{ x: number; y: number; isMoving: boolean; dir?: 'up' | 'down' | 'left' | 'right' }>({
    x: 0,
    y: 0,
    isMoving: false,
  });

  // Listen for Touch Virtual Joystick events
  useEffect(() => {
    const handleJoystickMove = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        joystickRef.current = {
          x: detail.x || 0,
          y: detail.y || 0,
          isMoving: !!detail.isMoving,
          dir: detail.dir,
        };
      }
    };

    window.addEventListener('wecats-joystick-move', handleJoystickMove);
    return () => window.removeEventListener('wecats-joystick-move', handleJoystickMove);
  }, []);

  // Ambient floating particles
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; rot: number; size: number; alpha: number; extra?: number }>>([]);

  // Resize listener for true edge-to-edge fullscreen
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setDimensions({ width: w, height: h });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Biology Tick (every 3 seconds) & Position Saver
  useEffect(() => {
    const savePos = () => {
      try {
        localStorage.setItem(
          'wecats_player_pos',
          JSON.stringify({
            x: Math.round(playerPosRef.current.x),
            y: Math.round(playerPosRef.current.y),
            dir: playerPosRef.current.dir,
          })
        );
      } catch {}
    };

    const timer = setInterval(() => {
      tickBiology();
      savePos();
    }, 3000);

    window.addEventListener('beforeunload', savePos);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', savePos);
      savePos();
    };
  }, [tickBiology]);

  // Init particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        vx: (Math.random() - 0.3) * 0.9,
        vy: 0.4 + Math.random() * 0.9,
        rot: Math.random() * Math.PI * 2,
        size: 4 + Math.random() * 6,
        alpha: 0.4 + Math.random() * 0.5,
        extra: Math.random() * 100,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Room & Multiplayer Integration
  const { sendMyPosition } = useMultiplayer(currentRoom.id);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || !e.key) return;

      const key = e.key.toLowerCase();
      keysRef.current[key] = true;

      // Quick interact with [E] or Space
      if (key === 'e' || e.code === 'Space') {
        const prop = useCatStore.getState().activeNearbyProp;
        const cat = useCatStore.getState().selectedNearbyCat;

        if (prop) {
          soundManager.playPop();
          interactWithProp(prop);
        } else if (cat) {
          soundManager.playMeow(1.2);
          sniffCat(cat.id);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.key) return;
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [interactWithProp, sniffCat]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentThemedProps = getThemedProps(currentRoom);
    const inCondo = currentRoom.theme === 'condo' || currentRoom.type === 'condo';
    const activeWorldW = inCondo ? CONDO_WIDTH : WORLD_WIDTH;
    const activeWorldH = inCondo ? CONDO_HEIGHT : WORLD_HEIGHT;

    const renderLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const cw = canvas.width;
      const ch = canvas.height;

      // Calculate Responsive Scaling Matrix with Dynamic Zoom Level
      const isPortrait = ch > cw;
      const isCloseMode = cameraZoomRef.current === 'close';

      const scale = isPortrait
        ? isCloseMode
          ? Math.max(cw / 520, (cw / activeWorldW) * (inCondo ? 2.2 : 2.7))
          : Math.max(cw / 1000, (cw / activeWorldW) * (inCondo ? 1.3 : 1.4))
        : isCloseMode
        ? Math.min(cw / (inCondo ? 1200 : 1350), ch / (inCondo ? 750 : 850)) * 1.35
        : Math.min(cw / activeWorldW, ch / activeWorldH);

      let offsetX = (cw - activeWorldW * scale) / 2;
      let offsetY = (ch - activeWorldH * scale) / 2;

      if (isPortrait || (scale * activeWorldW > cw || scale * activeWorldH > ch)) {
        // Smoothly center camera on the player cat (clamped to world bounds)
        const targetOffsetX = cw / 2 - playerPosRef.current.x * scale;
        const targetOffsetY = ch / 2 - playerPosRef.current.y * scale;

        const minOffsetX = Math.min(0, cw - activeWorldW * scale);
        const maxOffsetX = Math.max(0, (cw - activeWorldW * scale) / 2);
        const minOffsetY = Math.min(0, ch - activeWorldH * scale);
        const maxOffsetY = Math.max(0, (ch - activeWorldH * scale) / 2);

        offsetX = Math.max(minOffsetX, Math.min(maxOffsetX, targetOffsetX));
        offsetY = Math.max(minOffsetY, Math.min(maxOffsetY, targetOffsetY));
      }

      // 1. Process Player Movement
      const keys = keysRef.current;
      const joy = joystickRef.current;

      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      // Combine Keyboard with Touch Joystick
      if (joy.isMoving) {
        dx = joy.x;
        dy = joy.y;
      }

      const isMoving = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;
      const isZooming = stats.isZooming;
      const speed = isZooming ? 320 : 190;

      if (isMoving) {
        const length = Math.hypot(dx, dy);
        const normDx = length > 0 ? dx / length : 0;
        const normDy = length > 0 ? dy / length : 0;

        playerPosRef.current.vx = normDx * speed;
        playerPosRef.current.vy = normDy * speed;

        // Determine cat facing direction
        if (Math.abs(normDx) > Math.abs(normDy)) {
          playerPosRef.current.dir = normDx > 0 ? 'right' : 'left';
        } else if (Math.abs(normDy) > 0.05) {
          playerPosRef.current.dir = normDy > 0 ? 'down' : 'up';
        }
      } else {
        playerPosRef.current.vx = 0;
        playerPosRef.current.vy = 0;
      }

      // Update position with World Boundaries Collision
      playerPosRef.current.x += playerPosRef.current.vx * dt;
      playerPosRef.current.y += playerPosRef.current.vy * dt;

      const minX = inCondo ? 80 : 70;
      const maxX = inCondo ? CONDO_WIDTH - 80 : WORLD_WIDTH - 70;
      const minY = inCondo ? 220 : 90;
      const maxY = inCondo ? CONDO_HEIGHT - 60 : WORLD_HEIGHT - 90;

      playerPosRef.current.x = Math.max(minX, Math.min(maxX, playerPosRef.current.x));
      playerPosRef.current.y = Math.max(minY, Math.min(maxY, playerPosRef.current.y));

      // Broadcast Movement to P2P Peers
      sendMyPosition(
        playerPosRef.current.x,
        playerPosRef.current.y,
        playerPosRef.current.dir,
        isMoving,
        isZooming ? 'zoomies' : isMoving ? 'walking' : 'idle'
      );

      // Broadcast position to other tabs for immediate sync (throttled at 80ms)
      if (isMoving) {
        if (currentTime - lastCrossTabSyncRef.current >= 80) {
          lastCrossTabSyncRef.current = currentTime;
          broadcastCrossTabPos(playerPosRef.current.x, playerPosRef.current.y, playerPosRef.current.dir, isMoving);
        }
      }

      // 2. Proximity Detection for Props
      let closestProp: InteractiveProp | null = null;
      let minPropDist = 85;

      currentThemedProps.forEach((prop) => {
        const dist = Math.hypot(playerPosRef.current.x - prop.x, playerPosRef.current.y - prop.y);
        if (dist < minPropDist) {
          minPropDist = dist;
          closestProp = prop;
        }
      });
      setActiveNearbyProp(closestProp);

      // 3. Proximity Detection for Other Online Cats
      let closestCat: OnlineCat | null = null;
      let minCatDist = 95;

      onlineCats.forEach((cat) => {
        const dist = Math.hypot(playerPosRef.current.x - cat.x, playerPosRef.current.y - cat.y);
        if (dist < minCatDist) {
          minCatDist = dist;
          closestCat = cat;
        }
      });
      setSelectedNearbyCat(closestCat);

      // --- 4. RENDER GRAPHICS PIPELINE ---
      ctx.clearRect(0, 0, cw, ch);

      // 4.1 Base Background
      if (inCondo) {
        ctx.fillStyle = '#2b1b17';
        ctx.fillRect(0, 0, cw, ch);
      } else {
        renderBackgroundGrass(ctx, cw, ch, currentRoom.theme as any);
      }

      // 4.2 Apply World-Space Transformation Matrix
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      if (inCondo) {
        // Render Full Indoor Condo Room
        renderCondoRoom(ctx, currentRoom.condoConfig || DEFAULT_CONDO, currentRoom.ownerName || 'น้องแมว', currentTime);
      } else {
        // Render Outdoor Plaza Cobblestone & Zones
        renderPlazaCobblestone(ctx, currentRoom.theme as any, currentTime);
        renderThemedZoneDecor(ctx, currentRoom.theme as any, currentTime);
      }

      // 5.2 Render Props
      currentThemedProps.forEach((prop) => {
        if (!inCondo) {
          renderProp(ctx, prop, currentTime, currentRoom.theme);
        }
      });

      // 5.4 Gather and Y-Sort all Dynamic Entities
      interface RenderEntity {
        y: number;
        type: 'prop' | 'self' | 'peer';
        propData?: InteractiveProp;
        catData?: any;
        isMoving?: boolean;
      }

      const entities: RenderEntity[] = [];

      // Add self cat
      entities.push({
        y: playerPosRef.current.y,
        type: 'self',
        isMoving,
      });

      // Add remote online cats
      onlineCats.forEach((oc) => {
        entities.push({
          y: oc.y,
          type: 'peer',
          catData: oc,
          isMoving: oc.isMoving || false,
        });
      });

      // Y-Sorting for true 2.5D depth
      entities.sort((a, b) => a.y - b.y);

      // 5.5 Render Entities in Depth Order
      entities.forEach((entity) => {
        if (entity.type === 'self') {
          CatRenderer.render({
            ctx,
            custom: myCat,
            stats,
            behavior: isZooming ? 'zoomies' : isMoving ? 'walking' : 'idle',
            direction: playerPosRef.current.dir,
            x: playerPosRef.current.x,
            y: playerPosRef.current.y,
            scale: inCondo ? 1.35 : 1.25,
            timeMs: currentTime,
            isMoving,
            showNameTag: true,
            emote: myCatChatRef.current.emote,
            chatMessage: myCatChatRef.current.text,
          });
        } else {
          const oc = entity.catData as OnlineCat;
          CatRenderer.render({
            ctx,
            custom: oc.customization,
            stats: oc.stats,
            behavior: oc.behavior,
            direction: oc.direction,
            x: oc.x,
            y: oc.y,
            scale: inCondo ? 1.35 : 1.25,
            timeMs: currentTime,
            isMoving: entity.isMoving,
            showNameTag: true,
            emote: oc.currentEmote,
            chatMessage: oc.chatMessage,
          });
        }
      });

      if (!inCondo) {
        // 5.6 Render Foreground Foliage and Trees
        renderTreesAndFoliage(ctx, currentRoom.theme as any);

        // 5.7 Themed Falling Particles & Weather Animations
        renderThemedAmbientParticles(ctx, particlesRef.current, currentRoom.theme as any, currentTime);

        // 5.8 Day / Night Atmosphere Lighting Overlay
        renderDayNightLighting(ctx, timeOfDay, currentRoom.theme as any);
      }

      ctx.restore(); // Restore Screen Transform Matrix

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [myCat, stats, onlineCats, timeOfDay, currentRoom, interactWithProp, sniffCat, setActiveNearbyProp, setSelectedNearbyCat, sendMyPosition]);

  // Click on canvas to select cat / edit self
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const cw = canvas.width;
    const ch = canvas.height;
    const isPortrait = ch > cw;
    const isCloseMode = cameraZoomRef.current === 'close';
    const inCondo = currentRoom.theme === 'condo' || currentRoom.type === 'condo';
    const activeWorldW = inCondo ? CONDO_WIDTH : WORLD_WIDTH;
    const activeWorldH = inCondo ? CONDO_HEIGHT : WORLD_HEIGHT;

    const scale = isPortrait
      ? isCloseMode
        ? Math.max(cw / 520, (cw / activeWorldW) * (inCondo ? 2.2 : 2.7))
        : Math.max(cw / 1000, (cw / activeWorldW) * (inCondo ? 1.3 : 1.4))
      : isCloseMode
      ? Math.min(cw / (inCondo ? 1200 : 1350), ch / (inCondo ? 750 : 850)) * 1.35
      : Math.min(cw / activeWorldW, ch / activeWorldH);

    let offsetX = (cw - activeWorldW * scale) / 2;
    let offsetY = (ch - activeWorldH * scale) / 2;

    if (isPortrait || (scale * activeWorldW > cw || scale * activeWorldH > ch)) {
      const targetOffsetX = cw / 2 - playerPosRef.current.x * scale;
      const targetOffsetY = ch / 2 - playerPosRef.current.y * scale;

      const minOffsetX = Math.min(0, cw - activeWorldW * scale);
      const maxOffsetX = Math.max(0, (cw - activeWorldW * scale) / 2);
      const minOffsetY = Math.min(0, ch - activeWorldH * scale);
      const maxOffsetY = Math.max(0, (ch - activeWorldH * scale) / 2);

      offsetX = Math.max(minOffsetX, Math.min(maxOffsetX, targetOffsetX));
      offsetY = Math.max(minOffsetY, Math.min(maxOffsetY, targetOffsetY));
    }

    const screenX = (e.clientX - rect.left) * (cw / rect.width);
    const screenY = (e.clientY - rect.top) * (ch / rect.height);

    const worldX = (screenX - offsetX) / scale;
    const worldY = (screenY - offsetY) / scale;

    // 1. Check click on player's OWN cat
    const distToMe = Math.hypot(worldX - playerPosRef.current.x, worldY - playerPosRef.current.y);
    if (distToMe < 55) {
      soundManager.playMeow(1.2);
      soundManager.playSparkle();
      useCatStore.getState().setCustomizerOpen(true);
      return;
    }

    // 2. Check click on other online cats
    const clickedCat = onlineCats.find((cat) => Math.hypot(worldX - cat.x, worldY - cat.y) < 50);

    if (clickedCat) {
      soundManager.playMeow(1.1);
      useCatStore.getState().setSelectedNearbyCat(clickedCat);
      return;
    }
  }, [onlineCats, currentRoom]);

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden transition-colors duration-700 ${
        isCondo ? 'bg-[#2b1b17]' : currentRoom.theme === 'moonlight' ? 'bg-[#151c2e]' : currentRoom.theme === 'sunshine' ? 'bg-[#d8f3dc]' : 'bg-[#b7e4c7]'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-pointer select-none"
      />

      {/* Proximity Interaction Floating Prompt */}
      {activeNearbyProp && (
        <div className="hidden lg:flex absolute bottom-28 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full border-3 border-[#523e32] shadow-2xl items-center gap-3 animate-bounce z-20">
          <div className="w-10 h-10 rounded-2xl bg-[#fffbf0] border-2 border-[#523e32] flex items-center justify-center shadow-inner shrink-0 text-xl">
            {activeNearbyProp.icon}
          </div>
          <div>
            <div className="font-fredoka font-bold text-[#523e32] text-sm">{activeNearbyProp.name}</div>
            <div className="font-itim text-xs text-[#8d7568]">{activeNearbyProp.prompt}</div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              interactWithProp(activeNearbyProp);
            }}
            className="btn-jelly bg-[#ffcad4] text-[#523e32] px-5 py-1.5 rounded-full text-xs font-bold font-fredoka border-2 border-[#523e32] cursor-pointer"
          >
            กดใช้ [E]
          </button>
        </div>
      )}

      {/* Cat-to-Cat Interaction Prompt */}
      {selectedNearbyCat && !activeNearbyProp && (
        <div className="hidden lg:flex absolute bottom-28 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full border-3 border-[#523e32] shadow-2xl items-center gap-4 animate-bounce z-20">
          <div className="w-10 h-10 rounded-2xl bg-[#caeedf] border-2 border-[#523e32] flex items-center justify-center shadow-inner shrink-0">
            <CatPawIcon size={24} color="#523e32" />
          </div>
          <div>
            <div className="font-fredoka font-bold text-[#523e32] text-sm">
              อยู่ใกล้ {selectedNearbyCat.customization.name}
            </div>
            <div className="font-itim text-xs text-[#8d7568]">ขอเป็นเพื่อน หรือทักทายสานสัมพันธ์</div>
          </div>
          <div className="flex gap-2">
            {friends.some((f) => f.id === selectedNearbyCat.id || f.catName === selectedNearbyCat.customization.name) ? (
              <button
                onClick={() => {
                  soundManager.playPop();
                  const friend = friends.find((f) => f.id === selectedNearbyCat.id || f.catName === selectedNearbyCat.customization.name);
                  if (friend) setActiveDirectChatFriend(friend);
                }}
                className="btn-jelly bg-[#bde0fe] hover:bg-[#a8d4fc] text-[#523e32] px-3.5 py-1.5 rounded-full text-xs font-bold font-fredoka border-2 border-[#523e32] cursor-pointer flex items-center gap-1 shadow-sm"
                title="เปิดแชทส่วนตัว 1-to-1"
              >
                <span>💬 แชทส่วนตัว</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundManager.playSparkle();
                  sendFriendRequestToCat(selectedNearbyCat);
                }}
                className="btn-jelly bg-[#bde0fe] hover:bg-[#a8d4fc] text-[#523e32] px-3.5 py-1.5 rounded-full text-xs font-bold font-fredoka border-2 border-[#523e32] cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <UserPlus size={13} />
                <span>ขอเป็นเพื่อน</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playMeow(1.2);
                sniffCat(selectedNearbyCat.id);
              }}
              className="btn-jelly bg-[#ffe494] text-[#523e32] px-3.5 py-1.5 rounded-full text-xs font-bold font-fredoka border-2 border-[#523e32] cursor-pointer flex items-center gap-1"
            >
              <CatPawIcon size={14} color="#523e32" />
              <span>ดมก้นทักทาย</span>
            </button>
            <button
              onClick={() => {
                soundManager.playPurr();
                allogroomCat(selectedNearbyCat.id);
              }}
              className="btn-jelly bg-[#ffcad4] text-[#523e32] px-3.5 py-1.5 rounded-full text-xs font-bold font-fredoka border-2 border-[#523e32] cursor-pointer flex items-center gap-1"
            >
              <PetHeartIcon size={14} />
              <span>ช่วยเลียขน</span>
            </button>
          </div>
        </div>
      )}

      {/* WASD Floating Control Hint */}
      <div className="absolute bottom-6 left-6 hidden lg:flex bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-[#ebd9c8] shadow-lg pointer-events-none items-center gap-3">
        <span className="text-lg">🎮</span>
        <span className="font-itim text-xs text-[#523e32]">
          เดินสำรวจด้วย <b>W A S D</b> หรือ <b>ลูกศร</b> | กด <b>[E]</b> หรือ <b>Space</b> เพื่อทำกิจกรรม
        </span>
      </div>
    </div>
  );
};

// --- DELUXE COZY CONDO INDOOR RENDER ENGINE (1600 x 1000) ---

function renderCondoRoom(
  ctx: CanvasRenderingContext2D,
  condo: CondoCustomization,
  ownerName: string,
  t: number
) {
  ctx.save();

  const floorY = 280;

  // 1. FLOOR BASE & PATTERNS
  if (condo.flooring === 'white_wood') {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, floorY, CONDO_WIDTH, CONDO_HEIGHT - floorY);
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 3;
    for (let y = floorY; y < CONDO_HEIGHT; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CONDO_WIDTH, y);
      ctx.stroke();
    }
  } else if (condo.flooring === 'tatami') {
    ctx.fillStyle = '#e9d8a6';
    ctx.fillRect(0, floorY, CONDO_WIDTH, CONDO_HEIGHT - floorY);
    // Tatami woven mats
    ctx.strokeStyle = '#588157';
    ctx.lineWidth = 5;
    for (let x = 0; x < CONDO_WIDTH; x += 200) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, CONDO_HEIGHT);
      ctx.stroke();
    }
    for (let y = floorY; y < CONDO_HEIGHT; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CONDO_WIDTH, y);
      ctx.stroke();
    }
  } else if (condo.flooring === 'pastel_tile') {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, floorY, CONDO_WIDTH, CONDO_HEIGHT - floorY);
    for (let x = 0; x < CONDO_WIDTH; x += 60) {
      for (let y = floorY; y < CONDO_HEIGHT; y += 60) {
        if ((Math.floor(x / 60) + Math.floor(y / 60)) % 2 === 0) {
          ctx.fillStyle = '#bde0fe';
          ctx.fillRect(x, y, 60, 60);
        }
      }
    }
  } else {
    // Warm Oak Herringbone / Parquet
    ctx.fillStyle = '#cb997e';
    ctx.fillRect(0, floorY, CONDO_WIDTH, CONDO_HEIGHT - floorY);
    ctx.strokeStyle = '#b07d62';
    ctx.lineWidth = 2.5;
    for (let y = floorY; y < CONDO_HEIGHT; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CONDO_WIDTH, y);
      ctx.stroke();
    }
  }

  // 2. WALL & WALLPAPER
  if (condo.wallpaper === 'sakura_pink') {
    ctx.fillStyle = '#ffe5ec';
    ctx.fillRect(0, 0, CONDO_WIDTH, floorY);
    // Sakura flower wallpaper prints
    for (let x = 50; x < CONDO_WIDTH; x += 90) {
      for (let y = 40; y < floorY - 30; y += 70) {
        ctx.font = '18px sans-serif';
        ctx.fillText('🌸', x, y);
      }
    }
  } else if (condo.wallpaper === 'midnight_star') {
    ctx.fillStyle = '#14213d';
    ctx.fillRect(0, 0, CONDO_WIDTH, floorY);
    // Golden fairy lights along ceiling
    ctx.strokeStyle = 'rgba(255, 214, 10, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    for (let x = 40; x < CONDO_WIDTH; x += 60) {
      ctx.quadraticCurveTo(x - 30, 45, x, 25);
    }
    ctx.stroke();
    // Star lights
    for (let x = 40; x < CONDO_WIDTH; x += 60) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(x - 30, 36, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (condo.wallpaper === 'wooden_cabin') {
    ctx.fillStyle = '#ddb892';
    ctx.fillRect(0, 0, CONDO_WIDTH, floorY);
    ctx.strokeStyle = '#9c6644';
    ctx.lineWidth = 3.5;
    for (let x = 0; x < CONDO_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, floorY);
      ctx.stroke();
    }
  } else {
    // Cozy Cream Minimal
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, CONDO_WIDTH, floorY);
  }

  // Baseboard Trim & Shadow
  ctx.fillStyle = '#7f5539';
  ctx.fillRect(0, floorY - 16, CONDO_WIDTH, 16);
  ctx.fillStyle = '#523e32';
  ctx.fillRect(0, floorY - 3, CONDO_WIDTH, 4);

  // 3. GRAND FRENCH ARCHED WINDOW (Center at 800, 140)
  const winX = 800;
  const winY = 140;
  const winW = 280;
  const winH = 190;

  // Window Shadow
  ctx.beginPath();
  ctx.roundRect(winX - winW / 2 - 4, winY - winH / 2 - 4, winW + 8, winH + 8, [140, 140, 12, 12]);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(winX - winW / 2, winY - winH / 2, winW, winH, [140, 140, 12, 12]);
  ctx.clip();

  // Window Scenery
  if (condo.windowScenery === 'night_stars') {
    ctx.fillStyle = '#050510';
    ctx.fillRect(winX - winW / 2, winY - winH / 2, winW, winH);
    // Big glowing full moon
    const moonGrad = ctx.createRadialGradient(winX + 60, winY - 30, 5, winX + 60, winY - 30, 40);
    moonGrad.addColorStop(0, '#fffdf0');
    moonGrad.addColorStop(0.6, '#ffd166');
    moonGrad.addColorStop(1, 'rgba(255, 209, 102, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(winX + 60, winY - 30, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffdf0';
    ctx.beginPath();
    ctx.arc(winX + 60, winY - 30, 26, 0, Math.PI * 2);
    ctx.fill();
  } else if (condo.windowScenery === 'sakura_breeze') {
    ctx.fillStyle = '#bde0fe';
    ctx.fillRect(winX - winW / 2, winY - winH / 2, winW, winH);
    // Tree branches
    ctx.strokeStyle = '#7f5539';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(winX - 140, winY - 40);
    ctx.quadraticCurveTo(winX - 60, winY - 20, winX + 10, winY - 50);
    ctx.stroke();
    // Cherry blossoms
    ctx.font = '22px sans-serif';
    ctx.fillText('🌸', winX - 80, winY - 25);
    ctx.fillText('🌸', winX - 20, winY - 45);
    ctx.fillText('🌸', winX + 40, winY - 30);
  } else {
    // Sunny garden meadow
    ctx.fillStyle = '#a2d2ff';
    ctx.fillRect(winX - winW / 2, winY - winH / 2, winW, winH);
    ctx.fillStyle = '#52b788';
    ctx.beginPath();
    ctx.arc(winX, winY + 160, 170, 0, Math.PI * 2);
    ctx.fill();
    // Sun
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(winX - 70, winY - 35, 24, 0, Math.PI * 2);
    ctx.fill();
  }

  // Diagonal Specular Reflection across glass
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.moveTo(winX - winW / 2 + 30, winY + winH / 2);
  ctx.lineTo(winX - winW / 2 + 90, winY + winH / 2);
  ctx.lineTo(winX + winW / 2 - 30, winY - winH / 2);
  ctx.lineTo(winX + winW / 2 - 90, winY - winH / 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // White Wooden French Window Frame Grid
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(winX - winW / 2, winY - winH / 2, winW, winH, [140, 140, 12, 12]);
  ctx.stroke();

  // Window mullions (Inner cross grids)
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(winX, winY - winH / 2 + 10);
  ctx.lineTo(winX, winY + winH / 2);
  ctx.moveTo(winX - winW / 2 + 10, winY);
  ctx.lineTo(winX + winW / 2 - 10, winY);
  ctx.stroke();

  // Draped Pastel Lace Curtains
  ctx.fillStyle = '#ffcad4';
  ctx.beginPath();
  ctx.roundRect(winX - winW / 2 - 25, winY - winH / 2 - 10, 36, winH + 20, 10);
  ctx.roundRect(winX + winW / 2 - 11, winY - winH / 2 - 10, 36, winH + 20, 10);
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. COZY POTTED MONSTERA PLANT (Left Wall at 620, 270)
  const plantX = 600;
  const plantY = 270;
  // Terracotta Pot
  ctx.fillStyle = '#e07a5f';
  ctx.beginPath();
  ctx.moveTo(plantX - 16, plantY + 14);
  ctx.lineTo(plantX + 16, plantY + 14);
  ctx.lineTo(plantX + 12, plantY + 36);
  ctx.lineTo(plantX - 12, plantY + 36);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Green Leaves
  ctx.font = '28px sans-serif';
  ctx.fillText('🪴', plantX - 14, plantY + 16);

  // 5. WARM COZY FLOOR LAMP (Left Corner at 230, 310)
  const lampX = 230;
  const lampY = 310;
  // Soft warm ambient radial glow
  const lampGlow = ctx.createRadialGradient(lampX, lampY - 80, 10, lampX, lampY - 80, 140);
  lampGlow.addColorStop(0, 'rgba(255, 230, 160, 0.35)');
  lampGlow.addColorStop(1, 'rgba(255, 230, 160, 0)');
  ctx.fillStyle = lampGlow;
  ctx.beginPath();
  ctx.arc(lampX, lampY - 80, 140, 0, Math.PI * 2);
  ctx.fill();
  // Brass pole
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(lampX, lampY + 10);
  ctx.lineTo(lampX, lampY - 80);
  ctx.stroke();
  // Lampshade
  ctx.fillStyle = '#faedcd';
  ctx.beginPath();
  ctx.moveTo(lampX - 22, lampY - 60);
  ctx.lineTo(lampX + 22, lampY - 60);
  ctx.lineTo(lampX + 14, lampY - 95);
  ctx.lineTo(lampX - 14, lampY - 95);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 6. GILDED WALL ART PORTRAIT (Right Wall at 1020, 160)
  const picX = 1020;
  const picY = 160;
  ctx.fillStyle = '#fffdf0';
  ctx.beginPath();
  ctx.roundRect(picX - 35, picY - 28, 70, 56, 8);
  ctx.fill();
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.font = '24px sans-serif';
  ctx.fillText('🐱', picX - 12, picY + 8);

  // 7. CENTER RUG
  const rugX = 800;
  const rugY = 620;
  ctx.beginPath();
  ctx.ellipse(rugX, rugY, 240, 140, 0, 0, Math.PI * 2);

  if (condo.rugStyle === 'fluffy_cloud') {
    ctx.fillStyle = '#ffffff';
  } else if (condo.rugStyle === 'boho_pattern') {
    ctx.fillStyle = '#dda15e';
  } else if (condo.rugStyle === 'cream_circle') {
    ctx.fillStyle = '#fff8eb';
  } else {
    // Default paw_pink
    ctx.fillStyle = '#ffcad4';
  }
  ctx.fill();
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = '#523e32';
  ctx.stroke();

  if (condo.rugStyle === 'paw_pink') {
    ctx.fillStyle = '#ff758f';
    ctx.font = '46px sans-serif';
    ctx.fillText('🐾', rugX - 26, rugY + 18);
  }

  // 8. DELUXE PARTY GUEST SOFA (420, 500)
  const sofaX = 420;
  const sofaY = 500;
  const sofaCol =
    condo.sofaColor === 'emerald_green'
      ? '#52b788'
      : condo.sofaColor === 'creamy_latte'
      ? '#e6ccb2'
      : condo.sofaColor === 'denim_blue'
      ? '#4895ef'
      : '#ff758f';

  // Wooden Tapered Legs
  ctx.fillStyle = '#7f5539';
  [
    [-65, 30],
    [65, 30],
    [-60, 5],
    [60, 5],
  ].forEach(([lx, ly]) => {
    ctx.fillRect(sofaX + lx - 4, sofaY + ly, 8, 14);
  });

  // Curved Backrest
  ctx.fillStyle = sofaCol;
  ctx.beginPath();
  ctx.roundRect(sofaX - 78, sofaY - 58, 156, 56, 16);
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Thick Cushion Base
  ctx.beginPath();
  ctx.roundRect(sofaX - 84, sofaY - 14, 168, 44, 12);
  ctx.fill();
  ctx.stroke();

  // Accent Pillows & Knitted Blanket
  ctx.font = '22px sans-serif';
  ctx.fillText('🐾', sofaX - 52, sofaY + 14);
  ctx.fillText('💖', sofaX + 32, sofaY + 14);

  // 9. DELUXE 3-TIER CAT TOWER CASTLE (1240, 420)
  const towerX = 1240;
  const towerY = 420;

  // Sisal scratch rope wound pillars
  ctx.fillStyle = '#ddb892';
  ctx.fillRect(towerX - 16, towerY - 160, 32, 180);
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 3;
  ctx.strokeRect(towerX - 16, towerY - 160, 32, 180);

  // Rope texture stripes
  ctx.strokeStyle = '#b08968';
  ctx.lineWidth = 2;
  for (let ry = towerY - 150; ry < towerY + 10; ry += 10) {
    ctx.beginPath();
    ctx.moveTo(towerX - 14, ry);
    ctx.lineTo(towerX + 14, ry);
    ctx.stroke();
  }

  // Tier Platforms
  const tierColors = condo.catTreeStyle === 'pink_princess' ? ['#ffcad4', '#ffe5ec', '#ffcad4'] : ['#ede0d4', '#e6ccb2', '#ddb892'];
  [-140, -80, -15].forEach((offsetY, idx) => {
    ctx.fillStyle = tierColors[idx];
    ctx.beginPath();
    ctx.roundRect(towerX - 55 + idx * 8, towerY + offsetY, 110 - idx * 8, 20, 8);
    ctx.fill();
    ctx.strokeStyle = '#523e32';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // Hanging Swinging Feather Toy 🪶
  const featherSwing = Math.sin(t / 180) * 14;
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(towerX - 40, towerY - 140);
  ctx.lineTo(towerX - 40 + featherSwing, towerY - 105);
  ctx.stroke();
  ctx.font = '16px sans-serif';
  ctx.fillText('🪶', towerX - 48 + featherSwing, towerY - 95);

  ctx.font = '28px sans-serif';
  ctx.fillText('👑', towerX - 14, towerY - 148);

  // 10. DOUBLE CERAMIC FOOD DISH & WATER FOUNTAIN (980, 500)
  const bowlX = 980;
  const bowlY = 500;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(bowlX, bowlY, 34, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.font = '20px sans-serif';
  ctx.fillText('🍣', bowlX - 10, bowlY + 6);

  // 11. REALISTIC AMACAT PARCEL BOX (1100, 760)
  const boxX = 1100;
  const boxY = 760;
  ctx.fillStyle = '#d4a373';
  ctx.beginPath();
  ctx.roundRect(boxX - 40, boxY - 28, 80, 56, 8);
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Packaging Tape
  ctx.fillStyle = '#faedcd';
  ctx.fillRect(boxX - 40, boxY - 6, 80, 12);
  ctx.fillStyle = '#523e32';
  ctx.font = 'bold 9px Fredoka, sans-serif';
  ctx.fillText('AMACAT PRIME 📦', boxX - 34, boxY + 3);

  // 12. INTERACTIVE BALL TRACK TOY (380, 770)
  const toyX = 380;
  const toyY = 770;
  ctx.beginPath();
  ctx.ellipse(toyX, toyY, 44, 26, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 3;
  ctx.stroke();
  const ballAngle = t / 220;
  ctx.beginPath();
  ctx.arc(toyX + Math.cos(ballAngle) * 26, toyY + Math.sin(ballAngle) * 15, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fb5607';
  ctx.fill();

  // 13. BALCONY PATIO GLASS SLIDING DOORWAY & PLUSH MAT (Right Side at 1400, 760)
  const doorX = 1400;
  const doorY = 760;
  // Patio Glass Sliding Door Frame
  ctx.fillStyle = '#e8f4fc';
  ctx.beginPath();
  ctx.roundRect(doorX - 60, doorY - 45, 120, 90, 8);
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // Glass Panes & Reflection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(doorX - 52, doorY - 38, 48, 76);
  ctx.fillRect(doorX + 4, doorY - 38, 48, 76);
  ctx.strokeStyle = '#bde0fe';
  ctx.lineWidth = 2;
  ctx.strokeRect(doorX - 52, doorY - 38, 48, 76);
  ctx.strokeRect(doorX + 4, doorY - 38, 48, 76);
  // Plush Welcome Doormat
  ctx.fillStyle = '#ffcad4';
  ctx.beginPath();
  ctx.roundRect(doorX - 55, doorY + 34, 110, 22, 6);
  ctx.fill();
  ctx.strokeStyle = '#523e32';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#523e32';
  ctx.font = 'bold 10px Fredoka, sans-serif';
  ctx.fillText('สู่ Plaza #1 🌸', doorX - 32, doorY + 49);

  ctx.restore();
}

// --- ENVIRONMENT RENDER HELPERS (2200 x 1400 World Space) ---

function renderBackgroundGrass(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: 'sakura' | 'sunshine' | 'moonlight' = 'sakura'
) {
  if (theme === 'moonlight') {
    ctx.fillStyle = '#172033';
  } else if (theme === 'sunshine') {
    ctx.fillStyle = '#99c24d';
  } else {
    ctx.fillStyle = '#a7d7b5';
  }
  ctx.fillRect(0, 0, w, h);
}

function renderPlazaCobblestone(
  ctx: CanvasRenderingContext2D,
  theme: 'sakura' | 'sunshine' | 'moonlight' = 'sakura',
  t: number = 0
) {
  ctx.save();

  // 1. Lush Seamless Grass Pattern
  ctx.fillStyle = theme === 'moonlight' ? '#1f2b42' : theme === 'sunshine' ? '#8cb343' : '#94ceaa';
  for (let x = 30; x < WORLD_WIDTH; x += 60) {
    for (let y = 30; y < WORLD_HEIGHT; y += 60) {
      ctx.beginPath();
      ctx.arc(x + ((y % 120 === 0) ? 30 : 0), y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Zone Interconnecting Pathways
  ctx.lineWidth = 48;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = theme === 'moonlight' ? '#273854' : theme === 'sunshine' ? '#ffe5a3' : '#f5ebe0';

  ctx.beginPath();
  ctx.moveTo(480, 680);
  ctx.quadraticCurveTo(800, 720, WORLD_CENTER_X, WORLD_CENTER_Y + 30);
  ctx.moveTo(1720, 680);
  ctx.quadraticCurveTo(1400, 720, WORLD_CENTER_X, WORLD_CENTER_Y + 30);
  ctx.moveTo(1100, 420);
  ctx.lineTo(WORLD_CENTER_X, WORLD_CENTER_Y + 30);
  ctx.moveTo(1100, 1160);
  ctx.lineTo(WORLD_CENTER_X, WORLD_CENTER_Y + 30);
  ctx.stroke();

  // 3. Central Plaza Cobblestone Circle
  const plazaRadiusX = 460;
  const plazaRadiusY = 280;

  ctx.beginPath();
  ctx.ellipse(WORLD_CENTER_X, WORLD_CENTER_Y + 30, plazaRadiusX, plazaRadiusY, 0, 0, Math.PI * 2);

  if (theme === 'moonlight') {
    ctx.fillStyle = '#2c3e5a';
    ctx.strokeStyle = '#48658a';
  } else if (theme === 'sunshine') {
    ctx.fillStyle = '#fff0c2';
    ctx.strokeStyle = '#f4a261';
  } else {
    ctx.fillStyle = '#faedcd';
    ctx.strokeStyle = '#d4a373';
  }

  ctx.fill();
  ctx.lineWidth = 6;
  ctx.stroke();

  // Cobblestone stones pattern ring
  ctx.fillStyle = theme === 'moonlight' ? '#3d5272' : theme === 'sunshine' ? '#ffd166' : '#e9d8a6';
  for (let angle = 0; angle < Math.PI * 2; angle += 0.22) {
    const rx = WORLD_CENTER_X + Math.cos(angle) * (plazaRadiusX * 0.75);
    const ry = (WORLD_CENTER_Y + 30) + Math.sin(angle) * (plazaRadiusY * 0.75);
    ctx.beginPath();
    ctx.roundRect(rx - 14, ry - 10, 28, 20, 6);
    ctx.fill();
  }

  // 4. Peripheral Zone Sub-Plazas
  const subPlazas = [
    { x: 480, y: 680, rx: 160, ry: 110 },
    { x: 1720, y: 680, rx: 160, ry: 110 },
    { x: 1100, y: 420, rx: 150, ry: 100 },
    { x: 1100, y: 1160, rx: 150, ry: 100 },
  ];

  subPlazas.forEach((sp) => {
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y, sp.rx, sp.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'moonlight' ? '#25354e' : theme === 'sunshine' ? '#fde8ab' : '#faebd7';
    ctx.strokeStyle = theme === 'moonlight' ? '#394d6d' : theme === 'sunshine' ? '#e2a35b' : '#d8b48f';
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();
  });

  // 5. Wild Flower Clusters
  const flowers = [
    { x: WORLD_CENTER_X - 580, y: WORLD_CENTER_Y - 260 },
    { x: WORLD_CENTER_X - 620, y: WORLD_CENTER_Y + 220 },
    { x: WORLD_CENTER_X + 580, y: WORLD_CENTER_Y - 260 },
    { x: WORLD_CENTER_X + 620, y: WORLD_CENTER_Y + 280 },
    { x: WORLD_CENTER_X - 220, y: WORLD_CENTER_Y + 340 },
    { x: WORLD_CENTER_X + 260, y: WORLD_CENTER_Y + 330 },
  ];
  const flowerEmoji = theme === 'moonlight' ? '🪻' : theme === 'sunshine' ? '🌻' : '🌸';
  flowers.forEach((fl) => {
    ctx.font = '24px sans-serif';
    ctx.fillText(flowerEmoji, fl.x, fl.y);
  });

  ctx.restore();
}

function renderThemedZoneDecor(
  ctx: CanvasRenderingContext2D,
  theme: 'sakura' | 'sunshine' | 'moonlight',
  t: number
) {
  ctx.save();

  if (theme === 'sakura') {
    // 1. Koi Pond
    const pondX = 480;
    const pondY = 440;
    ctx.beginPath();
    ctx.ellipse(pondX, pondY, 130, 85, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#a2d2ff';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#74c0fc';
    ctx.stroke();

    // Swimming Koi Fish 1
    const fish1Angle = t / 1200;
    const fish1X = pondX + Math.cos(fish1Angle) * 55;
    const fish1Y = pondY + Math.sin(fish1Angle) * 35;
    ctx.save();
    ctx.translate(fish1X, fish1Y);
    ctx.rotate(fish1Angle + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff7b00';
    ctx.fill();
    ctx.restore();

    // Red Japanese Bridge
    ctx.fillStyle = '#d90429';
    ctx.fillRect(pondX - 45, pondY - 12, 90, 24);
    ctx.strokeStyle = '#523e32';
    ctx.lineWidth = 3;
    ctx.strokeRect(pondX - 45, pondY - 12, 90, 24);

    // 2. Torii Gate
    const toriiX = 1100;
    const toriiY = 220;
    ctx.fillStyle = '#c1121f';
    ctx.fillRect(toriiX - 55, toriiY, 14, 70);
    ctx.fillRect(toriiX + 41, toriiY, 14, 70);
    ctx.fillRect(toriiX - 75, toriiY - 6, 150, 14);
    ctx.fillRect(toriiX - 65, toriiY + 14, 130, 10);
    ctx.strokeStyle = '#523e32';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(toriiX - 75, toriiY - 6, 150, 14);

    // 3. Picnic Mat
    const teaX = 1720;
    const teaY = 440;
    ctx.fillStyle = '#dda15e';
    ctx.fillRect(teaX - 60, teaY - 35, 120, 70);
    ctx.strokeStyle = '#606c38';
    ctx.lineWidth = 3;
    ctx.strokeRect(teaX - 60, teaY - 35, 120, 70);
    ctx.font = '24px sans-serif';
    ctx.fillText('🍵', teaX - 25, teaY + 10);
    ctx.fillText('🍡', teaX + 5, teaY + 10);
  } else if (theme === 'sunshine') {
    // Windmill
    const wmX = 1100;
    const wmY = 380;
    ctx.fillStyle = '#b08968';
    ctx.beginPath();
    ctx.moveTo(wmX - 35, wmY + 60);
    ctx.lineTo(wmX - 20, wmY - 40);
    ctx.lineTo(wmX + 20, wmY - 40);
    ctx.lineTo(wmX + 35, wmY + 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#523e32';
    ctx.lineWidth = 3;
    ctx.stroke();

    const bladeAngle = t / 1000;
    ctx.save();
    ctx.translate(wmX, wmY - 40);
    ctx.rotate(bladeAngle);
    for (let b = 0; b < 4; b++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#fdf0d5';
      ctx.fillRect(-6, 0, 12, 60);
      ctx.strokeStyle = '#523e32';
      ctx.lineWidth = 2;
      ctx.strokeRect(-6, 0, 12, 60);
    }
    ctx.restore();

    // Teepee Tent
    const tentX = 1720;
    const tentY = 680;
    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.moveTo(tentX, tentY - 65);
    ctx.lineTo(tentX - 50, tentY + 25);
    ctx.lineTo(tentX + 50, tentY + 25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#523e32';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (theme === 'moonlight') {
    // Telescope
    const telX = 1100;
    const telY = 420;
    ctx.fillStyle = '#d4af37';
    ctx.strokeStyle = '#523e32';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(telX, telY);
    ctx.lineTo(telX - 25, telY + 45);
    ctx.moveTo(telX, telY);
    ctx.lineTo(telX + 25, telY + 45);
    ctx.moveTo(telX, telY);
    ctx.lineTo(telX, telY + 45);
    ctx.stroke();

    // Gramophone
    const gramoX = 480;
    const gramoY = 680;
    ctx.fillStyle = '#7f5539';
    ctx.fillRect(gramoX - 28, gramoY - 5, 56, 30);
    ctx.strokeStyle = '#523e32';
    ctx.lineWidth = 3;
    ctx.strokeRect(gramoX - 28, gramoY - 5, 56, 30);
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.ellipse(gramoX, gramoY - 6, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    const noteBob = Math.sin(t / 300) * 8;
    ctx.font = '22px sans-serif';
    ctx.fillText('🎶', gramoX + 15, gramoY - 25 + noteBob);
  }

  ctx.restore();
}

function renderProp(ctx: CanvasRenderingContext2D, prop: InteractiveProp, t: number, theme: string) {
  ctx.save();
  ctx.translate(prop.x, prop.y);

  // Soft shadow
  ctx.beginPath();
  ctx.ellipse(0, 18, prop.width / 1.8, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(40, 30, 25, 0.2)';
  ctx.fill();

  if (prop.type === 'water_fountain') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 26, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e8f4fc';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#a2d2ff';
    ctx.stroke();
  } else if (prop.type === 'food_bowl') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcad4';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();
    ctx.font = '20px sans-serif';
    ctx.fillText('🍣', -10, -8);
  } else if (prop.type === 'cardboard_box') {
    ctx.beginPath();
    ctx.roundRect(-28, -20, 56, 40, 6);
    ctx.fillStyle = theme === 'moonlight' ? '#3d5a80' : '#d4a373';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.fillStyle = theme === 'moonlight' ? '#98c1d9' : '#523e32';
    ctx.fillText('AMACAT', -20, 11);
  } else if (prop.type === 'scratch_post') {
    ctx.beginPath();
    ctx.roundRect(-8, -44, 16, 52, 4);
    ctx.fillStyle = '#e9d8a6';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();
  }

  ctx.restore();
}

function renderTreesAndFoliage(
  ctx: CanvasRenderingContext2D,
  theme: 'sakura' | 'sunshine' | 'moonlight' = 'sakura'
) {
  const trees = [
    { x: 120, y: 150 },
    { x: WORLD_WIDTH - 120, y: 150 },
    { x: 120, y: WORLD_HEIGHT - 150 },
    { x: WORLD_WIDTH - 120, y: WORLD_HEIGHT - 150 },
  ];

  trees.forEach((tr) => {
    ctx.save();
    ctx.translate(tr.x, tr.y);

    ctx.beginPath();
    ctx.roundRect(-14, 0, 28, 52, 4);
    ctx.fillStyle = theme === 'moonlight' ? '#352b48' : '#7f5539';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -30, 52, 0, Math.PI * 2);
    ctx.arc(-30, -18, 38, 0, Math.PI * 2);
    ctx.arc(30, -18, 38, 0, Math.PI * 2);

    if (theme === 'moonlight') {
      ctx.fillStyle = '#5c4d7d';
      ctx.strokeStyle = '#7b68a6';
    } else if (theme === 'sunshine') {
      ctx.fillStyle = '#52b788';
      ctx.strokeStyle = '#40916c';
    } else {
      ctx.fillStyle = '#ffb5c5';
      ctx.strokeStyle = '#ff8fa3';
    }

    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  });
}

function renderThemedAmbientParticles(
  ctx: CanvasRenderingContext2D,
  particles: Array<{ x: number; y: number; vx: number; vy: number; rot: number; size: number; alpha: number; extra?: number }>,
  theme: 'sakura' | 'sunshine' | 'moonlight',
  t: number
) {
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += 0.02;
    if (p.y > WORLD_HEIGHT + 20) p.y = -10;
    if (p.x > WORLD_WIDTH + 20) p.x = -10;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);

    if (theme === 'moonlight') {
      const glow = (Math.sin(t / 300 + (p.extra || 0)) + 1) / 2;
      ctx.fillStyle = `rgba(255, 235, 120, ${0.4 + glow * 0.5})`;
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 10;
    } else if (theme === 'sunshine') {
      ctx.fillStyle = `rgba(255, 220, 100, ${p.alpha * 0.8})`;
      ctx.shadowColor = '#ffe5a3';
      ctx.shadowBlur = 6;
    } else {
      ctx.fillStyle = `rgba(255, 182, 193, ${p.alpha})`;
    }

    ctx.fill();
    ctx.restore();
  });
}

function renderDayNightLighting(
  ctx: CanvasRenderingContext2D,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
  theme: 'sakura' | 'sunshine' | 'moonlight' = 'sakura'
) {
  ctx.save();

  if (theme === 'moonlight' || timeOfDay === 'night') {
    ctx.fillStyle = 'rgba(15, 20, 42, 0.55)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  } else if (theme === 'sunshine' || timeOfDay === 'afternoon') {
    ctx.fillStyle = 'rgba(255, 240, 180, 0.12)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  } else if (timeOfDay === 'evening') {
    ctx.fillStyle = 'rgba(235, 94, 85, 0.18)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  } else {
    ctx.fillStyle = 'rgba(255, 183, 140, 0.08)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  ctx.restore();
}
