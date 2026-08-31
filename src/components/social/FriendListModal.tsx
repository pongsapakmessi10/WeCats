'use client';

import React, { useState } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import {
  X,
  Users,
  UserPlus,
  Heart,
  Send,
  Sparkles,
  Award,
} from 'lucide-react';
import { OnlineCat } from '@/types/game';

export const FriendListModal: React.FC = () => {
  const isFriendsOpen = useCatStore((state) => state.isFriendsOpen);
  const setFriendsOpen = useCatStore((state) => state.setFriendsOpen);
  const friends = useCatStore((state) => state.friends);
  const onlineCats = useCatStore((state) => state.onlineCats);
  const addFriend = useCatStore((state) => state.addFriend);
  const sendTreatToFriend = useCatStore((state) => state.sendTreatToFriend);
  const fishCoins = useCatStore((state) => state.fishCoins);

  const [activeTab, setActiveTab] = useState<'friends' | 'nearby'>('friends');

  if (!isFriendsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#bde0fe] via-[#ffcad4] to-[#bde0fe] border-b-3 border-[#ebd9c8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-md border-2 border-[#523e32]">
              👥
            </div>
            <div>
              <h2 className="font-fredoka font-bold text-xl sm:text-2xl text-[#523e32] tracking-tight">
                สังคมแมว & เพื่อนสนิท (Cat Besties)
              </h2>
              <p className="font-itim text-xs text-[#8d7568]">
                ผูกมิตรกับเพื่อนแมวใน Plaza และส่งขนมแมวเลียให้กัน 🐾
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              setFriendsOpen(false);
            }}
            className="p-2 rounded-full hover:bg-white/60 text-[#523e32] transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="px-6 py-3 bg-[#f5ebd9] border-b-2 border-[#ebd9c8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('friends');
              }}
              className={`btn-jelly px-4 py-2 rounded-full text-xs font-fredoka font-bold flex items-center gap-2 border-2 transition-all ${
                activeTab === 'friends'
                  ? 'bg-[#523e32] text-white border-[#523e32] shadow-md'
                  : 'bg-white text-[#523e32] border-[#ebd9c8]'
              }`}
            >
              <Users size={14} />
              <span>เพื่อนสนิท ({friends.length})</span>
            </button>

            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('nearby');
              }}
              className={`btn-jelly px-4 py-2 rounded-full text-xs font-fredoka font-bold flex items-center gap-2 border-2 transition-all ${
                activeTab === 'nearby'
                  ? 'bg-[#523e32] text-white border-[#523e32] shadow-md'
                  : 'bg-white text-[#523e32] border-[#ebd9c8]'
              }`}
            >
              <Sparkles size={14} />
              <span>แมวในลาน Plaza ({onlineCats.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 font-fredoka font-bold text-xs text-[#523e32] bg-white px-3 py-1.5 rounded-full border border-[#ebd9c8]">
            <span>🐟 {fishCoins} เหรียญ</span>
          </div>
        </div>

        {/* TAB 1: FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
            {friends.length === 0 ? (
              <div className="text-center py-12 text-[#8d7568] font-itim">
                ยังไม่มีเพื่อนสนิท! ลองเดินไปหาแมวตัวอื่นในลาน Plaza แล้วกดขอเป็นเพื่อนดูสิ 🐾
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-white p-4 rounded-3xl border-3 border-[#ebd9c8] shadow-sm flex items-center justify-between gap-3 hover:border-[#bde0fe] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ffe5a3] to-[#ffcad4] flex items-center justify-center text-2xl border-2 border-[#523e32]">
                      🐱
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-fredoka font-bold text-sm text-[#523e32]">
                          {friend.catName}
                        </h4>
                        <span className="badge-pill bg-emerald-100 text-emerald-800 text-[10px]">
                          Online ●
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-itim text-[#8d7568] mt-0.5">
                        <span>สายพันธุ์: {friend.breed}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-pink-600 font-bold">
                          <Heart size={12} className="fill-pink-500" /> {friend.friendshipPoints} แต้มมิตรภาพ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Send Treat Button */}
                  <button
                    onClick={() => {
                      soundManager.playSparkle();
                      sendTreatToFriend(friend.id);
                    }}
                    className="btn-jelly px-4 py-2 rounded-2xl bg-[#ffe5a3] hover:bg-[#ffd166] text-[#523e32] border-2 border-[#523e32] text-xs font-fredoka font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🍣 ส่งขนมแมวเลีย (15 🐟)</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: NEARBY CATS IN PLAZA */}
        {activeTab === 'nearby' && (
          <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
            {onlineCats.map((cat) => {
              const isAlreadyFriend = friends.some((f) => f.id === cat.id);

              return (
                <div
                  key={cat.id}
                  className="bg-white p-4 rounded-3xl border-3 border-[#ebd9c8] shadow-sm flex items-center justify-between gap-3 hover:border-[#ffcad4] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#caeedf] to-[#bde0fe] flex items-center justify-center text-2xl border-2 border-[#523e32]">
                      🐾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-fredoka font-bold text-sm text-[#523e32]">
                          {cat.customization.name}
                        </h4>
                        <span className="badge-pill bg-amber-100 text-amber-900 text-[10px]">
                          นิสัย: {cat.customization.personality}
                        </span>
                      </div>
                      <p className="font-itim text-xs text-[#8d7568] mt-0.5">
                        สายพันธุ์ {cat.customization.breed} • พลังงาน {cat.stats.energy}%
                      </p>
                    </div>
                  </div>

                  {isAlreadyFriend ? (
                    <span className="badge-pill bg-[#caeedf] text-[#2b7a5a] text-xs font-fredoka font-bold">
                      ✓ เป็นเพื่อนแล้ว
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        soundManager.playSparkle();
                        addFriend(cat);
                      }}
                      className="btn-jelly px-4 py-2 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] border-2 border-[#523e32] text-xs font-fredoka font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <UserPlus size={14} />
                      <span>ขอเป็นเพื่อน 🐾</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
