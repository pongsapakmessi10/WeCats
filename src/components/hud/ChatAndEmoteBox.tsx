'use client';

import React, { useState } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { broadcastLiveChat } from '@/game/multiplayer/broadcast';

const EMOTE_LIST = ['💖', '🐾', '🐟', '💤', '⚡', '🌸', '👑', '❓', '🐱', '✨'];

export const ChatAndEmoteBox: React.FC = () => {
  const chatMessages = useCatStore((state) => state.chatMessages);
  const sendChatMessage = useCatStore((state) => state.sendChatMessage);
  const sendEmote = useCatStore((state) => state.sendEmote);

  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="w-80 max-w-[90vw] pointer-events-auto flex flex-col gap-2 z-30">
      
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
        
        {/* Chat Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-[#fffbf0] border-b-2 border-[#ebd9c8] flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={15} className="text-[#523e32]" />
            <span className="font-fredoka font-bold text-xs text-[#523e32]">Plaza Chat (คุยสด)</span>
          </div>
          <button className="text-[#8d7568]">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* Message Log */}
        {isExpanded && (
          <div className="p-3 h-48 overflow-y-auto space-y-2 font-itim text-xs">
            {chatMessages.map((msg) => {
              const isMe = msg.senderId === 'self' || msg.senderId === 'player-self';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-[#8d7568] px-1 font-bold">
                    {msg.senderName}
                  </span>
                  <div
                    className={`px-3 py-1.5 rounded-2xl max-w-[85%] border break-words ${
                      isMe
                        ? 'bg-[#ffcad4] text-[#523e32] border-[#ffb5c5] rounded-tr-none'
                        : 'bg-[#f0f8ff] text-[#523e32] border-[#cbe5f8] rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-2 bg-white flex items-center gap-1.5 border-t border-[#ebd9c8]">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="คุยกับเพื่อนแมว..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-[#fbf7f0] border border-[#ebd9c8] font-itim text-xs text-[#523e32] focus:outline-none focus:border-[#ffcad4]"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-[#ffcad4] text-[#523e32] border border-[#523e32] hover:bg-[#ffb5c5] active:scale-95 transition-all cursor-pointer"
          >
            <Send size={13} />
          </button>
        </form>

      </div>
    </div>
  );
};
