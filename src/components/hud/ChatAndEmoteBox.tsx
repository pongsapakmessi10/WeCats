'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { MessageCircle, Send, ChevronDown, ChevronUp, X } from 'lucide-react';
import { broadcastLiveChat } from '@/game/multiplayer/broadcast';

const EMOTE_LIST = ['💖', '🐾', '🐟', '💤', '⚡', '🌸', '👑', '❓', '🐱', '✨'];

export const ChatAndEmoteBox: React.FC = () => {
  const chatMessages = useCatStore((state) => state.chatMessages);
  const currentRoom = useCatStore((state) => state.currentRoom);
  const unreadChatCount = useCatStore((state) => state.unreadChatCount);
  const isExpanded = useCatStore((state) => state.isChatExpanded);
  const setIsChatExpanded = useCatStore((state) => state.setIsChatExpanded);
  const clearUnreadChat = useCatStore((state) => state.clearUnreadChat);
  const sendChatMessage = useCatStore((state) => state.sendChatMessage);
  const sendEmote = useCatStore((state) => state.sendEmote);

  const [inputText, setInputText] = useState('');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat log on new message
  useEffect(() => {
    if (isExpanded || isMobileChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isExpanded, isMobileChatOpen]);

  const toggleExpanded = () => {
    soundManager.playPop();
    const nextState = !isExpanded;
    setIsChatExpanded(nextState);
    if (nextState) {
      clearUnreadChat();
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    soundManager.playPop();
    const text = inputText.trim();
    sendChatMessage(text);
    broadcastLiveChat(text);
    setInputText('');
  };

  const handleEmoteClick = (emote: string) => {
    soundManager.playPop();
    sendEmote(emote);
    broadcastLiveChat(undefined, emote);
  };

  return (
    <>
      {/* 📱 MOBILE FLOATING CHAT BUTTON & BOTTOM SHEET (< lg screens) */}
      <div className="fixed left-4 bottom-36 z-40 flex lg:hidden pointer-events-auto">
        {/* Floating Round Chat Button */}
        <button
          onClick={() => {
            soundManager.playPop();
            setIsMobileChatOpen(true);
            clearUnreadChat();
          }}
          className="btn-jelly relative w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border-3 border-[#523e32] shadow-xl flex items-center justify-center text-[#523e32]"
          title="เปิดแชทห้อง"
        >
          <MessageCircle size={20} />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#ff4d6d] text-white text-[9px] font-fredoka font-bold animate-bounce shadow-md">
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* Mobile Chat Bottom Sheet Modal */}
        {isMobileChatOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs p-3 pb-6 animate-in fade-in">
            <div className="absolute inset-0" onClick={() => setIsMobileChatOpen(false)} />
            
            <div className="relative w-full max-w-md bg-[#fff8eb] rounded-3xl border-3 border-[#523e32] shadow-2xl overflow-hidden flex flex-col max-h-[70vh] z-10 animate-in slide-in-from-bottom duration-200">
              
              {/* Header */}
              <div className="px-4 py-2.5 bg-[#fff3bf] border-b-2 border-[#ebd9c8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-[#523e32]" />
                  <span className="font-fredoka font-bold text-xs text-[#523e32]">
                    แชทสด • {currentRoom.name}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="p-1 rounded-full bg-[#ebd9c8]/50 hover:bg-[#ebd9c8] text-[#523e32]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Emote Quick Bar */}
              <div className="bg-white/80 px-3 py-1.5 border-b border-[#ebd9c8] flex items-center justify-between gap-1 overflow-x-auto">
                {EMOTE_LIST.map((emote) => (
                  <button
                    key={emote}
                    onClick={() => handleEmoteClick(emote)}
                    className="hover:scale-125 active:scale-95 transition-transform text-lg p-1"
                  >
                    {emote}
                  </button>
                ))}
              </div>

              {/* Message Log */}
              <div className="p-3 flex-1 overflow-y-auto space-y-2 font-itim text-xs bg-[#fbf7f0]/60 min-h-[160px]">
                {chatMessages.map((msg) => {
                  const isMe = msg.senderId === 'self' || msg.senderId === 'player-self';
                  const isSystem = msg.senderId === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center py-1">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#ebd9c8]/60 text-[#8d7568] text-[10px] font-itim">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-[#8d7568] px-1 font-bold">{msg.senderName}</span>
                      <div
                        className={`px-3 py-1.5 rounded-2xl max-w-[85%] border break-words shadow-sm ${
                          isMe
                            ? 'bg-[#ffcad4] text-[#523e32] border-[#ffb5c5] rounded-tr-none'
                            : 'bg-white text-[#523e32] border-[#ebd9c8] rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-2 bg-white flex items-center gap-1.5 border-t border-[#ebd9c8]">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`พิมพ์คุยในห้อง ${currentRoom.name}...`}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#fbf7f0] border border-[#ebd9c8] font-itim text-xs text-[#523e32] focus:outline-none focus:border-[#ffcad4]"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#ffcad4] text-[#523e32] border border-[#523e32] active:scale-95 shadow-sm"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 🖥️ DESKTOP REGULAR CHAT BOX (>= lg screens) */}
      <div className="hidden lg:flex w-80 max-w-[90vw] pointer-events-auto flex-col gap-2 z-30 animate-in fade-in">
        {/* Quick Emote Bar */}
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-[#ebd9c8] shadow-md flex items-center justify-between gap-1 overflow-x-auto">
          {EMOTE_LIST.map((emote) => (
            <button
              key={emote}
              onClick={() => handleEmoteClick(emote)}
              className="hover:scale-125 active:scale-95 transition-transform text-lg p-1 cursor-pointer"
              title={`ส่ง Emote ${emote}`}
            >
              {emote}
            </button>
          ))}
        </div>

        {/* Chat Box Body */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border-3 border-[#ebd9c8] shadow-xl overflow-hidden flex flex-col">
          {/* Chat Header with Real-Time Unread Badge & Current Room Name */}
          <div
            onClick={toggleExpanded}
            className="px-4 py-2 bg-[#fffbf0] border-b-2 border-[#ebd9c8] flex items-center justify-between cursor-pointer select-none hover:bg-[#fcf5e5] transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageCircle size={15} className="text-[#523e32]" />
              </div>
              <span className="font-fredoka font-bold text-xs text-[#523e32] truncate max-w-[140px]">
                Chat • {currentRoom.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isExpanded && unreadChatCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#ff4d6d] text-white text-[10px] font-fredoka font-bold animate-bounce shadow-md flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
              <button className="text-[#8d7568] cursor-pointer">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
          </div>

          {/* Message Log */}
          {isExpanded && (
            <div className="p-3 h-48 overflow-y-auto space-y-2 font-itim text-xs bg-[#fbf7f0]/50">
              {chatMessages.map((msg) => {
                const isMe = msg.senderId === 'self' || msg.senderId === 'player-self';
                const isSystem = msg.senderId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center py-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#ebd9c8]/60 text-[#8d7568] text-[10px] font-itim">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-[#8d7568] px-1 font-bold">{msg.senderName}</span>
                    <div
                      className={`px-3 py-1.5 rounded-2xl max-w-[85%] border break-words shadow-sm ${
                        isMe
                          ? 'bg-[#ffcad4] text-[#523e32] border-[#ffb5c5] rounded-tr-none'
                          : 'bg-white text-[#523e32] border-[#ebd9c8] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-2 bg-white flex items-center gap-1.5 border-t border-[#ebd9c8]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => {
                if (!isExpanded) {
                  setIsChatExpanded(true);
                  clearUnreadChat();
                }
              }}
              placeholder={`คุยในห้อง ${currentRoom.name}...`}
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#fbf7f0] border border-[#ebd9c8] font-itim text-xs text-[#523e32] focus:outline-none focus:border-[#ffcad4]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#ffcad4] text-[#523e32] border border-[#523e32] hover:bg-[#ffb5c5] active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
