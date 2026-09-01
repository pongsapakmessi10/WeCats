'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCatStore, PLAZA_PROPS } from '@/store/catStore';
import { CatRenderer } from '@/game/renderer/CatRenderer';
import { soundManager } from '@/audio/soundManager';
import { InteractiveProp, OnlineCat } from '@/types/game';
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
import { UserPlus } from 'lucide-react';
import { broadcastCrossTabPos, subscribeCrossTabSync } from '@/game/sync/crossTabSync';

// --- FIXED VIRTUAL WORLD CONSTANTS (Resolution-Independent) ---
export const WORLD_WIDTH = 1400;
export const WORLD_HEIGHT = 900;
export const WORLD_CENTER_X = 700;
export const WORLD_CENTER_Y = 450;

// Standard Fixed Props positioned in World Coordinates
const FIXED_PLAZA_PROPS: InteractiveProp[] = PLAZA_PROPS.map((p) => {
  let px = WORLD_CENTER_X;
  let py = WORLD_CENTER_Y;
  if (p.id === 'prop-fountain') {
    px = WORLD_CENTER_X;
    py = WORLD_CENTER_Y + 30; // (700, 480)
  } else if (p.id === 'prop-food') {
    px = WORLD_CENTER_X - 260; // (440, 470)
    py = WORLD_CENTER_Y + 20;
  } else if (p.id === 'prop-scratch') {
    px = WORLD_CENTER_X + 280; // (980, 530)
    py = WORLD_CENTER_Y + 80;
  } else if (p.id === 'prop-tree') {
    px = WORLD_CENTER_X - 320; // (380, 310)
    py = WORLD_CENTER_Y - 140;
  } else if (p.id === 'prop-box') {
    px = WORLD_CENTER_X - 120; // (580, 310)
    py = WORLD_CENTER_Y - 140;
  } else if (p.id === 'prop-sun') {
    px = WORLD_CENTER_X + 180; // (880, 300)
    py = WORLD_CENTER_Y - 150;
  } else if (p.id === 'prop-laser') {
    px = WORLD_CENTER_X - 50;  // (650, 650)
    py = WORLD_CENTER_Y + 200;
  }
  return { ...p, x: px, y: py };
});

