'use client';

import React, { useState, useEffect } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { Radio, Lock, Plus, Users, X, Sparkles, Key, Check } from 'lucide-react';

interface ServerChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoomItem {
  id: string;
  name: string;
  type: string;
  theme: string;
  maxCapacity: number;
  currentCount: number;
}

export const ServerChannelModal: React.FC<ServerChannelModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'create'>('public');
  const [publicChannels, setPublicChannels] = useState<RoomItem[]>([
    { id: 'public-sakura', name: 'Plaza #1: สวนซากุระ 🌸', type: 'public', theme: 'sakura', maxCapacity: 20, currentCount: 14 },
    { id: 'public-sunshine', name: 'Plaza #2: ลานแดดอุ่น ☀️', type: 'public', theme: 'sunshine', maxCapacity: 20, currentCount: 8 },
    { id: 'public-moonlight', name: 'Plaza #3: แสงจันทร์ Lofi 🌙', type: 'public', theme: 'moonlight', maxCapacity: 20, currentCount: 5 },
  ]);
  const [privateRooms, setPrivateRooms] = useState<RoomItem[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState('public-sakura');

  // Create room state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPin, setNewRoomPin] = useState('');
  const [newRoomTheme, setNewRoomTheme] = useState('sakura');

  // Join room with PIN state
  const [selectedPrivateRoom, setSelectedPrivateRoom] = useState<RoomItem | null>(null);
  const [enterPin, setEnterPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/rooms')
        .then((res) => res.json())
        .then((data) => {
          if (data.publicChannels) setPublicChannels(data.publicChannels);
          if (data.privateRooms) setPrivateRooms(data.privateRooms);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPublic = (channel: RoomItem) => {
    soundManager.playSparkle();
    setCurrentRoomId(channel.id);

    // Switch Day/Night according to theme
    if (channel.theme === 'moonlight') {
      useCatStore.setState({ timeOfDay: 'night' });
    } else if (channel.theme === 'sunshine') {
      useCatStore.setState({ timeOfDay: 'afternoon' });
    } else {
      useCatStore.setState({ timeOfDay: 'morning' });
    }

    useCatStore.getState().setNotification(`ย้ายไปยังห้อง ${channel.name} สำเร็จ! 🐾`);
    onClose();
  };

  const handleCreatePrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName,
          passcode: newRoomPin,
          theme: newRoomTheme,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'สร้างห้องไม่สำเร็จ');
      }

      soundManager.playSparkle();
      setCurrentRoomId(data.room.id);
      useCatStore.getState().setNotification(`สร้างห้องส่วนตัว "${data.room.name}" สำเร็จ! รหัส PIN: ${newRoomPin} 🔒`);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างห้อง');
    }
  };

  const handleJoinPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrivateRoom) return;
    setErrorMsg(null);

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedPrivateRoom.id,
          passcode: enterPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'รหัสผ่าน PIN ไม่ถูกต้อง');
      }

      soundManager.playSparkle();
      setCurrentRoomId(data.room.id);
      useCatStore.getState().setNotification(`เข้าร่วมห้องส่วนตัว "${data.room.name}" สำเร็จ! 🔒`);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'รหัส PIN ไม่ถูกต้อง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl p-6 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#ebd9c8] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#caeedf] border-2 border-[#523e32] flex items-center justify-center text-xl shadow-sm">
              🌐
            </div>
            <div>
              <h3 className="font-fredoka font-bold text-lg text-[#523e32]">Server & Channel Hub</h3>
              <p className="font-itim text-xs text-[#8d7568]">เลือก Channel เดินเล่น หรือสร้างห้องส่วนตัว</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-[#ebd9c8] text-[#523e32]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-2 bg-[#f0e6df] p-1 rounded-2xl">
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('public');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all ${
              activeTab === 'public' ? 'bg-white text-[#523e32] shadow-sm' : 'text-[#8d7568]'
            }`}
          >
            Public Channels
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('private');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all ${
              activeTab === 'private' ? 'bg-white text-[#523e32] shadow-sm' : 'text-[#8d7568]'
            }`}
          >
            Private Rooms 🔒
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('create');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all ${
              activeTab === 'create' ? 'bg-white text-[#523e32] shadow-sm' : 'text-[#8d7568]'
            }`}
          >
            + สร้างห้องใหม่
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2 rounded-2xl text-xs font-itim">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* TAB 1: PUBLIC CHANNELS */}
        {activeTab === 'public' && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {publicChannels.map((ch) => {
              const isCurrent = currentRoomId === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => handleSelectPublic(ch)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#ffcad4] border-[#523e32] shadow-md scale-[1.01]'
                      : 'bg-white border-[#ebd9c8] hover:border-[#ffcad4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Radio size={18} className={isCurrent ? 'text-[#523e32]' : 'text-[#8d7568]'} />
                    <div>
                      <h4 className="font-fredoka font-bold text-sm text-[#523e32]">{ch.name}</h4>
                      <p className="font-itim text-xs text-[#8d7568]">
                        จำกัด 20 แมว • บรรยากาศเป็นกันเอง
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-pill bg-white/80 text-xs font-fredoka text-[#523e32]">
                      <Users size={12} /> {ch.currentCount}/{ch.maxCapacity}
                    </span>
                    {isCurrent && <Check size={16} className="text-emerald-700 font-bold" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: PRIVATE ROOMS */}
        {activeTab === 'private' && (
          <div className="space-y-3">
            {privateRooms.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border-2 border-[#ebd9c8] text-center space-y-2">
                <Lock className="mx-auto text-[#8d7568]" size={28} />
                <h4 className="font-fredoka font-bold text-sm text-[#523e32]">ยังไม่มีห้องส่วนตัวที่เปิดอยู่</h4>
                <p className="font-itim text-xs text-[#8d7568]">
                  คุณสามารถกดที่แท็บ <b>"+ สร้างห้องใหม่"</b> เพื่อสร้างห้องและชวนเพื่อนมาเล่นได้
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {privateRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      soundManager.playPop();
                      setSelectedPrivateRoom(room);
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center justify-between ${
                      selectedPrivateRoom?.id === room.id ? 'bg-[#ffe5a3] border-[#523e32]' : 'bg-white border-[#ebd9c8]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock size={16} className="text-[#523e32]" />
                      <span className="font-fredoka font-bold text-xs text-[#523e32]">{room.name}</span>
                    </div>
                    <span className="badge-pill bg-white text-[11px] font-fredoka">
                      {room.currentCount}/{room.maxCapacity} แมว
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* PIN Entry for Selected Private Room */}
            {selectedPrivateRoom && (
              <form onSubmit={handleJoinPrivate} className="bg-white p-3.5 rounded-2xl border-2 border-[#ebd9c8] space-y-2">
                <div className="flex items-center gap-2">
                  <Key size={14} className="text-[#523e32]" />
                  <span className="font-itim text-xs font-bold text-[#523e32]">
                    ใส่รหัส PIN สำหรับห้อง: {selectedPrivateRoom.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    required
                    value={enterPin}
                    onChange={(e) => setEnterPin(e.target.value)}
                    placeholder="ใส่รหัส PIN 4 หลัก..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#fbf7f0] border border-[#ebd9c8] font-fredoka text-xs text-[#523e32] text-center tracking-widest focus:outline-none focus:border-[#ffcad4]"
                  />
                  <button
                    type="submit"
                    className="btn-jelly px-4 py-1.5 rounded-xl bg-[#ffcad4] text-[#523e32] font-fredoka font-bold text-xs border border-[#523e32]"
                  >
                    เข้าห้อง 🚪
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: CREATE PRIVATE ROOM */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreatePrivate} className="space-y-3">
            <div className="space-y-1">
              <label className="font-itim text-xs text-[#523e32] font-bold">ชื่อห้องส่วนตัว (Room Name)</label>
              <input
                type="text"
                required
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="เช่น ห้องแก๊งแมวส้ม หรือ บ้านลับของโมจิ..."
                className="w-full px-4 py-2 rounded-2xl bg-white border-2 border-[#ebd9c8] font-fredoka text-xs text-[#523e32] focus:outline-none focus:border-[#caeedf]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-itim text-xs text-[#523e32] font-bold">ตั้งรหัสผ่าน PIN สำหรับเข้าห้อง</label>
              <input
                type="text"
                required
                value={newRoomPin}
                onChange={(e) => setNewRoomPin(e.target.value)}
                placeholder="เช่น 1234 หรือ MEOW..."
                className="w-full px-4 py-2 rounded-2xl bg-white border-2 border-[#ebd9c8] font-fredoka text-xs text-[#523e32] text-center tracking-widest focus:outline-none focus:border-[#caeedf]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-itim text-xs text-[#523e32] font-bold">ธีมบรรยากาศห้อง (Theme)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sakura', label: '🌸 สวนซากุระ' },
                  { id: 'sunshine', label: '☀️ ลานแดดอุ่น' },
                  { id: 'moonlight', label: '🌙 แสงจันทร์' },
                ].map((th) => (
                  <button
                    type="button"
                    key={th.id}
                    onClick={() => {
                      soundManager.playPop();
                      setNewRoomTheme(th.id);
                    }}
                    className={`btn-jelly py-2 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] ${
                      newRoomTheme === th.id ? 'bg-[#caeedf]' : 'bg-white'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-jelly w-full py-2.5 rounded-2xl bg-[#caeedf] text-[#523e32] font-fredoka font-bold text-xs border-2 border-[#523e32] flex items-center justify-center gap-2 shadow-md mt-2"
            >
              <Plus size={16} />
              สร้างห้องส่วนตัวและเข้าเล่นทันที!
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
