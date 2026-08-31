'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCatStore } from '@/store/catStore';
import { getPusherClient } from '@/lib/pusherClient';
import { soundManager } from '@/audio/soundManager';
import { OnlineCat, CatCustomization, CatStats } from '@/types/game';

interface MemberInfo {
  id: string;
  info: {
    id: string;
    username: string;
    isGuest: boolean;
  };
}

export function useMultiplayer(rawChannelName: string = 'presence-public-sakura') {
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);
  const setOnlineCats = useCatStore((state) => state.setOnlineCats);
  const setNotification = useCatStore((state) => state.setNotification);

  // Keep references to latest myCat & stats without causing subscription re-triggers
  const myCatRef = useRef(myCat);
  const statsRef = useRef(stats);
  useEffect(() => {
    myCatRef.current = myCat;
    statsRef.current = stats;
  }, [myCat, stats]);

  const lastMoveSentRef = useRef<number>(0);
  const myIdRef = useRef<string>(`cat_${Math.random().toString(36).substring(2, 9)}`);
  const channelRef = useRef<any>(null);

  // Sanitize channel name for Pusher compliance (alphanumeric, -, _)
  const channelName = rawChannelName.startsWith('presence-')
    ? `presence-${rawChannelName.replace(/^presence-/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`
    : `presence-${rawChannelName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  // Broadcast event via backend route
  const broadcastEvent = useCallback(
    async (event: string, data: any) => {
      const pusher = getPusherClient();
      const socketId = pusher?.connection?.socket_id;

      try {
        await fetch('/api/pusher/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: channelName,
            event,
            data: {
              ...data,
              senderId: myIdRef.current,
            },
            socketId,
          }),
        });
      } catch {}
    },
    [channelName]
  );

  // Connect to Pusher Presence Channel ONLY when channelName changes
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    // Reset online cats list when entering new channel
    setOnlineCats([]);

    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // 1. Subscription succeeded: collect existing members
    channel.bind('pusher:subscription_succeeded', (members: any) => {
      myIdRef.current = members.myID || myIdRef.current;
      const initialCats: OnlineCat[] = [];

      members.each((member: MemberInfo) => {
        if (member.id !== myIdRef.current) {
          initialCats.push({
            id: member.id,
            customization: {
              ...myCatRef.current,
              name: member.info?.username || 'เพื่อนแมว',
            },
            stats: statsRef.current,
            x: 650 + (Math.random() - 0.5) * 120,
            y: 450 + (Math.random() - 0.5) * 100,
            direction: 'down',
            behavior: 'idle',
            lastUpdated: Date.now(),
          });
        }
      });

      setOnlineCats(initialCats);

      // Announce myself to all members in this channel
      broadcastEvent('cat-joined', {
        customization: myCatRef.current,
        stats: statsRef.current,
        isGreeting: true,
      });
    });

    // 2. Member added
    channel.bind('pusher:member_added', (member: MemberInfo) => {
      if (member.id === myIdRef.current) return;

      const newCat: OnlineCat = {
        id: member.id,
        customization: {
          ...myCatRef.current,
          name: member.info?.username || 'เพื่อนแมวตัวใหม่',
        },
        stats: statsRef.current,
        x: 700 + (Math.random() - 0.5) * 60,
        y: 480 + (Math.random() - 0.5) * 60,
        direction: 'down',
        behavior: 'idle',
        lastUpdated: Date.now(),
      };

      setOnlineCats((prev: OnlineCat[]) => [...prev.filter((c: OnlineCat) => c.id !== member.id), newCat]);
      setNotification(`🐾 ${member.info?.username || 'เพื่อนแมว'} เข้ามาในห้อง!`);

      // Greet back so they have our full customized avatar
      broadcastEvent('cat-joined', {
        customization: myCatRef.current,
        stats: statsRef.current,
        isGreeting: false,
      });
    });

    // 3. Member removed
    channel.bind('pusher:member_removed', (member: MemberInfo) => {
      setOnlineCats((prev: OnlineCat[]) => prev.filter((c: OnlineCat) => c.id !== member.id));
    });

    // 4. Cat Joined Handshake
    channel.bind(
      'cat-joined',
      (data: { senderId: string; customization: CatCustomization; stats: CatStats; isGreeting?: boolean }) => {
        if (data.senderId === myIdRef.current) return;

        setOnlineCats((prev: OnlineCat[]) => {
          const existing = prev.find((c: OnlineCat) => c.id === data.senderId);
          if (existing) {
            return prev.map((c: OnlineCat) =>
              c.id === data.senderId
                ? { ...c, customization: data.customization, stats: data.stats }
                : c
            );
          }
          return [
            ...prev,
            {
              id: data.senderId,
              customization: data.customization,
              stats: data.stats,
              x: 700 + (Math.random() - 0.5) * 60,
              y: 480 + (Math.random() - 0.5) * 60,
              direction: 'down',
              behavior: 'idle',
              lastUpdated: Date.now(),
            },
          ];
        });

        // If they just joined and greeted us, reply back with our profile
        if (data.isGreeting) {
          broadcastEvent('cat-joined', {
            customization: myCatRef.current,
            stats: statsRef.current,
            isGreeting: false,
          });
        }
      }
    );

    // 5. Cat Movement
    channel.bind(
      'cat-move',
      (data: {
        senderId: string;
        x: number;
        y: number;
        direction: 'up' | 'down' | 'left' | 'right';
        behavior: string;
        isMoving: boolean;
      }) => {
        if (data.senderId === myIdRef.current) return;

        setOnlineCats((prev: OnlineCat[]) => {
          const existing = prev.find((c: OnlineCat) => c.id === data.senderId);
          if (!existing) {
            return [
              ...prev,
              {
                id: data.senderId,
                customization: myCatRef.current,
                stats: statsRef.current,
                x: data.x,
                y: data.y,
                direction: data.direction,
                behavior: data.behavior as any,
                isMoving: data.isMoving,
                lastUpdated: Date.now(),
              },
            ];
          }

          return prev.map((c: OnlineCat) =>
            c.id === data.senderId
              ? {
                  ...c,
                  x: data.x,
                  y: data.y,
                  direction: data.direction,
                  behavior: data.behavior as any,
                  isMoving: data.isMoving,
                  lastUpdated: Date.now(),
                }
              : c
          );
        });
      }
    );

    // 6. Cat Chat / Emotes
    channel.bind('cat-chat', (data: { senderId: string; text?: string; emote?: string }) => {
      if (data.senderId === myIdRef.current) return;

      soundManager.playPop();

      setOnlineCats((prev: OnlineCat[]) =>
        prev.map((c: OnlineCat) =>
          c.id === data.senderId
            ? {
                ...c,
                chatMessage: data.text || null,
                currentEmote: data.emote || null,
              }
            : c
        )
      );

      // Auto clear bubble after 4.5 seconds
      setTimeout(() => {
        setOnlineCats((prev: OnlineCat[]) =>
          prev.map((c: OnlineCat) =>
            c.id === data.senderId
              ? {
                  ...c,
                  chatMessage: null,
                  currentEmote: null,
                }
              : c
          )
        );
      }, 4500);
    });

    // 7. Friend Request / Treat Gifting
    channel.bind('cat-friend-action', (data: { senderId: string; senderName: string; type: 'request' | 'treat' }) => {
      if (data.senderId === myIdRef.current) return;

      if (data.type === 'treat') {
        soundManager.playSparkle();
        setNotification(`🍣 ได้รับขนมแมวเลียจาก ${data.senderName}! (+15 แต้มมิตรภาพ)`);
      } else {
        soundManager.playPurr();
        setNotification(`💖 ${data.senderName} ส่งคำขอเป็นเพื่อนกับคุณ!`);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [channelName, setOnlineCats, setNotification, broadcastEvent]);

  // Function to broadcast local player position
  const sendMyPosition = useCallback(
    (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right', isMoving: boolean, behavior: string = 'idle') => {
      const now = Date.now();
      // Throttle: send every 60ms when moving, or immediately when stopping
      if (!isMoving || now - lastMoveSentRef.current >= 60) {
        lastMoveSentRef.current = now;
        broadcastEvent('cat-move', {
          x,
          y,
          direction,
          isMoving,
          behavior,
        });
      }
    },
    [broadcastEvent]
  );

  // Function to broadcast chat or emote
  const sendMyChat = useCallback(
    (text?: string, emote?: string) => {
      broadcastEvent('cat-chat', {
        text,
        emote,
      });
    },
    [broadcastEvent]
  );

  // Function to broadcast friend action
  const sendFriendAction = useCallback(
    (type: 'request' | 'treat') => {
      broadcastEvent('cat-friend-action', {
        senderName: myCatRef.current.name,
        type,
      });
    },
    [broadcastEvent]
  );

  return {
    sendMyPosition,
    sendMyChat,
    sendFriendAction,
  };
}
