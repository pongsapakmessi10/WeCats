'use client';

import React, { useState } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import confetti from 'canvas-confetti';
import { LogIn, UserPlus, Sparkles, X, Cat, Shield, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessFirstTime: () => void; // Trigger onboarding customizer
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessFirstTime }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'guest'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);
  const updateCustomization = useCatStore((state) => state.updateCustomization);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      soundManager.playSparkle();
      if (data.catProfile) {
        updateCustomization({
          name: data.catProfile.name,
          gender: data.catProfile.gender,
          breed: data.catProfile.breed,
          bodyType: data.catProfile.bodyType,
          earType: data.catProfile.earType,
          tailType: data.catProfile.tailType,
          eyeType: data.catProfile.eyeType,
          eyeColorLeft: data.catProfile.eyeColorLeft,
          eyeColorRight: data.catProfile.eyeColorRight,
          baseColor: data.catProfile.baseColor,
          patternType: data.catProfile.patternType,
          patternColor: data.catProfile.patternColor,
          snoutColor: data.catProfile.snoutColor,
          pawColor: data.catProfile.pawColor,
          bellyColor: data.catProfile.bellyColor,
          accessoryHead: data.catProfile.accessoryHead,
          accessoryNeck: data.catProfile.accessoryNeck,
          accessoryBack: data.catProfile.accessoryBack,
          accessoryFace: data.catProfile.accessoryFace,
          aura: data.catProfile.aura,
          personality: data.catProfile.personality,
        });
      }

      useCatStore.getState().setNotification(`ยินดีต้อนรับกลับมา ${data.user.username}! 🐱`);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, customization: myCat }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ลงทะเบียนไม่สำเร็จ');
      }

      soundManager.playSparkle();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      useCatStore.getState().setNotification(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ${data.user.username} 🌸`);
      onClose();
      // Open Customizer for first-time customization
      onSuccessFirstTime();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customization: myCat }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบ Guest ไม่สำเร็จ');
      }

      soundManager.playMeow(1.2);
      useCatStore.getState().setNotification(`เข้าเล่นในโหมด Guest: ${data.user.username} 🐾`);
      onClose();
      onSuccessFirstTime();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบแบบ Guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl p-6 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#ebd9c8] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#ffcad4] border-2 border-[#523e32] flex items-center justify-center text-xl shadow-sm">
              🐾
            </div>
            <div>
              <h3 className="font-fredoka font-bold text-lg text-[#523e32]">WeCats Account</h3>
              <p className="font-itim text-xs text-[#8d7568]">บันทึกข้อมูลน้องแมวของคุณ</p>
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
              setTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all ${
              tab === 'login' ? 'bg-white text-[#523e32] shadow-sm' : 'text-[#8d7568]'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all ${
              tab === 'register' ? 'bg-white text-[#523e32] shadow-sm' : 'text-[#8d7568]'
            }`}
          >
            สมัครสมาชิก
          </button>
          <button
            onClick={() => {
              soundManager.playPop();
              setTab('guest');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-fredoka font-bold transition-all ${
              tab === 'guest' ? 'bg-white text-[#523e32] shadow-sm' : 'text-[#8d7568]'
            }`}
          >
            เล่นแบบ Guest
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2 rounded-2xl text-xs font-itim">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="font-itim text-xs text-[#523e32] font-bold">ชื่อผู้ใช้ (Username)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border-2 border-[#ebd9c8] font-fredoka text-sm text-[#523e32] focus:outline-none focus:border-[#ffcad4]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-itim text-xs text-[#523e32] font-bold">รหัสผ่าน (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border-2 border-[#ebd9c8] font-fredoka text-sm text-[#523e32] focus:outline-none focus:border-[#ffcad4]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-jelly w-full py-3 rounded-2xl bg-[#ffcad4] text-[#523e32] font-fredoka font-bold text-sm border-2 border-[#523e32] flex items-center justify-center gap-2 shadow-md mt-2"
            >
              <LogIn size={16} />
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <label className="font-itim text-xs text-[#523e32] font-bold">ตั้งชื่อผู้ใช้ (Username)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="อย่างน้อย 3 ตัวอักษร..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border-2 border-[#ebd9c8] font-fredoka text-sm text-[#523e32] focus:outline-none focus:border-[#bde0fe]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-itim text-xs text-[#523e32] font-bold">ตั้งรหัสผ่าน (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 4 ตัวอักษร..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border-2 border-[#ebd9c8] font-fredoka text-sm text-[#523e32] focus:outline-none focus:border-[#bde0fe]"
              />
            </div>
            <div className="bg-[#fff6d6] p-3 rounded-2xl border border-[#ebd9c8] text-[11px] font-itim text-[#8d7568] flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
              <span>หลังกดสมัคร คุณจะได้เข้าสู่ <b>ห้องแต่งตัวแมว</b> เพื่อสร้างน้องแมวในฝันของคุณ!</span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-jelly w-full py-3 rounded-2xl bg-[#bde0fe] text-[#523e32] font-fredoka font-bold text-sm border-2 border-[#523e32] flex items-center justify-center gap-2 shadow-md mt-2"
            >
              <UserPlus size={16} />
              {isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก & ไปแต่งตัวแมว'}
            </button>
          </form>
        )}

        {/* GUEST MODE */}
        {tab === 'guest' && (
          <div className="space-y-4 py-2">
            <div className="bg-white p-4 rounded-2xl border-2 border-[#ebd9c8] space-y-2 text-center">
              <span className="text-3xl">🐱</span>
              <h4 className="font-fredoka font-bold text-sm text-[#523e32]">เข้าเล่นได้ทันทีแบบ Guest</h4>
              <p className="font-itim text-xs text-[#8d7568]">
                ไม่ต้องกรอกอีเมลหรือรหัสผ่าน คุณสามารถแต่งตัวน้องแมวและเดินเล่นใน Plaza ได้ทันที
              </p>
            </div>
            <button
              onClick={handleGuest}
              disabled={isLoading}
              className="btn-jelly w-full py-3 rounded-2xl bg-[#ffe5a3] text-[#523e32] font-fredoka font-bold text-sm border-2 border-[#523e32] flex items-center justify-center gap-2 shadow-md"
            >
              <Cat size={16} />
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เริ่มเล่นแบบ Guest ทันที 🚀'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