interface GameCanvasProps {
  onOpenCustomizer: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onOpenCustomizer }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRoom = useCatStore((state) => state.currentRoom);
  const { sendMyPosition } = useMultiplayer(currentRoom.id);

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

  // Canvas Dimensions (responsive to window size)
  const [dimensions, setDimensions] = useState({ width: 1400, height: 900 });

  // Local Player State (Restores from localStorage in World Coordinates)
  const playerPosRef = useRef<{ x: number; y: number; vx: number; vy: number; dir: 'up' | 'down' | 'left' | 'right' }>({
    x: 700,
    y: 480,
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
          playerPosRef.current.x = Math.max(50, Math.min(WORLD_WIDTH - 50, parsed.x));
          playerPosRef.current.y = Math.max(80, Math.min(WORLD_HEIGHT - 80, parsed.y));
          playerPosRef.current.dir = parsed.dir || 'down';
        }
      }
    } catch {}
  }, []);

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

  // Laser pointer position for zoomie event
  const laserRef = useRef({ x: 650, y: 650, targetX: 650, targetY: 650, active: false });

  // Floating blossom particles in World Space
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; rot: number; size: number; alpha: number }>>([]);

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

  // Init particles in World Coordinates
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        vx: 0.3 + Math.random() * 0.7,
        vy: 0.5 + Math.random() * 0.8,
        rot: Math.random() * Math.PI * 2,
        size: 4 + Math.random() * 5,
        alpha: 0.4 + Math.random() * 0.5,
      });
    }
    particlesRef.current = particles;
  }, []);

  // Keyboard controls
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

    const renderLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const cw = canvas.width;
      const ch = canvas.height;

      // Calculate Uniform Scaling Matrix to fit/center the fixed virtual world on any screen
      const scale = Math.min(cw / WORLD_WIDTH, ch / WORLD_HEIGHT);
      const offsetX = (cw - WORLD_WIDTH * scale) / 2;
      const offsetY = (ch - WORLD_HEIGHT * scale) / 2;

      // 1. Process Player Movement (in World Coordinates)
      const keys = keysRef.current;
      const joy = joystickRef.current;
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      // Add analog touch joystick input
      if (joy.isMoving) {
        dx += joy.x;
        dy += joy.y;
      }

      if (dx !== 0 && dy !== 0) {
        const mag = Math.hypot(dx, dy);
        if (mag > 1) {
          dx /= mag;
          dy /= mag;
        }
      }

      let baseSpeed = 180;
      if (stats.isZooming) {
        baseSpeed = 380;
      } else if (stats.weightKg > 7.0) {
        baseSpeed = 130;
      }

      playerPosRef.current.vx += (dx * baseSpeed - playerPosRef.current.vx) * 0.15;
      playerPosRef.current.vy += (dy * baseSpeed - playerPosRef.current.vy) * 0.15;

      playerPosRef.current.x += playerPosRef.current.vx * dt;
      playerPosRef.current.y += playerPosRef.current.vy * dt;

      // Fixed World Boundary clamp (50 to 1350, 80 to 820)
      playerPosRef.current.x = Math.max(50, Math.min(WORLD_WIDTH - 50, playerPosRef.current.x));
      playerPosRef.current.y = Math.max(80, Math.min(WORLD_HEIGHT - 80, playerPosRef.current.y));

      if (Math.abs(playerPosRef.current.vx) > 5) {
        playerPosRef.current.dir = playerPosRef.current.vx > 0 ? 'right' : 'left';
      } else if (playerPosRef.current.vy < -5) {
        playerPosRef.current.dir = 'up';
      } else if (playerPosRef.current.vy > 5) {
        playerPosRef.current.dir = 'down';
      }

      const isMoving = Math.abs(playerPosRef.current.vx) > 8 || Math.abs(playerPosRef.current.vy) > 8;

      // Broadcast real-time position in universal World Coordinates to other players
      sendMyPosition(
        Math.round(playerPosRef.current.x),
        Math.round(playerPosRef.current.y),
        playerPosRef.current.dir,
        isMoving,
        stats.isZooming ? 'zoomies' : isMoving ? 'walking' : 'idle'
      );

      // Broadcast position to other tabs of the same account
      if (isMoving || Math.abs(playerPosRef.current.vx) > 0.1 || Math.abs(playerPosRef.current.vy) > 0.1) {
        broadcastCrossTabPos(
          Math.round(playerPosRef.current.x),
          Math.round(playerPosRef.current.y),
          playerPosRef.current.dir,
          isMoving,
          stats.isZooming ? 'zoomies' : isMoving ? 'walking' : 'idle'
        );
      }

      // 2. Check Proximity to Interactive Props (in World Space)
      let nearestProp: InteractiveProp | null = null;
      let minPropDist = 85;
      FIXED_PLAZA_PROPS.forEach((prop) => {
        const dist = Math.hypot(playerPosRef.current.x - prop.x, playerPosRef.current.y - prop.y);
        if (dist < minPropDist) {
          nearestProp = prop;
          minPropDist = dist;
        }
      });
      setActiveNearbyProp(nearestProp);

      // 3. Check Proximity to Other Online Cats (in World Space)
      let nearestCat: OnlineCat | null = null;
      let minCatDist = 90;
      onlineCats.forEach((cat) => {
        const dist = Math.hypot(playerPosRef.current.x - cat.x, playerPosRef.current.y - cat.y);
        if (dist < minCatDist) {
          nearestCat = cat;
          minCatDist = dist;
        }
      });
      setSelectedNearbyCat(nearestCat);

      // 4. Update Laser Pointer Logic (in World Space)
      if (stats.isZooming) {
        laserRef.current.active = true;
        if (Math.hypot(laserRef.current.x - laserRef.current.targetX, laserRef.current.y - laserRef.current.targetY) < 20) {
          laserRef.current.targetX = WORLD_CENTER_X + (Math.random() - 0.5) * 600;
          laserRef.current.targetY = WORLD_CENTER_Y + (Math.random() - 0.5) * 400;
        }
        laserRef.current.x += (laserRef.current.targetX - laserRef.current.x) * 0.08;
        laserRef.current.y += (laserRef.current.targetY - laserRef.current.y) * 0.08;
      } else {
        laserRef.current.active = false;
      }

      // --- 5. RENDER SCENE ---
      ctx.clearRect(0, 0, cw, ch);

      // 5.1 Render Fullscreen Background Grass (Seamless edge-to-edge on entire screen)
      renderBackgroundGrass(ctx, cw, ch, currentRoom.theme);

      // 5.2 Apply Virtual World Matrix Transform (Anchors everything to fixed 1400x900 world)
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // 5.3 Cobblestone Plaza & Flower Patches
      renderPlazaCobblestone(ctx, currentRoom.theme);

      // 5.4 Interactive Props & Furniture (Fixed World Coordinates)
      FIXED_PLAZA_PROPS.forEach((prop) => {
        renderProp(ctx, prop, currentTime);
      });

      // 5.5 Laser Pointer Dot (if active)
      if (laserRef.current.active) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(laserRef.current.x, laserRef.current.y, 6 + Math.sin(currentTime / 80) * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
      }

      // 5.6 Y-SORTED ENTITIES (Depth Sorting in World Space)
      const entities: Array<{
        type: 'player' | 'online_cat';
        y: number;
        catData: OnlineCat | { customization: typeof myCat; stats: typeof stats };
        x: number;
        isMoving: boolean;
        direction: 'up' | 'down' | 'left' | 'right';
      }> = [];

      entities.push({
        type: 'player',
        y: playerPosRef.current.y,
        x: playerPosRef.current.x,
        catData: { customization: myCat, stats },
        isMoving,
        direction: playerPosRef.current.dir,
      });

      onlineCats.forEach((oc) => {
        entities.push({
          type: 'online_cat',
          y: oc.y,
          x: oc.x,
          catData: oc,
          isMoving: oc.isMoving || oc.behavior === 'walking' || oc.behavior === 'zoomies',
          direction: oc.direction,
        });
      });

      entities.sort((a, b) => a.y - b.y);

      entities.forEach((entity) => {
        if (entity.type === 'player') {
          CatRenderer.render({
            ctx,
            custom: myCat,
            stats,
            behavior: stats.isZooming ? 'zoomies' : isMoving ? 'walking' : 'idle',
            direction: entity.direction,
            x: entity.x,
            y: entity.y,
            scale: 1.25,
            timeMs: currentTime,
            isMoving: entity.isMoving,
            showNameTag: true,
            emote: stats.isZooming ? '⚡' : myCatChat.emote,
            chatMessage: myCatChat.text,
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
            scale: 1.2,
            timeMs: currentTime,
            isMoving: entity.isMoving,
            showNameTag: true,
            emote: oc.currentEmote,
            chatMessage: oc.chatMessage,
          });
        }
      });

      // 5.7 Trees & Foreground Foliage (Themed in World Space)
      renderTreesAndFoliage(ctx, currentRoom.theme);

      // 5.8 Falling Floating Particles (Themed in World Space)
      particlesRef.current.forEach((p) => {
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

        if (currentRoom.theme === 'moonlight') {
          ctx.fillStyle = `rgba(162, 210, 255, ${p.alpha * 0.8})`;
          ctx.shadowColor = '#4cc9f0';
          ctx.shadowBlur = 8;
        } else if (currentRoom.theme === 'sunshine') {
          ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha * 0.75})`;
          ctx.shadowColor = '#ffd166';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(255, 182, 193, ${p.alpha})`;
        }

        ctx.fill();
        ctx.restore();
      });

      // 5.9 Fullscreen Ambient Lighting Filter (Themed in World Space)
      renderDayNightLighting(ctx, timeOfDay, currentRoom.theme);

      ctx.restore(); // End World Matrix Transform

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [myCat, stats, onlineCats, timeOfDay, currentRoom, interactWithProp, sniffCat, setActiveNearbyProp, setSelectedNearbyCat, sendMyPosition]);

  // Click on canvas to select cat (Converts Screen Click -> World Space Coordinates)
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.min(cw / WORLD_WIDTH, ch / WORLD_HEIGHT);
    const offsetX = (cw - WORLD_WIDTH * scale) / 2;
    const offsetY = (ch - WORLD_HEIGHT * scale) / 2;

    const screenX = (e.clientX - rect.left) * (cw / rect.width);
    const screenY = (e.clientY - rect.top) * (ch / rect.height);

    const worldX = (screenX - offsetX) / scale;
    const worldY = (screenY - offsetY) / scale;

    // 1. Check click on player's OWN cat
    const distToMe = Math.hypot(worldX - playerPosRef.current.x, worldY - playerPosRef.current.y);
    if (distToMe < 50) {
      soundManager.playMeow(1.2);
      soundManager.playSparkle();
      useCatStore.getState().setCustomizerOpen(true);
      return;
    }

    // 2. Check click on other online cats
    const clickedCat = onlineCats.find((cat) => Math.hypot(worldX - cat.x, worldY - cat.y) < 45);

    if (clickedCat) {
      soundManager.playMeow(1.1);
      useCatStore.getState().setSelectedNearbyCat(clickedCat);
      return;
    }
  }, [onlineCats]);

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden transition-colors duration-700 ${
        currentRoom.theme === 'moonlight' ? 'bg-[#151c2e]' : currentRoom.theme === 'sunshine' ? 'bg-[#d8f3dc]' : 'bg-[#b7e4c7]'
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
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full border-3 border-[#523e32] shadow-2xl flex items-center gap-3 animate-bounce z-20">
          <div className="w-10 h-10 rounded-2xl bg-[#fffbf0] border-2 border-[#523e32] flex items-center justify-center shadow-inner shrink-0">
            {activeNearbyProp.type === 'water_fountain' ? (
              <WaterDropIcon size={24} />
            ) : activeNearbyProp.type === 'food_bowl' ? (
              <FoodBowlIcon size={24} />
            ) : activeNearbyProp.type === 'scratch_post' ? (
              <ScratchPostIcon size={24} />
            ) : activeNearbyProp.type === 'sun_patch' ? (
              <SunshineSunIcon size={24} />
            ) : (
              <AmacatBoxIcon size={24} />
            )}
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
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full border-3 border-[#523e32] shadow-2xl flex items-center gap-4 animate-bounce z-20">
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

// --- ENVIRONMENT RENDER HELPERS ---

function renderBackgroundGrass(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: 'sakura' | 'sunshine' | 'moonlight' = 'sakura'
) {
  // Theme-Specific Grass Colors for full screen
  if (theme === 'moonlight') {
    ctx.fillStyle = '#1b263b';
  } else if (theme === 'sunshine') {
    ctx.fillStyle = '#a7c957';
  } else {
    ctx.fillStyle = '#b7e4c7';
  }
  ctx.fillRect(0, 0, w, h);

  // Seamless Grass pattern dots across screen
  ctx.fillStyle = theme === 'moonlight' ? '#273854' : theme === 'sunshine' ? '#8cb343' : '#95d5b2';
  for (let x = 25; x < w; x += 50) {
    for (let y = 25; y < h; y += 50) {
      ctx.beginPath();
      ctx.arc(x + ((y % 100 === 0) ? 25 : 0), y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderPlazaCobblestone(
  ctx: CanvasRenderingContext2D,
  theme: 'sakura' | 'sunshine' | 'moonlight' = 'sakura'
) {
  // Central Cobblestone Plaza Circle in World Space
  ctx.save();
  const plazaRadiusX = 420;
  const plazaRadiusY = 240;

  ctx.beginPath();
  ctx.ellipse(WORLD_CENTER_X, WORLD_CENTER_Y + 30, plazaRadiusX, plazaRadiusY, 0, 0, Math.PI * 2);

  if (theme === 'moonlight') {
    ctx.fillStyle = '#2c3e5a';
    ctx.strokeStyle = '#48658a';
  } else if (theme === 'sunshine') {
    ctx.fillStyle = '#ffe5a3';
    ctx.strokeStyle = '#f4a261';
  } else {
    ctx.fillStyle = '#faedcd';
    ctx.strokeStyle = '#d4a373';
  }

  ctx.fill();
  ctx.lineWidth = 5;
  ctx.stroke();

  // Cobblestone stones pattern
  ctx.fillStyle = theme === 'moonlight' ? '#3d5272' : theme === 'sunshine' ? '#ffd166' : '#e9d8a6';
  for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
    const rx = WORLD_CENTER_X + Math.cos(angle) * (plazaRadiusX * 0.7);
    const ry = (WORLD_CENTER_Y + 30) + Math.sin(angle) * (plazaRadiusY * 0.7);
    ctx.beginPath();
    ctx.roundRect(rx - 12, ry - 8, 24, 16, 5);
    ctx.fill();
  }
  ctx.restore();

  // Flower Patches in World Space
  const flowers = [
    { x: WORLD_CENTER_X - 380, y: WORLD_CENTER_Y - 180 },
    { x: WORLD_CENTER_X - 420, y: WORLD_CENTER_Y + 120 },
    { x: WORLD_CENTER_X + 380, y: WORLD_CENTER_Y - 150 },
    { x: WORLD_CENTER_X + 410, y: WORLD_CENTER_Y + 160 },
    { x: WORLD_CENTER_X - 120, y: WORLD_CENTER_Y + 220 },
    { x: WORLD_CENTER_X + 180, y: WORLD_CENTER_Y + 210 },
  ];
  const flowerEmoji = theme === 'moonlight' ? '🪻' : theme === 'sunshine' ? '🌻' : '🌸';
  flowers.forEach((fl) => {
    ctx.font = '20px sans-serif';
    ctx.fillText(flowerEmoji, fl.x, fl.y);
  });
}

function renderProp(ctx: CanvasRenderingContext2D, prop: InteractiveProp, t: number) {
  ctx.save();
  ctx.translate(prop.x, prop.y);

  // Soft shadow
  ctx.beginPath();
  ctx.ellipse(0, 18, prop.width / 1.8, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(82, 62, 50, 0.2)';
  ctx.fill();

  if (prop.type === 'water_fountain') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 26, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e8f4fc';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#a2d2ff';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -2, 34, 19, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#bde0fe';
    ctx.fill();

    const waterJet = Math.sin(t / 150) * 5;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.quadraticCurveTo(-8, -32 + waterJet, 0, -38 + waterJet);
    ctx.quadraticCurveTo(8, -32 + waterJet, 0, -4);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#a2d2ff';
    ctx.beginPath();
    ctx.arc(-10, -22 + waterJet, 3, 0, Math.PI * 2);
    ctx.arc(10, -20 + waterJet, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (prop.type === 'food_bowl') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcad4';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -2, 22, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff758f';
    ctx.fill();

    ctx.font = '20px sans-serif';
    ctx.fillText('🐟', -10, -8);
  } else if (prop.type === 'cardboard_box') {
    ctx.beginPath();
    ctx.roundRect(-28, -20, 56, 40, 6);
    ctx.fillStyle = '#d4a373';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();

    ctx.fillStyle = '#b08968';
    ctx.fillRect(-26, -18, 52, 9);

    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.fillStyle = '#523e32';
    ctx.fillText('AMACAT', -20, 11);
  } else if (prop.type === 'scratch_post') {
    ctx.beginPath();
    ctx.roundRect(-8, -44, 16, 52, 4);
    ctx.fillStyle = '#e9d8a6';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 10, 26, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#9c6644';
    ctx.fill();
    ctx.stroke();
  } else if (prop.type === 'cat_tree') {
    ctx.fillStyle = '#ddb892';
    ctx.fillRect(-10, -70, 20, 80);
    ctx.beginPath();
    ctx.roundRect(-42, -24, 84, 14, 6);
    ctx.fillStyle = '#ede0d4';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-30, -75, 60, 14, 6);
    ctx.fillStyle = '#ede0d4';
    ctx.fill();
    ctx.stroke();

    ctx.font = '20px sans-serif';
    ctx.fillText('🏰', -10, -80);
  } else if (prop.type === 'sun_patch') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 56, 32, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 229, 143, 0.5)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '22px sans-serif';
    ctx.fillText('☀️', -11, 8);
  }

  ctx.restore();
}

function renderTreesAndFoliage(
  ctx: CanvasRenderingContext2D,
  theme: 'sakura' | 'sunshine' | 'moonlight' = 'sakura'
) {
  const trees = [
    { x: 90, y: 110 },
    { x: WORLD_WIDTH - 90, y: 110 },
    { x: 90, y: WORLD_HEIGHT - 110 },
    { x: WORLD_WIDTH - 90, y: WORLD_HEIGHT - 110 },
  ];

  trees.forEach((tr) => {
    ctx.save();
    ctx.translate(tr.x, tr.y);

    ctx.beginPath();
    ctx.roundRect(-12, 0, 24, 44, 4);
    ctx.fillStyle = theme === 'moonlight' ? '#352b48' : '#7f5539';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -25, 44, 0, Math.PI * 2);
    ctx.arc(-26, -15, 32, 0, Math.PI * 2);
    ctx.arc(26, -15, 32, 0, Math.PI * 2);

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
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-10, -32, 22, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'moonlight' ? '#8e79b8' : theme === 'sunshine' ? '#74c69d' : '#ffe5ec';
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

    // Warm glowing lanterns in the dark in World Space
    const lights = [
      { x: WORLD_CENTER_X, y: WORLD_CENTER_Y + 30, r: 240 },
      { x: WORLD_CENTER_X - 320, y: WORLD_CENTER_Y - 140, r: 140 },
      { x: WORLD_CENTER_X + 280, y: WORLD_CENTER_Y + 80, r: 140 },
    ];
    lights.forEach((lt) => {
      const grad = ctx.createRadialGradient(lt.x, lt.y, 10, lt.x, lt.y, lt.r);
      grad.addColorStop(0, 'rgba(255, 220, 140, 0.45)');
      grad.addColorStop(1, 'rgba(255, 220, 140, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lt.x, lt.y, lt.r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (theme === 'sunshine' || timeOfDay === 'afternoon') {
    ctx.fillStyle = 'rgba(255, 240, 180, 0.15)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  } else if (timeOfDay === 'evening') {
    ctx.fillStyle = 'rgba(235, 94, 85, 0.2)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  } else {
    ctx.fillStyle = 'rgba(255, 183, 140, 0.1)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  ctx.restore();
}
