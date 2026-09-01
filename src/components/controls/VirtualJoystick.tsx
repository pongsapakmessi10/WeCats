'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export const VirtualJoystick: React.FC = () => {
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchIdRef = useRef<number | null>(null);
  const maxRadius = 42; // Max movement radius in pixels

  // Detect touch capability
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  const dispatchMove = useCallback((x: number, y: number, isMoving: boolean) => {
    let dir: 'up' | 'down' | 'left' | 'right' = 'down';
    if (Math.abs(x) > Math.abs(y)) {
      dir = x > 0 ? 'right' : 'left';
    } else if (Math.abs(y) > 0.05) {
      dir = y > 0 ? 'down' : 'up';
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('wecats-joystick-move', {
          detail: {
            x,
            y,
            dir,
            isMoving,
          },
        })
      );
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsActive(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsActive(false);
        setKnobPos({ x: 0, y: 0 });
        dispatchMove(0, 0, false);
        break;
      }
    }
  };

  const updateKnob = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxRadius;
      dy = Math.sin(angle) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });

    // Normalized vector [-1, 1]
    const normX = dx / maxRadius;
    const normY = dy / maxRadius;
    const isMoving = Math.hypot(normX, normY) > 0.15;

    dispatchMove(normX, normY, isMoving);
  };

  // Only render on touch-capable devices or mobile/tablet viewports
  return (
    <div
      className={`fixed left-4 bottom-6 z-40 select-none touch-none pointer-events-auto transition-opacity duration-300 ${
        isTouchDevice ? 'opacity-100' : 'opacity-80 lg:hidden'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Outer Ring */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`w-28 h-28 rounded-full border-4 border-[#523e32] bg-[#fff8eb]/85 backdrop-blur-md shadow-xl flex items-center justify-center relative transition-transform ${
          isActive ? 'scale-105 border-[#ff9bb2]' : 'hover:scale-100'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Subtle Direction Crosshairs */}
        <div className="absolute w-full h-[1px] bg-[#ebd9c8] pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-[#ebd9c8] pointer-events-none" />

        {/* Outer Direction Arrows */}
        <div className="absolute top-1.5 text-[10px] text-[#8d7568] font-bold font-fredoka pointer-events-none">▲</div>
        <div className="absolute bottom-1.5 text-[10px] text-[#8d7568] font-bold font-fredoka pointer-events-none">▼</div>
        <div className="absolute left-1.5 text-[10px] text-[#8d7568] font-bold font-fredoka pointer-events-none">◀</div>
        <div className="absolute right-1.5 text-[10px] text-[#8d7568] font-bold font-fredoka pointer-events-none">▶</div>

        {/* Joystick Paw Knob */}
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ffCAD4] to-[#f3a6b5] border-3 border-[#523e32] shadow-md flex items-center justify-center transition-transform duration-75 ease-out cursor-grab active:cursor-grabbing pointer-events-none"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          {/* Cat Paw Icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 10.5C9.2 10.5 7.5 12.8 7.5 15.5C7.5 18 9.5 20 12 20C14.5 20 16.5 18 16.5 15.5C16.5 12.8 14.8 10.5 12 10.5Z"
              fill="#523e32"
            />
            <ellipse cx="6.5" cy="10" rx="2" ry="2.8" fill="#523e32" />
            <ellipse cx="10" cy="6.8" rx="2.2" ry="3" fill="#523e32" />
            <ellipse cx="14" cy="6.8" rx="2.2" ry="3" fill="#523e32" />
            <ellipse cx="17.5" cy="10" rx="2" ry="2.8" fill="#523e32" />
          </svg>
        </div>
      </div>
    </div>
  );
};
