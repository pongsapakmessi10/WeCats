'use client';

import React, { useState, useEffect } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import {
  X,
  UserPlus,
  Heart,
  Sparkles,
  Check,
  MessageCircle,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  FriendsDuoIcon,
  CatPawIcon,
  FishCoinIcon,
} from '@/components/ui/GameIcons';

export const FriendListModal: React.FC = () => {
  const isFriendsOpen = useCatStore((state) => state.isFriendsOpen);
  const setFriendsOpen = useCatStore((state) => state.setFriendsOpen);
  const friends = useCatStore((state) => state.friends);
  const pendingFriendRequests = useCatStore((state) => state.pendingFriendRequests);
  const onlineCats = useCatStore((state) => state.onlineCats);
  const sendFriendRequestToCat = useCatStore((state) => state.sendFriendRequestToCat);
  const acceptFriendRequest = useCatStore((state) => state.acceptFriendRequest);
  const declineFriendRequest = useCatStore((state) => state.declineFriendRequest);
  const setActiveDirectChatFriend = useCatStore((state) => state.setActiveDirectChatFriend);
  const sendTreatToFriend = useCatStore((state) => state.sendTreatToFriend);
  const fishCoins = useCatStore((state) => state.fishCoins);

  const [activeTab, setActiveTab] = useState<'requests' | 'friends' | 'nearby'>('friends');

  // Auto-switch to requests tab if there are incoming requests when opening modal
  useEffect(() => {
    if (isFriendsOpen && pendingFriendRequests.length > 0) {
      setActiveTab('requests');
    }
  }, [isFriendsOpen, pendingFriendRequests.length]);

  if (!isFriendsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#bde0fe] via-[#ffcad4] to-[#bde0fe] border-b-3 border-[#ebd9c8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md border-2 border-[#523e32]">
              <FriendsDuoIcon size={22} />
            </div>
            <div>
              <h2 className="font-fredoka font-bold text-xl sm:text-2xl text-[#523e32] tracking-tight">
                สังคมแมว & เพื่อนสนิท (Cat Besties)
              </h2>
              <p className="font-itim text-xs text-[#8d7568]">
                ผูกมิตร แชท 1-to-1 ส่วนตัว และส่งขนมแมวเลียให้กัน 🐾
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              setFriendsOpen(false);
            }}
            className="p-2 rounded-full hover:bg-white/60 text-[#523e32] transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="px-6 py-3 bg-[#f5ebd9] border-b-2 border-[#ebd9c8] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Tab 1: Requests */}
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('requests');
              }}
              className={`btn-jelly relative px-3.5 py-1.5 rounded-full text-xs font-fredoka font-bold flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-[#523e32] text-white border-[#523e32] shadow-md'
                  : 'bg-white text-[#523e32] border-[#ebd9c8]'
              }`}
            >
              <Clock size={13} />
              <span>คำขอเป็นเพื่อน ({pendingFriendRequests.length})</span>
              {pendingFriendRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#ff4d6d] text-white text-[10px] font-fredoka font-bold animate-bounce">
                  {pendingFriendRequests.length}
                </span>
              )}
            </button>

            {/* Tab 2: Besties */}
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('friends');
              }}
              className={`btn-jelly px-3.5 py-1.5 rounded-full text-xs font-fredoka font-bold flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-[#523e32] text-white border-[#523e32] shadow-md'
                  : 'bg-white text-[#523e32] border-[#ebd9c8]'
              }`}
            >
              <FriendsDuoIcon size={14} />
              <span>เพื่อนสนิท ({friends.length})</span>
            </button>

            {/* Tab 3: Nearby in Plaza */}
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('nearby');
              }}
              className={`btn-jelly px-3.5 py-1.5 rounded-full text-xs font-fredoka font-bold flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
                activeTab === 'nearby'
                  ? 'bg-[#523e32] text-white border-[#523e32] shadow-md'
                  : 'bg-white text-[#523e32] border-[#ebd9c8]'
              }`}
            >
              <Sparkles size={13} />
              <span>แมวในลาน Plaza ({onlineCats.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 font-fredoka font-bold text-xs text-[#523e32] bg-white px-3 py-1.5 rounded-full border border-[#ebd9c8] shrink-0">
            <FishCoinIcon size={15} />
            <span>{fishCoins} 🐟</span>
          </div>
        </div>

        {/* TAB 1: PENDING FRIEND REQUESTS */}
        {activeTab === 'requests' && (
          <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
            {pendingFriendRequests.length === 0 ? (
              <div className="text-center py-14 text-[#8d7568] font-itim space-y-2">
                <Clock size={32} className="mx-auto text-[#d4a373] opacity-50" />
                <p>ไม่มีคำขอเป็นเพื่อนที่รอดำเนินการในขณะนี้ 🌸</p>
                <p className="text-xs text-[#8d7568]/70">
                  เมื่อเพื่อนแมวเดินมาใกล้ๆ และกดขอเป็นเพื่อน คำขอจะปรากฏที่นี่แบบ Real-Time!
                </p>
              </div>
            ) : (
              pendingFriendRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-4 rounded-3xl border-3 border-[#ebd9c8] shadow-sm flex items-center justify-between gap-3 hover:border-[#ffcad4] transition-all animate-in fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ffe5a3] to-[#ffcad4] flex items-center justify-center border-2 border-[#523e32] shadow-inner">
                      <CatPawIcon size={22} color="#523e32" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-fredoka font-bold text-sm text-[#523e32]">
                          {req.senderName}
                        </h4>
                        <span className="badge-pill bg-[#ffcad4] text-[#523e32] text-[10px] font-fredoka">
                          ส่งคำขอมา 💌
                        </span>
                      </div>
                      <p className="font-itim text-xs text-[#8d7568] mt-0.5">
                        สายพันธุ์: {req.senderCustomization?.breed || 'orange_tabby'}
                      </p>
                    </div>
                  </div>

                  {/* Accept / Decline Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        soundManager.playSparkle();
                        acceptFriendRequest(req.id);
                      }}
                      className="btn-jelly px-3.5 py-1.5 rounded-2xl bg-[#caeedf] hover:bg-[#b2e5ce] text-[#205e43] border-2 border-[#205e43] text-xs font-fredoka font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <UserCheck size={14} />
                      <span>ยอมรับ</span>
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playPop();
                        declineFriendRequest(req.id);
                      }}
                      className="btn-jelly px-3 py-1.5 rounded-2xl bg-white hover:bg-red-50 text-red-600 border-2 border-red-300 text-xs font-fredoka font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <UserX size={14} />
                      <span>ปฏิเสธ</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: BESTIES LIST WITH 1-to-1 CHAT */}
        {activeTab === 'friends' && (
          <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
            {friends.length === 0 ? (
              <div className="text-center py-14 text-[#8d7568] font-itim space-y-2">
                <FriendsDuoIcon size={32} className="mx-auto text-[#d4a373] opacity-50" />
                <p>ยังไม่มีเพื่อนสนิท! ลองเดินไปหาแมวตัวอื่นในลาน Plaza แล้วกดขอเป็นเพื่อนดูสิ 🐾</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-white p-4 rounded-3xl border-3 border-[#ebd9c8] shadow-sm flex items-center justify-between gap-3 hover:border-[#bde0fe] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ffe5a3] to-[#ffcad4] flex items-center justify-center border-2 border-[#523e32] shadow-inner">
                      <CatPawIcon size={22} color="#523e32" />
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
                          <Heart size={12} className="fill-pink-500" /> {friend.friendshipPoints} แต้ม
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-to-1 Chat, Visit Home & Send Treat Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => {
                        soundManager.playSparkle();
                        setFriendsOpen(false);
                        useCatStore.getState().visitFriendCondo(friend.catName, friend.condoConfig);
                      }}
                      className="btn-jelly px-3 py-1.5 rounded-2xl bg-[#ffd166] hover:bg-[#ffc32b] text-[#523e32] border-2 border-[#523e32] text-xs font-fredoka font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      title="วาร์ปไปเยี่ยมคอนโดของเพื่อน 🏡"
                    >
                      <span>🏡</span>
                      <span>เยี่ยมบ้าน</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playPop();
                        setActiveDirectChatFriend(friend);
                      }}
                      className="btn-jelly px-3 py-1.5 rounded-2xl bg-[#bde0fe] hover:bg-[#a8d4fc] text-[#523e32] border-2 border-[#523e32] text-xs font-fredoka font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      title="เปิดหน้าต่างแชทส่วนตัว 1-to-1"
                    >
                      <MessageCircle size={14} />
                      <span>แชท DM</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playSparkle();
                        sendTreatToFriend(friend.id);
                      }}
                      className="btn-jelly px-2.5 py-1.5 rounded-2xl bg-[#ffe5a3] hover:bg-[#ffd166] text-[#523e32] border-2 border-[#523e32] text-xs font-fredoka font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                      title="ส่งขนมแมวเลีย +15 แต้มมิตรภาพ"
                    >
                      <FishCoinIcon size={13} />
                      <span>ขนม (15 🐟)</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: NEARBY CATS IN PLAZA */}
        {activeTab === 'nearby' && (
          <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
            {onlineCats.length === 0 ? (
              <div className="text-center py-14 text-[#8d7568] font-itim">
                ยังไม่พบแมวตัวอื่นในห้องนี้ ชวนเพื่อนเข้ามาเล่นด้วยกันเลย! 🌸
              </div>
            ) : (
              onlineCats.map((cat) => {
                const isAlreadyFriend = friends.some((f) => f.id === cat.id || f.catName === cat.customization.name);

                return (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-3xl border-3 border-[#ebd9c8] shadow-sm flex items-center justify-between gap-3 hover:border-[#ffcad4] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#caeedf] to-[#bde0fe] flex items-center justify-center border-2 border-[#523e32] shadow-inner">
                        <CatPawIcon size={22} color="#523e32" />
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
                      <span className="badge-pill bg-[#caeedf] text-[#2b7a5a] text-xs font-fredoka font-bold flex items-center gap-1">
                        <Check size={13} />
                        <span>เป็นเพื่อนแล้ว</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          soundManager.playSparkle();
                          sendFriendRequestToCat(cat);
                        }}
                        className="btn-jelly px-4 py-2 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] border-2 border-[#523e32] text-xs font-fredoka font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <UserPlus size={14} />
                        <span>ขอเป็นเพื่อน</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};
