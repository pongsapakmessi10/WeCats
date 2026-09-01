'use client';

import React from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { ZoomIn, ZoomOut, Maximize, Compass } from 'lucide-react';

export const CameraZoomButton: React.FC = () => {
  const cameraZoomMode = useCatStore((state) => state.cameraZoomMode);
  const toggleCameraZoom = useCatStore((state) => state.toggleCameraZoom);
  const isMobileDrawerOpen = useCatStore((state) => state.isMobileDrawerOpen);

  const isClose = cameraZoomMode === 'close';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    toggleCameraZoom();
  };

  return (
    <div
      className={`fixed left-4 bottom-48 z-40 select-none pointer-events-auto transition-all duration-300 ${
        isMobileDrawerOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
      }`}
    >
      <button
        onClick={handleClick}
        className={`btn-jelly w-11 h-11 rounded-2xl border-2 border-[#523e32] shadow-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
          isClose
            ? 'bg-[#ffe5a3] text-[#523e32] hover:bg-[#ffd166]'
            : 'bg-white/95 text-[#523e32] hover:bg-[#fbf7f0]'
        }`}
        title={isClose ? 'แตะเพื่อซูมออก (มุมมองกว้าง 🗺️)' : 'แตะเพื่อซูมเข้า (มุมมองใกล้ชิด 🔍)'}
      >
        {isClose ? (
          <>
            <ZoomOut size={18} className="stroke-[2.5]" />
            <span className="text-[8px] font-fredoka font-bold leading-none mt-0.5">กว้าง</span>
          </>
        ) : (
          <>
            <ZoomIn size={18} className="stroke-[2.5]" />
            <span className="text-[8px] font-fredoka font-bold leading-none mt-0.5">2.7x</span>
          </>
        )}
      </button>
    </div>
  );
};
