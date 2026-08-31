'use client';

import React from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { DoorOpen, Sparkles } from 'lucide-react';
import { SakuraBlossomIcon } from '@/components/ui/GameIcons';

export const RoomDeletedModal: React.FC = () => {
  const roomDeletedModal = useCatStore((state) => state.roomDeletedModal);
  const setRoomDeletedModal = useCatStore((state) => state.setRoomDeletedModal);

  if (!roomDeletedModal.isOpen) return null;

  const handleClose = () => {
    soundManager.playPop();
    setRoomDeletedModal({ isOpen: false, roomName: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm bg-[#fbf7f0] rounded-[32px] border-4 border-[#523e32] shadow-2xl p-6 flex flex-col items-center text-center gap-4">
        
        {/* Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-[#ffcad4] border-3 border-[#523e32] flex items-center justify-center shadow-md animate-bounce">
          <DoorOpen size={30} className="text-[#523e32]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="font-fredoka font-bold text-lg text-[#523e32]">
            ห้องถูกลบแล้ว 🚪
          </h3>
          <p className="font-itim text-sm text-[#8d7568] leading-relaxed">
            ห้องส่วนตัว <span className="font-bold text-[#e76f51]">"{roomDeletedModal.roomName || 'Private Room'}"</span> ได้ถูกหัวหน้าห้องลบเรียบร้อยแล้ว
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#caeedf] border border-[#523e32]/20 text-xs font-itim text-[#2d6a4f]">
            <SakuraBlossomIcon size={14} />
            <span>พาน้องแมวกลับสู่ สวนซากุระ Plaza #1</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleClose}
          className="btn-jelly w-full py-2.5 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] font-fredoka font-bold text-sm border-2 border-[#523e32] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 mt-1"
        >
          <Sparkles size={16} />
          เข้าใจแล้ว วิ่งเล่นต่อเลย! 🐾
        </button>

      </div>
    </div>
  );
};
