'use client';

import React, { useState } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import {
  X,
  TrendingUp,
  Heart,
  Calendar,
  Sparkles,
  Trash2,
  Download,
  Scale,
  MapPin,
} from 'lucide-react';
import {
  DiaryJournalIcon,
  PhotoCameraIcon,
  CatPawIcon,
  FishCoinIcon,
} from '@/components/ui/GameIcons';

export const CatDiaryModal: React.FC = () => {
  const isDiaryOpen = useCatStore((state) => state.isDiaryOpen);
  const setDiaryOpen = useCatStore((state) => state.setDiaryOpen);
  const diaryEntries = useCatStore((state) => state.diaryEntries);
  const savedPhotos = useCatStore((state) => state.savedPhotos);
  const deletePhoto = useCatStore((state) => state.deletePhoto);
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);

  const [activeTab, setActiveTab] = useState<'diary' | 'album' | 'growth'>('diary');

  if (!isDiaryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#caeedf] via-[#fffbf0] to-[#caeedf] border-b-3 border-[#ebd9c8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md border-2 border-[#523e32]">
              <DiaryJournalIcon size={22} />
            </div>
            <div>
              <h2 className="font-fredoka font-bold text-xl sm:text-2xl text-[#523e32] tracking-tight">
                สมุดไดอารี่ & อัลบั้มความทรงจำของ {myCat.name}
              </h2>
              <p className="font-itim text-xs text-[#8d7568]">
                บันทึกทุกช่วงเวลาอันแสนอบอุ่นในโลก Plaza
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              setDiaryOpen(false);
            }}
            className="p-2 rounded-full hover:bg-white/60 text-[#523e32] transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="px-6 py-3 bg-[#f5ebd9] border-b-2 border-[#ebd9c8] flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('diary');
            }}
            className={`btn-jelly px-4 py-2 rounded-full text-xs font-fredoka font-bold flex items-center gap-2 border-2 transition-all ${
              activeTab === 'diary'
                ? 'bg-[#523e32] text-white border-[#523e32] shadow-md'
                : 'bg-white text-[#523e32] border-[#ebd9c8]'
            }`}
          >
            <DiaryJournalIcon size={15} />
            <span>ไดอารี่รายวัน ({diaryEntries.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('album');
            }}
            className={`btn-jelly px-4 py-2 rounded-full text-xs font-fredoka font-bold flex items-center gap-2 border-2 transition-all ${
              activeTab === 'album'
                ? 'bg-[#523e32] text-white border-[#523e32] shadow-md'
                : 'bg-white text-[#523e32] border-[#ebd9c8]'
            }`}
          >
            <PhotoCameraIcon size={15} />
            <span>อัลบั้มภาพโพลารอยด์ ({savedPhotos.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('growth');
            }}
            className={`btn-jelly px-4 py-2 rounded-full text-xs font-fredoka font-bold flex items-center gap-2 border-2 transition-all ${
              activeTab === 'growth'
                ? 'bg-[#523e32] text-white border-[#523e32] shadow-md'
                : 'bg-white text-[#523e32] border-[#ebd9c8]'
            }`}
          >
            <TrendingUp size={15} />
            <span>พัฒนาการ & น้ำหนัก</span>
          </button>
        </div>

        {/* TAB 1: DAILY DIARY TIMELINE */}
        {activeTab === 'diary' && (
          <div className="p-6 overflow-y-auto max-h-[56vh] space-y-3">
            {diaryEntries.length === 0 ? (
              <div className="text-center py-12 text-[#8d7568] font-itim">
                ยังไม่มีบันทึกกิจกรรม ลองพาน้องแมวไปเดินเล่น ดื่มน้ำพุ หรือกินแซลมอนดูสิ!
              </div>
            ) : (
              diaryEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white p-4 rounded-2xl border-2 border-[#ebd9c8] shadow-sm flex items-start gap-3.5 hover:border-[#ffcad4] transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#fffbf0] border border-[#ebd9c8] flex items-center justify-center text-xl shrink-0">
                    <CatPawIcon size={20} color="#523e32" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-fredoka font-bold text-sm text-[#523e32]">
                        {entry.title}
                      </h4>
                      <span className="font-itim text-[11px] text-[#8d7568]">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-itim text-xs text-[#8d7568] mt-0.5">
                      {entry.description}
                    </p>
                    {entry.coinsEarned ? (
                      <div className="mt-1.5 inline-flex items-center gap-1 badge-pill bg-amber-100 text-amber-900 text-[10px]">
                        <FishCoinIcon size={12} />
                        <span>+{entry.coinsEarned} เหรียญ</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PHOTO ALBUM */}
        {activeTab === 'album' && (
          <div className="p-6 overflow-y-auto max-h-[56vh]">
            {savedPhotos.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="flex justify-center"><PhotoCameraIcon size={48} /></div>
                <p className="font-itim text-sm text-[#8d7568]">
                  ยังไม่มีรูปในอัลบั้ม! กดปุ่ม <b>&quot;ถ่ายรูป&quot;</b> บนแถบด้านบน แล้วกดบันทึกลงอัลบั้มได้เลย
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white p-3.5 rounded-3xl border-3 border-[#ebd9c8] shadow-md flex flex-col justify-between gap-2.5 group hover:border-[#ffcad4] transition-all"
                  >
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#e8f4fc] border border-[#ebd9c8]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.dataUrl} alt={photo.caption} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-itim px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <MapPin size={10} /> {photo.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="font-fredoka font-bold text-xs text-[#523e32] truncate max-w-[180px]">
                          {photo.caption || 'โมเมนต์น่ารักใน Plaza'}
                        </p>
                        <p className="font-itim text-[10px] text-[#8d7568]">
                          {new Date(photo.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={photo.dataUrl}
                          download={`wecats-${photo.id}.png`}
                          className="p-2 rounded-xl bg-[#e8f4fc] text-[#523e32] hover:bg-[#bde0fe] transition-colors"
                          title="ดาวน์โหลดรูปลงเครื่อง"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => {
                            soundManager.playPop();
                            deletePhoto(photo.id);
                          }}
                          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="ลบรูปภาพ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WEIGHT & GROWTH PROGRESS */}
        {activeTab === 'growth' && (
          <div className="p-6 overflow-y-auto max-h-[56vh] space-y-4">
            
            {/* Chonky Meter Card */}
            <div className="bg-gradient-to-r from-[#ffe5a3]/40 to-[#ffcad4]/40 p-5 rounded-3xl border-3 border-[#ebd9c8] flex items-center justify-between">
              <div>
                <span className="badge-pill bg-[#ffe5a3] text-[#523e32] text-xs font-fredoka font-bold border border-[#523e32] flex items-center gap-1 w-fit">
                  <Scale size={13} /> Chonky Weight Meter
                </span>
                <h3 className="font-fredoka font-extrabold text-3xl text-[#523e32] mt-1">
                  {stats.weightKg} <span className="text-base font-normal">kg</span>
                </h3>
                <p className="font-itim text-xs text-[#8d7568] mt-0.5">
                  {stats.weightKg > 6.0 ? 'ก้อนขนกลมดุ๊กดิ๊ก น่ากอดที่สุด!' : stats.weightKg > 4.5 ? 'หุ่นกำลังสมส่วน ขนฟูสุขภาพดี' : 'หุ่นเพรียวลม วิ่งว่องไว'}
                </p>
              </div>
              <div className="p-4 rounded-3xl bg-white/80 border-2 border-[#523e32] shadow-sm">
                <CatPawIcon size={44} color="#523e32" />
              </div>
            </div>

            {/* Bonding Level Card */}
            <div className="bg-white p-5 rounded-3xl border-3 border-[#ebd9c8] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="text-pink-500 fill-pink-500" size={20} />
                  <h4 className="font-fredoka font-bold text-sm text-[#523e32]">
                    ระดับความผูกพัน (Bonding Level)
                  </h4>
                </div>
                <span className="font-fredoka font-bold text-sm text-[#523e32]">
                  Level {stats.affectionLevel} ({stats.affectionExp % 100}/100 EXP)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-4 bg-[#fbf7f0] rounded-full border-2 border-[#ebd9c8] overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#ffcad4] to-[#ff99ac] rounded-full transition-all duration-500"
                  style={{ width: `${stats.affectionExp % 100}%` }}
                />
              </div>

              <p className="font-itim text-xs text-[#8d7568] flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500 shrink-0" />
                <span>ทริค: แปรงขนทุกวัน ลูบหัวบ่อยๆ และป้อนแซลมอน จะช่วยเพิ่มค่าความผูกพันได้อย่างรวดเร็ว!</span>
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
