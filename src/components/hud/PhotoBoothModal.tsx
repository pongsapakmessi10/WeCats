'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useCatStore } from '@/store/catStore';
import { CatRenderer } from '@/game/renderer/CatRenderer';
import { soundManager } from '@/audio/soundManager';
import confetti from 'canvas-confetti';
import { Camera, Download, X, Heart, Sparkles, BookOpen, Check } from 'lucide-react';

export const PhotoBoothModal: React.FC = () => {
  const isPhotoMode = useCatStore((state) => state.isPhotoMode);
  const setPhotoMode = useCatStore((state) => state.setPhotoMode);
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);
  const savePhoto = useCatStore((state) => state.savePhoto);
  const setNotification = useCatStore((state) => state.setNotification);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [filter, setFilter] = useState<'none' | 'vintage' | 'sakura' | 'sunset'>('sakura');
  const [caption, setCaption] = useState('โมเมนต์น่ารักใน Plaza 🌸');
  const [isSavedToAlbum, setIsSavedToAlbum] = useState(false);

  useEffect(() => {
    if (!isPhotoMode) return;
    setIsSavedToAlbum(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Polaroid Frame
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Inner photo background
    ctx.save();
    ctx.translate(24, 24);
    const pw = canvas.width - 48;
    const ph = canvas.height - 120;

    // Background scenery in polaroid
    ctx.fillStyle = filter === 'sakura' ? '#ffe5ec' : filter === 'sunset' ? '#fde2e4' : '#e2ece9';
    ctx.fillRect(0, 0, pw, ph);

    // Cute decorative flowers/stars
    ctx.font = '24px sans-serif';
    ctx.fillText('🌸', 16, 36);
    ctx.fillText('✨', pw - 40, 40);
    ctx.fillText('💖', pw - 50, ph - 24);
    ctx.fillText('🐾', 20, ph - 20);

    // Render Cat in Center of Photo
    CatRenderer.render({
      ctx,
      custom: myCat,
      stats,
      behavior: 'idle',
      direction: 'down',
      x: pw / 2,
      y: ph / 2 + 30,
      scale: 2.4,
      timeMs: 1000,
      isMoving: false,
      showNameTag: false,
    });

    ctx.restore();

    // Bottom Polaroid Caption
    ctx.font = 'bold 22px Fredoka, sans-serif';
    ctx.fillStyle = '#523e32';
    ctx.textAlign = 'center';
    ctx.fillText(`🐾 ${myCat.name} @ WeCats Plaza`, canvas.width / 2, canvas.height - 55);

    ctx.font = '14px Itim, sans-serif';
    ctx.fillStyle = '#8d7568';
    ctx.fillText(caption, canvas.width / 2, canvas.height - 30);
  }, [isPhotoMode, myCat, stats, filter, caption]);

  if (!isPhotoMode) return null;

  const handleSaveToAlbum = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundManager.playSparkle();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffe5a3', '#ffcad4', '#bde0fe'],
    });

    savePhoto({
      id: `photo-${Date.now()}`,
      dataUrl: canvas.toDataURL('image/png'),
      caption,
      location: 'Sakura Plaza',
      timestamp: Date.now(),
      filter,
    });

    setIsSavedToAlbum(true);
    setNotification('บันทึกรูปลงอัลบั้มในเกมสำเร็จ! 📸 +15 🐟');
  };

  const handleDownload = () => {
    soundManager.playSparkle();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `wecats-${myCat.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl p-6 flex flex-col items-center gap-4 max-w-lg w-full">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="text-[#523e32]" size={22} />
            <h3 className="font-fredoka font-bold text-lg text-[#523e32]">Photo Booth (โหมดถ่ายรูป)</h3>
          </div>
          <button
            onClick={() => setPhotoMode(false)}
            className="p-1.5 rounded-full hover:bg-[#ebd9c8] text-[#523e32]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Polaroid Canvas */}
        <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-[#ebd9c8]">
          <canvas ref={canvasRef} width={380} height={460} className="w-full max-w-[340px] h-auto" />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {[
            { id: 'sakura', label: '🌸 ซากุระ' },
            { id: 'sunset', label: '🌅 อาทิตย์อัสดง' },
            { id: 'vintage', label: '🌿 อบอุ่น' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playPop();
                setFilter(item.id as 'sakura' | 'sunset' | 'vintage');
              }}
              className={`btn-jelly px-3 py-1 rounded-full text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                filter === item.id ? 'bg-[#ffcad4]' : 'bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleSaveToAlbum}
            disabled={isSavedToAlbum}
            className={`btn-jelly py-2.5 px-3 rounded-2xl font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 border-2 transition-all ${
              isSavedToAlbum
                ? 'bg-[#caeedf] text-[#2b7a5a] border-[#2b7a5a]/20'
                : 'bg-[#ffe5a3] hover:bg-[#ffd166] text-[#523e32] border-[#523e32] shadow-md'
            }`}
          >
            {isSavedToAlbum ? (
              <>
                <Check size={15} />
                <span>บันทึกลงอัลบั้มแล้ว!</span>
              </>
            ) : (
              <>
                <BookOpen size={15} />
                <span>บันทึกลงอัลบั้มในเกม (+15 🐟)</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="btn-jelly py-2.5 px-3 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] font-fredoka font-bold text-xs border-2 border-[#523e32] flex items-center justify-center gap-1.5 shadow-md"
          >
            <Download size={15} />
            <span>ดาวน์โหลดรูปลงเครื่อง</span>
          </button>
        </div>

      </div>
    </div>
  );
};
