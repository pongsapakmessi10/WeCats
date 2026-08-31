'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { X, Send, MessageCircle } from 'lucide-react';
import { CatPawIcon } from '@/components/ui/GameIcons';

export const DirectChatModal: React.FC = () => {
  const isDirectChatOpen = useCatStore((state) => state.isDirectChatOpen);
  const setDirectChatOpen = useCatStore((state) => state.setDirectChatOpen);
  const activeFriend = useCatStore((state) => state.activeDirectChatFriend);
  const directMessages = useCatStore((state) => state.directMessages);
  const sendDirectMessage = useCatStore((state) => state.sendDirectMessage);
  const myCat = useCatStore((state) => state.myCat);

  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const friendId = activeFriend?.id || '';
  const messageList = friendId ? directMessages[friendId] || [] : [];

  useEffect(() => {
    if (isDirectChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageList, isDirectChatOpen]);

  if (!isDirectChatOpen || !activeFriend) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    soundManager.playPop();
    const text = inputText.trim();
    sendDirectMessage(friendId, text);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#fbf7f0] rounded-[32px] border-4 border-[#523e32] shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#ffcad4] via-[#bde0fe] to-[#ffcad4] border-b-3 border-[#ebd9c8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border-2 border-[#523e32] shadow-sm">
              <CatPawIcon size={20} color="#523e32" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fredoka font-bold text-lg text-[#523e32]">
                  {activeFriend.catName}
                </h3>
                <span className="badge-pill bg-emerald-100 text-emerald-800 text-[10px] font-fredoka">
                  แชท 1-to-1 🔒
                </span>
              </div>
              <p className="font-itim text-xs text-[#8d7568]">
                ข้อความส่วนตัวเห็นเฉพาะคุณและ {activeFriend.catName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              setDirectChatOpen(false);
            }}
            className="p-2 rounded-full hover:bg-white/60 text-[#523e32] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* MESSAGE HISTORY */}
        <div className="p-4 h-72 overflow-y-auto space-y-2.5 font-itim text-xs bg-[#fffbf0]/60">
          {messageList.length === 0 ? (
            <div className="text-center py-16 text-[#8d7568] space-y-2">
              <MessageCircle size={28} className="mx-auto text-[#d4a373] opacity-60" />
              <p>ยังไม่มีข้อความส่วนตัว ทักทาย {activeFriend.catName} ได้เลย! 🐾</p>
            </div>
          ) : (
            messageList.map((msg) => {
              const isMe = msg.fromPeerId === 'self';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-[#8d7568] px-1 font-bold">
                    {isMe ? myCat.name : msg.senderName}
                  </span>
                  <div
                    className={`px-3.5 py-2 rounded-2xl max-w-[80%] border break-words shadow-sm ${
                      isMe
                        ? 'bg-[#ffcad4] text-[#523e32] border-[#ffb5c5] rounded-tr-none font-medium'
                        : 'bg-white text-[#523e32] border-[#ebd9c8] rounded-tl-none font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* CHAT INPUT */}
        <form onSubmit={handleSend} className="p-3 bg-white flex items-center gap-2 border-t-2 border-[#ebd9c8]">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`พิมพ์ข้อความลับถึง ${activeFriend.catName}...`}
            className="flex-1 px-4 py-2 rounded-2xl bg-[#fbf7f0] border border-[#ebd9c8] font-itim text-xs text-[#523e32] focus:outline-none focus:border-[#ffcad4]"
            autoFocus
          />
          <button
            type="submit"
            className="p-2.5 rounded-2xl bg-[#ffcad4] hover:bg-[#ffb5c5] text-[#523e32] border-2 border-[#523e32] active:scale-95 transition-all cursor-pointer shadow-sm flex items-center justify-center"
          >
            <Send size={15} />
          </button>
        </form>

      </div>
    </div>
  );
};
