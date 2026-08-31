'use client';

import React, { useState } from 'react';
import { useCatStore, SHOP_CATALOG } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import confetti from 'canvas-confetti';
import {
  X,
  ShoppingBag,
  Sparkles,
  Check,
  Crown,
  Heart,
  Zap,
  Glasses,
  Feather,
  Shirt,
} from 'lucide-react';
import { ShopCategory, ShopItem } from '@/types/game';
import {
  BoutiqueBagIcon,
  FishCoinIcon,
} from '@/components/ui/GameIcons';

const CATEGORY_TABS: { id: ShopCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'ทั้งหมด', icon: <Sparkles size={14} className="text-amber-500" /> },
  { id: 'hats', label: 'หมวก & มงกุฎ', icon: <Crown size={14} className="text-amber-500" /> },
  { id: 'neck', label: 'ปลอกคอ & สร้อย', icon: <Heart size={14} className="text-pink-500" /> },
  { id: 'back', label: 'ปีก & ผ้าคลุม', icon: <Feather size={14} className="text-purple-500" /> },
  { id: 'face', label: 'แว่น & หนวด', icon: <Glasses size={14} className="text-blue-500" /> },
  { id: 'aura', label: 'ออร่าเวทมนตร์', icon: <Zap size={14} className="text-yellow-500" /> },
  { id: 'treats', label: 'ขนม & แคทนิป', icon: <FishCoinIcon size={14} /> },
];

export const CatShopModal: React.FC = () => {
  const isShopOpen = useCatStore((state) => state.isShopOpen);
  const setShopOpen = useCatStore((state) => state.setShopOpen);
  const fishCoins = useCatStore((state) => state.fishCoins);
  const unlockedItems = useCatStore((state) => state.unlockedItems);
  const buyShopItem = useCatStore((state) => state.buyShopItem);

  const [activeTab, setActiveTab] = useState<ShopCategory | 'all'>('all');
  const [successItem, setSuccessItem] = useState<string | null>(null);

  if (!isShopOpen) return null;

  const filteredItems = activeTab === 'all'
    ? SHOP_CATALOG
    : SHOP_CATALOG.filter((item) => item.category === activeTab);

  const handleBuy = (item: ShopItem) => {
    const success = buyShopItem(item);
    if (success) {
      soundManager.playSparkle();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ffe5a3', '#ffcad4', '#bde0fe'],
      });
      setSuccessItem(item.id);
      setTimeout(() => setSuccessItem(null), 1800);
    }
  };

  const getRarityBadge = (rarity: ShopItem['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return <span className="badge-pill bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-fredoka flex items-center gap-1"><Crown size={10} /> Legendary</span>;
      case 'epic':
        return <span className="badge-pill bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-fredoka flex items-center gap-1"><Sparkles size={10} /> Epic</span>;
      case 'rare':
        return <span className="badge-pill bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-fredoka flex items-center gap-1"><Sparkles size={10} /> Rare</span>;
      default:
        return <span className="badge-pill bg-emerald-100 text-emerald-900 text-[10px] font-fredoka">Common</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#fbf7f0] rounded-[36px] border-4 border-[#523e32] shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#ffe5a3] via-[#ffcad4] to-[#ffe5a3] border-b-3 border-[#ebd9c8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md border-2 border-[#523e32]">
              <BoutiqueBagIcon size={22} />
            </div>
            <div>
              <h2 className="font-fredoka font-bold text-xl sm:text-2xl text-[#523e32] tracking-tight flex items-center gap-2">
                ร้านค้าแฟชั่นแมว WeCats Boutique
              </h2>
              <p className="font-itim text-xs text-[#8d7568]">
                ช้อปปิ้งของแต่งตัวสุดน่ารักและขนมแมวเลียพรีเมียมด้วยเหรียญปลาทู
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Fish Coins Counter Pill */}
            <div className="flex items-center gap-1.5 bg-white/95 px-4 py-2 rounded-full border-2 border-[#523e32] shadow-sm">
              <FishCoinIcon size={18} />
              <span className="font-fredoka font-extrabold text-base text-[#523e32]">
                {fishCoins}
              </span>
              <span className="font-itim text-xs text-[#8d7568]">เหรียญ</span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                soundManager.playPop();
                setShopOpen(false);
              }}
              className="p-2 rounded-full hover:bg-white/60 text-[#523e32] transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="px-6 py-3 bg-[#f5ebd9] border-b-2 border-[#ebd9c8] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playPop();
                setActiveTab(tab.id);
              }}
              className={`btn-jelly px-4 py-2 rounded-full text-xs font-fredoka font-bold whitespace-nowrap flex items-center gap-1.5 transition-all border-2 ${
                activeTab === tab.id
                  ? 'bg-[#523e32] text-white border-[#523e32] shadow-md scale-105'
                  : 'bg-white text-[#523e32] border-[#ebd9c8] hover:bg-[#fff9f0]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SHOP ITEMS GRID */}
        <div className="p-6 overflow-y-auto max-h-[58vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isOwned = unlockedItems.includes(item.id) && item.category !== 'treats';
            const canAfford = fishCoins >= item.price;
            const isJustBought = successItem === item.id;

            return (
              <div
                key={item.id}
                className={`relative rounded-3xl p-4.5 border-3 transition-all flex flex-col justify-between gap-3 ${
                  isOwned
                    ? 'bg-[#f0f4f1] border-[#b7e4c7] opacity-80'
                    : 'bg-white border-[#ebd9c8] hover:border-[#ffcad4] hover:shadow-lg'
                }`}
              >
                {/* Top Badge & Price */}
                <div className="flex items-center justify-between">
                  {getRarityBadge(item.rarity)}
                  <div className="flex items-center gap-1 font-fredoka font-bold text-sm text-[#523e32]">
                    <FishCoinIcon size={14} />
                    <span>{item.price}</span>
                  </div>
                </div>

                {/* Center Icon & Title */}
                <div className="flex items-center gap-3 my-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ffe5a3]/40 to-[#ffcad4]/40 flex items-center justify-center text-3xl shadow-inner border border-[#ebd9c8] shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-fredoka font-bold text-sm text-[#523e32] leading-tight">
                      {item.name}
                    </h3>
                    <p className="font-itim text-[11px] text-[#8d7568] line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Buy Button */}
                <div>
                  {isOwned ? (
                    <div className="w-full py-2 rounded-2xl bg-[#caeedf] text-[#2b7a5a] font-fredoka font-bold text-xs flex items-center justify-center gap-1.5 border border-[#2b7a5a]/20">
                      <Check size={14} />
                      <span>เป็นเจ้าของแล้ว</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`btn-jelly w-full py-2.5 rounded-2xl font-fredoka font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all shadow-sm ${
                        canAfford
                          ? 'bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] border-[#523e32]'
                          : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {isJustBought ? (
                        <>
                          <Check size={15} className="text-green-700" />
                          <span className="text-green-800">ซื้อสำเร็จ! 🎉</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>{item.category === 'treats' ? 'ซื้อและป้อนทันที' : 'ซื้อเลย'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM TIP BAR */}
        <div className="px-6 py-3 bg-[#fbf7f0] border-t-2 border-[#ebd9c8] flex items-center justify-between text-xs font-itim text-[#8d7568]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <span>หาเหรียญปลาทูเพิ่มได้จากการดูแลน้องแมว, แปรงขน, ดื่มน้ำพุ, และทำกิจกรรมใน Plaza!</span>
          </div>
          <span className="font-fredoka font-bold text-[#523e32]">
            คอลเลกชัน: {unlockedItems.length} ชิ้น
          </span>
        </div>

      </div>
    </div>
  );
};
