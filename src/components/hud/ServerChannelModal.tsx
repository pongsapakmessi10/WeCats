'use client';

import React, { useState, useEffect } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { Radio, Lock, Plus, Users, X, Key, Check, Trash2 } from 'lucide-react';
import {
  SakuraBlossomIcon,
  SunshineSunIcon,
  MoonlightCrescentIcon,
} from '@/components/ui/GameIcons';
import { broadcastP2PPacket } from '@/game/multiplayer/p2pManager';

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
    { id: 'public-sakura', name: 'Plaza #1: สวนซากุระ', type: 'public', theme: 'sakura', maxCapacity: 20, currentCount: 0 },
    { id: 'public-sunshine', name: 'Plaza #2: ลานแดดอุ่น', type: 'public', theme: 'sunshine', maxCapacity: 20, currentCount: 0 },
    { id: 'public-moonlight', name: 'Plaza #3: แสงจันทร์ Lofi', type: 'public', theme: 'moonlight', maxCapacity: 20, currentCount: 0 },
  ]);
  const [privateRooms, setPrivateRooms] = useState<RoomItem[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Create room state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPin, setNewRoomPin] = useState('');
  const [newRoomTheme, setNewRoomTheme] = useState('sakura');

  // Join room with PIN state
  const [selectedPrivateRoom, setSelectedPrivateRoom] = useState<RoomItem | null>(null);
  const [enterPin, setEnterPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const currentRoom = useCatStore((state) => state.currentRoom);
  const setCurrentRoom = useCatStore((state) => state.setCurrentRoom);
  const onlineCats = useCatStore((state) => state.onlineCats);

  const fetchRooms = () => {
    setIsLoadingRooms(true);
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (data.publicChannels) setPublicChannels(data.publicChannels);
        if (data.privateRooms) setPrivateRooms(data.privateRooms);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingRooms(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPublic = (channel: RoomItem) => {
    if (currentRoom.id === channel.id) {
      onClose();
      return;
    }

    const liveCount = channel.currentCount;
    if (liveCount >= channel.maxCapacity) {
      soundManager.playPop();
      setErrorMsg(
        `ห้อง "${channel.name}" มีผู้เล่นเต็มแล้ว (${channel.maxCapacity}/${channel.maxCapacity} แมว) 🔴 กรุณาเลือก Plaza ถัดไป หรือสร้างห้องส่วนตัว`
      );
      return;
    }

    soundManager.playSparkle();
    setCurrentRoom({
      id: channel.id,
      name: channel.name,
      type: 'public',
      theme: channel.theme as any,
      maxCapacity: channel.maxCapacity,
    });
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
      setCurrentRoom({
        id: data.room.id,
        name: data.room.name,
        type: 'private',
        theme: data.room.theme as any,
        maxCapacity: data.room.maxCapacity,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างห้อง');
    }
  };

  const handleJoinPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrivateRoom) return;
    setErrorMsg(null);

    if (
      currentRoom.id !== selectedPrivateRoom.id &&
      selectedPrivateRoom.currentCount >= selectedPrivateRoom.maxCapacity
    ) {
      soundManager.playPop();
      setErrorMsg(
        `ห้องส่วนตัว "${selectedPrivateRoom.name}" เต็มแล้ว (${selectedPrivateRoom.maxCapacity}/${selectedPrivateRoom.maxCapacity} แมว) 🔴`
      );
      return;
    }

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
      setCurrentRoom({
        id: data.room.id,
        name: data.room.name,
        type: 'private',
        theme: data.room.theme as any,
        maxCapacity: data.room.maxCapacity,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'รหัส PIN ไม่ถูกต้อง');
    }
  };

  const handleDeleteRoom = async (room: RoomItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`คุณต้องการลบห้อง "${room.name}" ใช่หรือไม่?\n(ผู้เล่นทุกคนในห้องจะถูกพากลับสู่สวนซากุระ Plaza)`)) return;

    // 1. Broadcast WebRTC packet to instantly kick all peers in the room
    broadcastP2PPacket({
      type: 'room-deleted',
      roomId: room.id,
      roomName: room.name,
    });

    try {
      // 2. Delete room from Cloud Database
      await fetch('/api/rooms/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id }),
      });

      fetchRooms();

      // 3. If the host is currently in that room, kick self back to Sakura Plaza
      if (currentRoom.id === room.id) {
        useCatStore.getState().kickToSakuraPlaza(room.name);
        onClose();
      }
    } catch {}
  };

  const getThemeIcon = (theme: string) => {
    if (theme === 'moonlight') return <MoonlightCrescentIcon size={16} />;
    if (theme === 'sunshine') return <SunshineSunIcon size={16} />;
    return <SakuraBlossomIcon size={16} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl p-6 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#ebd9c8] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#caeedf] border-2 border-[#523e32] flex items-center justify-center shadow-sm">
              <Radio size={20} className="text-[#523e32]" />
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
            className="p-1.5 rounded-full hover:bg-[#ebd9c8] text-[#523e32] cursor-pointer"
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
              fetchRooms();
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all cursor-pointer ${
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
              fetchRooms();
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'private' ? 'bg-white text-[#523e32] shadow-sm' : 'text-[#8d7568]'
            }`}
          >
            <Lock size={12} />
            <span>Private Rooms</span>
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('create');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all cursor-pointer ${
              activeTab === 'create' ? 'bg-white text-[#523e32] shadow-sm' : 'text-[#8d7568]'
            }`}
          >
            + สร้างห้องใหม่
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2 rounded-2xl text-xs font-itim">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: PUBLIC CHANNELS */}
        {activeTab === 'public' && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {isLoadingRooms ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl border-2 border-[#ebd9c8] bg-white flex items-center justify-between animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#ebd9c8]/70" />
                    <div className="space-y-1.5">
                      <div className="w-32 h-4 rounded-md bg-[#ebd9c8]/70" />
                      <div className="w-24 h-3 rounded-md bg-[#ebd9c8]/40" />
                    </div>
                  </div>
                  <div className="w-14 h-6 rounded-full bg-[#ebd9c8]/60" />
                </div>
              ))
            ) : (
              publicChannels.map((ch) => {
                const isCurrent = currentRoom.id === ch.id;
                const liveCount = isCurrent ? onlineCats.length + 1 : ch.currentCount;
                const isFull = liveCount >= ch.maxCapacity && !isCurrent;

                return (
                  <div
                    key={ch.id}
                    onClick={() => handleSelectPublic(ch)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#ffcad4] border-[#523e32] shadow-md scale-[1.01]'
                        : isFull
                        ? 'bg-gray-50/80 border-[#ebd9c8] opacity-85 hover:border-red-300'
                        : 'bg-white border-[#ebd9c8] hover:border-[#ffcad4]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#ebd9c8] flex items-center justify-center">
                        {getThemeIcon(ch.theme)}
                      </div>
                      <div>
                        <h4 className="font-fredoka font-bold text-sm text-[#523e32]">{ch.name}</h4>
                        <p className="font-itim text-xs text-[#8d7568]">
                          จำกัด {ch.maxCapacity} แมว • บรรยากาศเป็นกันเอง
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge-pill text-xs font-fredoka flex items-center gap-1 font-bold ${
                          isCurrent
                            ? 'bg-white/90 text-[#523e32]'
                            : isFull
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <Users size={12} /> {liveCount}/{ch.maxCapacity} {isFull ? '🔴 เต็ม' : '🟢 ว่าง'}
                      </span>
                      {isCurrent && <Check size={16} className="text-emerald-700 font-bold" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PRIVATE ROOMS */}
        {activeTab === 'private' && (
          <div className="space-y-3">
            {isLoadingRooms ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl border-2 border-[#ebd9c8] bg-white flex items-center justify-between animate-pulse"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#ebd9c8]/70" />
                      <div className="w-28 h-3.5 rounded-md bg-[#ebd9c8]/70" />
                    </div>
                    <div className="w-12 h-5 rounded-full bg-[#ebd9c8]/60" />
                  </div>
                ))}
              </div>
            ) : privateRooms.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border-2 border-[#ebd9c8] text-center space-y-2">
                <Lock className="mx-auto text-[#8d7568]" size={28} />
                <h4 className="font-fredoka font-bold text-sm text-[#523e32]">ยังไม่มีห้องส่วนตัวที่เปิดอยู่</h4>
                <p className="font-itim text-xs text-[#8d7568]">
                  คุณสามารถกดที่แท็บ <b>"+ สร้างห้องใหม่"</b> เพื่อสร้างห้องและชวนเพื่อนมาเล่นได้
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {privateRooms.map((room) => {
                  const isCurrent = currentRoom.id === room.id;
                  const isSelected = selectedPrivateRoom?.id === room.id;
                  const liveCount = isCurrent ? onlineCats.length + 1 : room.currentCount;
                  const isFull = liveCount >= room.maxCapacity && !isCurrent;

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        soundManager.playPop();
                        setSelectedPrivateRoom(room);
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#ffcad4] border-[#523e32] shadow-md'
                          : isSelected
                          ? 'bg-[#ffe5a3] border-[#523e32]'
                          : 'bg-white border-[#ebd9c8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/80 border border-[#ebd9c8] flex items-center justify-center">
                          {getThemeIcon(room.theme)}
                        </div>
                        <span className="font-fredoka font-bold text-xs text-[#523e32]">{room.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge-pill text-[11px] font-fredoka flex items-center gap-1 font-bold ${
                            isCurrent
                              ? 'bg-white text-[#523e32]'
                              : isFull
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <Users size={11} /> {liveCount}/{room.maxCapacity} {isFull ? '🔴 เต็ม' : '🟢 ว่าง'}
                        </span>
                        {isCurrent && <Check size={16} className="text-emerald-700 font-bold" />}
                        <button
                          onClick={(e) => handleDeleteRoom(room, e)}
                          title="ลบห้องนี้"
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                  { id: 'sakura', label: 'สวนซากุระ', icon: <SakuraBlossomIcon size={16} /> },
                  { id: 'sunshine', label: 'ลานแดดอุ่น', icon: <SunshineSunIcon size={16} /> },
                  { id: 'moonlight', label: 'แสงจันทร์', icon: <MoonlightCrescentIcon size={16} /> },
                ].map((th) => (
                  <button
                    type="button"
                    key={th.id}
                    onClick={() => {
                      soundManager.playPop();
                      setNewRoomTheme(th.id);
                    }}
                    className={`btn-jelly py-2 rounded-xl text-xs font-fredoka font-bold border-2 border-[#523e32] flex items-center justify-center gap-1.5 ${
                      newRoomTheme === th.id ? 'bg-[#caeedf]' : 'bg-white'
                    }`}
                  >
                    {th.icon}
                    <span>{th.label}</span>
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
