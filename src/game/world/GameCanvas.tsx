'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCatStore, PLAZA_PROPS } from '@/store/catStore';
import { CatRenderer } from '@/game/renderer/CatRenderer';
import { soundManager } from '@/audio/soundManager';
import { InteractiveProp, OnlineCat } from '@/types/game';

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

  // Canvas Dimensions (responsive to window size)
  const [dimensions, setDimensions] = useState({ width: 1400, height: 900 });

  // Local Player State
  const playerPosRef = useRef({ x: 700, y: 480, vx: 0, vy: 0, dir: 'down' as 'up' | 'down' | 'left' | 'right' });
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Laser pointer position for zoomie event
  const laserRef = useRef({ x: 600, y: 560, targetX: 600, targetY: 560, active: false });

  // Floating blossom particles
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

  // Biology Tick (every 3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      tickBiology();
    }, 3000);
    return () => clearInterval(timer);
  }, [tickBiology]);

  // Init particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * (dimensions.width || 1200),
        y: Math.random() * (dimensions.height || 800),
        vx: 0.3 + Math.random() * 0.7,
        vy: 0.5 + Math.random() * 0.8,
        rot: Math.random() * Math.PI * 2,
        size: 4 + Math.random() * 5,
        alpha: 0.4 + Math.random() * 0.5,
      });
    }
    particlesRef.current = particles;
  }, [dimensions.width, dimensions.height]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      keysRef.current[e.key.toLowerCase()] = true;

      // Quick interact with [E] or Space
      if (e.key.toLowerCase() === 'e' || e.code === 'Space') {
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

      // Dynamic center coordinates for scalable world
      const centerX = cw / 2;
      const centerY = ch / 2;

      // 1. Process Player Movement
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
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

      // Dynamic Boundary clamp (fullscreen)
      playerPosRef.current.x = Math.max(40, Math.min(cw - 40, playerPosRef.current.x));
      playerPosRef.current.y = Math.max(80, Math.min(ch - 80, playerPosRef.current.y));

      if (Math.abs(playerPosRef.current.vx) > 5) {
        playerPosRef.current.dir = playerPosRef.current.vx > 0 ? 'right' : 'left';
      } else if (playerPosRef.current.vy < -5) {
        playerPosRef.current.dir = 'up';
      } else if (playerPosRef.current.vy > 5) {
        playerPosRef.current.dir = 'down';
      }

      const isMoving = Math.abs(playerPosRef.current.vx) > 8 || Math.abs(playerPosRef.current.vy) > 8;

      // Compute dynamic responsive positions for plaza props
      const dynamicProps = PLAZA_PROPS.map((p) => {
        let px = centerX;
        let py = centerY;
        if (p.id === 'prop-fountain') {
          px = centerX;
          py = centerY + 30;
        } else if (p.id === 'prop-food') {
          px = centerX - 260;
          py = centerY + 20;
        } else if (p.id === 'prop-scratch') {
          px = centerX + 280;
          py = centerY + 80;
        } else if (p.id === 'prop-tree') {
          px = centerX - 320;
          py = centerY - 140;
        } else if (p.id === 'prop-box') {
          px = centerX - 120;
          py = centerY - 140;
        } else if (p.id === 'prop-sun') {
          px = centerX + 180;
          py = centerY - 150;
        } else if (p.id === 'prop-laser') {
          px = centerX - 50;
          py = centerY + 200;
        }
        return { ...p, x: px, y: py };
      });

      // 2. Check Proximity to Interactive Props
      let nearestProp: InteractiveProp | null = null;
      let minPropDist = 80;
      dynamicProps.forEach((prop) => {
        const dist = Math.hypot(playerPosRef.current.x - prop.x, playerPosRef.current.y - prop.y);
        if (dist < minPropDist) {
          nearestProp = prop;
          minPropDist = dist;
        }
      });
      setActiveNearbyProp(nearestProp);

      // 3. Check Proximity to Other Online Cats
      let nearestCat: OnlineCat | null = null;
      let minCatDist = 90;
      onlineCats.forEach((cat, idx) => {
        // Position online cats relative to screen center
        let cx = centerX + (idx === 0 ? -120 : idx === 1 ? 220 : -200);
        let cy = centerY + (idx === 0 ? 60 : idx === 1 ? -40 : 160);
        if (cat.behavior === 'zoomies') {
          cx += Math.sin(currentTime / 300) * 150;
        }
        const dist = Math.hypot(playerPosRef.current.x - cx, playerPosRef.current.y - cy);
        if (dist < minCatDist) {
          nearestCat = { ...cat, x: cx, y: cy };
          minCatDist = dist;
        }
      });
      setSelectedNearbyCat(nearestCat);

      // 4. Update Laser Pointer Logic
      if (stats.isZooming) {
        laserRef.current.active = true;
        if (Math.hypot(laserRef.current.x - laserRef.current.targetX, laserRef.current.y - laserRef.current.targetY) < 20) {
          laserRef.current.targetX = centerX + (Math.random() - 0.5) * 600;
          laserRef.current.targetY = centerY + (Math.random() - 0.5) * 400;
        }
        laserRef.current.x += (laserRef.current.targetX - laserRef.current.x) * 0.08;
        laserRef.current.y += (laserRef.current.targetY - laserRef.current.y) * 0.08;
      } else {
        laserRef.current.active = false;
      }

      // --- 5. RENDER SCENE ---
      ctx.clearRect(0, 0, cw, ch);

      // 5.1 Fullscreen Stardew-Style Grass & Cobblestone Plaza
      renderEnvironmentGround(ctx, cw, ch, centerX, centerY, currentTime);

      // 5.2 Interactive Props & Furniture
      dynamicProps.forEach((prop) => {
        renderProp(ctx, prop, currentTime);
      });

      // 5.3 Laser Pointer Dot (if active)
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

      // 5.4 Y-SORTED ENTITIES (Depth Sorting)
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

      onlineCats.forEach((oc, idx) => {
        let cx = centerX + (idx === 0 ? -120 : idx === 1 ? 220 : -200);
        let cy = centerY + (idx === 0 ? 60 : idx === 1 ? -40 : 160);
        if (oc.behavior === 'zoomies') {
          cx += Math.sin(currentTime / 300) * 150;
        }
        entities.push({
          type: 'online_cat',
          y: cy,
          x: cx,
          catData: { ...oc, x: cx, y: cy },
          isMoving: oc.behavior === 'walking' || oc.behavior === 'zoomies',
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
            emote: stats.isZooming ? '⚡' : null,
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

      // 5.5 Cherry Blossom Trees & Foreground Foliage across all 4 corners
      renderTreesAndFoliage(ctx, cw, ch);

      // 5.6 Falling Blossom Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += 0.02;
        if (p.y > ch + 20) p.y = -10;
        if (p.x > cw + 20) p.x = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 182, 193, ${p.alpha})`;
        ctx.fill();
        ctx.restore();
      });

      // 5.7 Fullscreen Ambient Lighting Filter
      renderDayNightLighting(ctx, cw, ch, centerX, centerY, timeOfDay);

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [myCat, stats, onlineCats, timeOfDay, interactWithProp, sniffCat, setActiveNearbyProp, setSelectedNearbyCat]);

  // Click on canvas to move or select
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const clickedCat = onlineCats.find((cat, idx) => {
      let cx = centerX + (idx === 0 ? -120 : idx === 1 ? 220 : -200);
      let cy = centerY + (idx === 0 ? 60 : idx === 1 ? -40 : 160);
      return Math.hypot(clickX - cx, clickY - cy) < 45;
    });

    if (clickedCat) {
      soundManager.playMeow(1.1);
      useCatStore.getState().setSelectedNearbyCat(clickedCat);
      return;
    }
  }, [onlineCats]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#b7e4c7]">
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
          <span className="text-3xl">{activeNearbyProp.icon}</span>
          <div>
            <div className="font-fredoka font-bold text-[#523e32] text-sm">{activeNearbyProp.name}</div>
            <div className="font-itim text-xs text-[#8d7568]">{activeNearbyProp.prompt}</div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              interactWithProp(activeNearbyProp);
            }}
            className="btn-jelly bg-[#ffcad4] text-[#523e32] px-5 py-1.5 rounded-full text-xs font-bold font-fredoka border-2 border-[#523e32]"
          >
            กดใช้ [E]
          </button>
        </div>
      )}

      {/* Cat-to-Cat Interaction Prompt */}
      {selectedNearbyCat && !activeNearbyProp && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full border-3 border-[#523e32] shadow-2xl flex items-center gap-4 animate-bounce z-20">
          <span className="text-3xl">🐾</span>
          <div>
            <div className="font-fredoka font-bold text-[#523e32] text-sm">
              อยู่ใกล้ {selectedNearbyCat.customization.name}
            </div>
            <div className="font-itim text-xs text-[#8d7568]">เลือกทักทายหรือเลียขนสานสัมพันธ์</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                soundManager.playMeow(1.2);
                sniffCat(selectedNearbyCat.id);
              }}
              className="btn-jelly bg-[#ffe494] text-[#523e32] px-4 py-1.5 rounded-full text-xs font-bold font-fredoka border-2 border-[#523e32]"
            >
              ดมก้นทักทาย 👃
            </button>
            <button
              onClick={() => {
                soundManager.playPurr();
                allogroomCat(selectedNearbyCat.id);
              }}
              className="btn-jelly bg-[#ffcad4] text-[#523e32] px-4 py-1.5 rounded-full text-xs font-bold font-fredoka border-2 border-[#523e32]"
            >
              ช่วยเลียขน 💖
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

function renderEnvironmentGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  centerX: number,
  centerY: number,
  t: number
) {
  // 1. Soft Grass Background
  ctx.fillStyle = '#b7e4c7';
  ctx.fillRect(0, 0, w, h);

  // Grass pattern dots
  ctx.fillStyle = '#95d5b2';
  for (let x = 30; x < w; x += 50) {
    for (let y = 30; y < h; y += 50) {
      ctx.beginPath();
      ctx.arc(x + ((y % 100 === 0) ? 25 : 0), y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Central Cobblestone Plaza Circle (Scaled dynamically to viewport)
  ctx.save();
  const plazaRadiusX = Math.min(w * 0.38, 420);
  const plazaRadiusY = Math.min(h * 0.32, 240);

  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 30, plazaRadiusX, plazaRadiusY, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#faedcd';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#d4a373';
  ctx.stroke();

  // Cobblestone stones pattern
  ctx.fillStyle = '#e9d8a6';
  for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
    const rx = centerX + Math.cos(angle) * (plazaRadiusX * 0.7);
    const ry = (centerY + 30) + Math.sin(angle) * (plazaRadiusY * 0.7);
    ctx.beginPath();
    ctx.roundRect(rx - 12, ry - 8, 24, 16, 5);
    ctx.fill();
  }
  ctx.restore();

  // 3. Flower Patches distributed across screen
  const flowers = [
    { x: centerX - 380, y: centerY - 180 },
    { x: centerX - 420, y: centerY + 120 },
    { x: centerX + 380, y: centerY - 150 },
    { x: centerX + 410, y: centerY + 160 },
    { x: centerX - 120, y: centerY + 220 },
    { x: centerX + 180, y: centerY + 210 },
  ];
  flowers.forEach((fl) => {
    ctx.font = '20px sans-serif';
    ctx.fillText('🌸', fl.x, fl.y);
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

function renderTreesAndFoliage(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const trees = [
    { x: 90, y: 110 },
    { x: w - 90, y: 110 },
    { x: 90, y: h - 110 },
    { x: w - 90, y: h - 110 },
  ];

  trees.forEach((tr) => {
    ctx.save();
    ctx.translate(tr.x, tr.y);

    ctx.beginPath();
    ctx.roundRect(-12, 0, 24, 44, 4);
    ctx.fillStyle = '#7f5539';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#523e32';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -25, 44, 0, Math.PI * 2);
    ctx.arc(-26, -15, 32, 0, Math.PI * 2);
    ctx.arc(26, -15, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb5c5';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff8fa3';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-10, -32, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe5ec';
    ctx.fill();

    ctx.restore();
  });
}

function renderDayNightLighting(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  centerX: number,
  centerY: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
) {
  ctx.save();
  if (timeOfDay === 'morning') {
    ctx.fillStyle = 'rgba(255, 183, 140, 0.12)';
    ctx.fillRect(0, 0, w, h);
  } else if (timeOfDay === 'evening') {
    ctx.fillStyle = 'rgba(235, 94, 85, 0.2)';
    ctx.fillRect(0, 0, w, h);
  } else if (timeOfDay === 'night') {
    ctx.fillStyle = 'rgba(26, 32, 64, 0.45)';
    ctx.fillRect(0, 0, w, h);

    const lights = [
      { x: centerX, y: centerY + 30, r: 220 },
      { x: centerX - 320, y: centerY - 140, r: 120 },
      { x: centerX + 280, y: centerY + 80, r: 120 },
    ];
    lights.forEach((lt) => {
      const grad = ctx.createRadialGradient(lt.x, lt.y, 10, lt.x, lt.y, lt.r);
      grad.addColorStop(0, 'rgba(255, 230, 160, 0.35)');
      grad.addColorStop(1, 'rgba(255, 230, 160, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lt.x, lt.y, lt.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.restore();
}
