'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCatStore } from '@/store/catStore';
import { soundManager } from '@/audio/soundManager';
import { OnlineCat, CatCustomization, CatStats } from '@/types/game';
import type { DataConnection, Peer as PeerType } from 'peerjs';
import { registerP2PSender, unregisterP2PSender } from './p2pManager';

const FALLBACK_DEFAULT_CAT: CatCustomization = {
  name: 'เพื่อนแมว',
  gender: 'boy',
  breed: 'orange_tabby',
  bodyType: 'chonky',
  earType: 'pointed',
  tailType: 'fluffy',
  eyeType: 'sparkle',
  eyeColorLeft: '#2ec4b6',
  eyeColorRight: '#ffbf69',
  baseColor: '#ffa94d',
  patternType: 'tabby',
  patternColor: '#d97706',
  snoutColor: '#ffffff',
  pawColor: '#ffffff',
  bellyColor: '#fff3bf',
  accessoryHead: 'straw_hat',
  accessoryNeck: 'gold_bell',
  accessoryBack: 'backpack',
  accessoryFace: 'cute_blush',
  aura: 'sparkles',
  personality: 'chaotic',
};

// Helper to get local player's latest real-time coordinates
function getCurrentPlayerPos(): { x: number; y: number; direction: 'up' | 'down' | 'left' | 'right' } {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('wecats_player_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return {
            x: parsed.x,
            y: parsed.y,
            direction: parsed.dir || 'down',
          };
        }
      }
    } catch {}
  }
  return { x: 700, y: 480, direction: 'down' };
}

export function useMultiplayer(rawRoomId: string = 'public-sakura') {
  const setOnlineCats = useCatStore((state) => state.setOnlineCats);
  const onlineCats = useCatStore((state) => state.onlineCats);
  const setNotification = useCatStore((state) => state.setNotification);
  const myCat = useCatStore((state) => state.myCat);
  const stats = useCatStore((state) => state.stats);

  const roomId = rawRoomId.replace(/^presence-/, '');

  // Keep latest mutable references
  const myCatRef = useRef<CatCustomization>(myCat);
  const statsRef = useRef<CatStats>(stats);
  const peerInstanceRef = useRef<PeerType | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const myPeerIdRef = useRef<string>('');
  const lastMoveSentRef = useRef<number>(0);
  const wasMovingRef = useRef<boolean>(false);

  useEffect(() => {
    myCatRef.current = myCat;
    statsRef.current = stats;
  }, [myCat, stats]);

  // Persist online cats cache to prevent pop-in on refresh
  useEffect(() => {
    if (onlineCats.length > 0) {
      try {
        localStorage.setItem('wecats_cached_online_cats', JSON.stringify(onlineCats));
      } catch {}
    }
  }, [onlineCats]);

  // Handle incoming data packets from a peer
  const handleIncomingPacket = useCallback(
    (packet: any, senderPeerId: string) => {
      if (!packet || typeof packet !== 'object') return;

      const type = packet.type;

      // 1. Movement Sync
      if (type === 'cat-move') {
        const incomingName = packet.customization?.name;
        if (incomingName && incomingName === myCatRef.current.name) {
          if (typeof window !== 'undefined' && typeof packet.x === 'number' && typeof packet.y === 'number') {
            window.dispatchEvent(
              new CustomEvent('wecats-self-pos-sync', {
                detail: {
                  x: packet.x,
                  y: packet.y,
                  direction: packet.direction || 'down',
                  isMoving: packet.isMoving,
                  behavior: packet.behavior || 'idle',
                },
              })
            );
          }
          return;
        }

        setOnlineCats((prev: OnlineCat[]) => {
          const matchIndex = prev.findIndex(
            (c: OnlineCat) => c.id === senderPeerId || (incomingName && c.customization.name === incomingName)
          );

          if (matchIndex === -1) {
            return [
              ...prev,
              {
                id: senderPeerId,
                customization: packet.customization || FALLBACK_DEFAULT_CAT,
                stats: statsRef.current,
                x: packet.x,
                y: packet.y,
                direction: packet.direction,
                behavior: packet.behavior,
                isMoving: packet.isMoving,
                lastUpdated: Date.now(),
              },
            ];
          }

          const updated = [...prev];
          updated[matchIndex] = {
            ...updated[matchIndex],
            id: senderPeerId,
            customization: packet.customization || updated[matchIndex].customization,
            x: packet.x,
            y: packet.y,
            direction: packet.direction,
            behavior: packet.behavior,
            isMoving: packet.isMoving,
            lastUpdated: Date.now(),
          };
          return updated;
        });
      }

      // 2. Cat Joined / Handshake (Syncs Appearance + Real Coordinates seamlessly)
      else if (type === 'cat-joined') {
        const posX = typeof packet.x === 'number' ? packet.x : 700;
        const posY = typeof packet.y === 'number' ? packet.y : 480;
        const posDir = packet.direction || 'down';
        const incomingCatName = packet.customization?.name;

        if (incomingCatName && incomingCatName === myCatRef.current.name) return;

        setOnlineCats((prev: OnlineCat[]) => {
          // Check if peer already exists by ID OR by same cat name (seamless reconnect)
          const existingIndex = prev.findIndex(
            (c: OnlineCat) => c.id === senderPeerId || (incomingCatName && c.customization.name === incomingCatName)
          );

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              id: senderPeerId,
              customization: packet.customization || updated[existingIndex].customization,
              stats: packet.stats || updated[existingIndex].stats,
              x: typeof packet.x === 'number' ? packet.x : updated[existingIndex].x,
              y: typeof packet.y === 'number' ? packet.y : updated[existingIndex].y,
              direction: packet.direction || updated[existingIndex].direction,
              lastUpdated: Date.now(),
            };
            return updated;
          }

          return [
            ...prev,
            {
              id: senderPeerId,
              customization: packet.customization || FALLBACK_DEFAULT_CAT,
              stats: packet.stats || statsRef.current,
              x: posX,
              y: posY,
              direction: posDir,
              behavior: 'idle',
              lastUpdated: Date.now(),
            },
          ];
        });

        // Reply back with our customization AND our current real coordinates
        if (packet.isGreeting) {
          const conn = connectionsRef.current.get(senderPeerId);
          if (conn && conn.open) {
            const myPos = getCurrentPlayerPos();
            conn.send({
              type: 'cat-joined',
              customization: myCatRef.current,
              stats: statsRef.current,
              x: myPos.x,
              y: myPos.y,
              direction: myPos.direction,
              isGreeting: false,
            });
          }
        }
      }

      // 3. Chat / Emote
      else if (type === 'cat-chat') {
        // Strict Room Isolation Guard: Discard packet if it belongs to another room
        if (packet.roomId && packet.roomId !== roomId) return;

        soundManager.playPop();
        const senderCat = useCatStore.getState().onlineCats.find((c) => c.id === senderPeerId);
        const senderName = packet.senderName || senderCat?.customization?.name || 'เพื่อนแมว';

        if (packet.text) {
          useCatStore.getState().receiveChatMessage(senderPeerId, senderName, packet.text, roomId);
        } else if (packet.emote) {
          useCatStore.getState().receiveChatMessage(senderPeerId, senderName, packet.emote, roomId);
        }

        setOnlineCats((prev: OnlineCat[]) =>
          prev.map((c: OnlineCat) =>
            c.id === senderPeerId
              ? {
                  ...c,
                  chatMessage: packet.text || null,
                  currentEmote: packet.emote || null,
                }
              : c
          )
        );

        setTimeout(() => {
          setOnlineCats((prev: OnlineCat[]) =>
            prev.map((c: OnlineCat) =>
              c.id === senderPeerId
                ? {
                    ...c,
                    chatMessage: null,
                    currentEmote: null,
                  }
                : c
            )
          );
        }, 4500);
      }

      // 4. Friend Actions (Treats, Requests, Accepted)
      else if (type === 'cat-friend-action') {
        if (packet.actionType === 'treat') {
          soundManager.playSparkle();
          setNotification(`🍣 ได้รับขนมแมวเลียจาก ${packet.senderName}! (+15 แต้มมิตรภาพ)`);
        } else {
          soundManager.playPurr();
          setNotification(`💖 ${packet.senderName} ส่งคำขอเป็นเพื่อนกับคุณ!`);
        }
      }

      // 4.1 Real-Time Friend Request
      else if (type === 'friend-request') {
        if (!packet.targetPeerId || packet.targetPeerId === myPeerIdRef.current) {
          soundManager.playSparkle();
          const req = {
            id: `req-${Date.now()}-${senderPeerId}`,
            senderId: senderPeerId,
            senderName: packet.senderName || 'เพื่อนแมว',
            senderCustomization: packet.senderCustomization || FALLBACK_DEFAULT_CAT,
            timestamp: Date.now(),
          };
          useCatStore.getState().receiveFriendRequest(req);
          setNotification(`💌 ${packet.senderName || 'เพื่อนแมว'} ส่งคำขอเป็นเพื่อนมา! 🐾`);
        }
      }

      // 4.2 Real-Time Friend Accepted
      else if (type === 'friend-accepted') {
        if (!packet.targetPeerId || packet.targetPeerId === myPeerIdRef.current) {
          soundManager.playSparkle();
          const friendData = {
            id: senderPeerId,
            username: packet.senderName || 'เพื่อนแมว',
            catName: packet.senderName || 'เพื่อนแมว',
            breed: packet.senderCustomization?.breed || 'orange_tabby',
            customization: packet.senderCustomization,
            isOnline: true,
            friendshipPoints: 20,
          };
          useCatStore.getState().addFriendFromPeer(friendData);
          setNotification(`🎉 ${packet.senderName || 'เพื่อนแมว'} ตอบรับคำขอเป็นเพื่อนแล้ว! 💕`);
        }
      }

      // 4.3 Real-Time 1-to-1 Direct Message
      else if (type === 'direct-message') {
        if (packet.toPeerId === myPeerIdRef.current || !packet.toPeerId) {
          soundManager.playPop();
          const dm = {
            id: `dm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            fromPeerId: senderPeerId,
            toPeerId: myPeerIdRef.current,
            senderName: packet.senderName || 'เพื่อนแมว',
            text: packet.text,
            timestamp: Date.now(),
          };
          useCatStore.getState().receiveDirectMessage(dm);
          setNotification(`💬 ข้อความส่วนตัวจาก ${packet.senderName}: "${packet.text}"`);
        }
      }

      // 5. Room Deleted Notification (Real-time kick to Sakura Plaza)
      else if (type === 'room-deleted') {
        soundManager.playPop();
        useCatStore.getState().kickToSakuraPlaza(packet.roomName);
      }
    },
    [setOnlineCats, setNotification]
  );

  // Setup connection event handlers for a DataConnection
  const setupConnection = useCallback(
    (
      conn: DataConnection,
      initialCustomization?: Partial<CatCustomization>,
      initialPos?: { x?: number; y?: number; direction?: 'up' | 'down' | 'left' | 'right' }
    ) => {
      const targetPeerId = conn.peer;

      conn.on('open', () => {
        connectionsRef.current.set(targetPeerId, conn);

        const initX = typeof initialPos?.x === 'number' ? initialPos.x : 700;
        const initY = typeof initialPos?.y === 'number' ? initialPos.y : 480;
        const initDir = initialPos?.direction || 'down';

        // Prevent adding clone of own cat
        const incomingName = initialCustomization?.name;
        if (incomingName && incomingName === myCatRef.current.name) {
          return;
        }

        // Add or update online cats seamlessly
        setOnlineCats((prev: OnlineCat[]) => {
          const matchIndex = prev.findIndex(
            (c: OnlineCat) => c.id === targetPeerId || (incomingName && c.customization.name === incomingName)
          );

          if (matchIndex !== -1) {
            const updated = [...prev];
            updated[matchIndex] = {
              ...updated[matchIndex],
              id: targetPeerId,
              customization: {
                ...updated[matchIndex].customization,
                ...initialCustomization,
              },
              x: typeof initialPos?.x === 'number' ? initialPos.x : updated[matchIndex].x,
              y: typeof initialPos?.y === 'number' ? initialPos.y : updated[matchIndex].y,
              direction: initialPos?.direction || updated[matchIndex].direction,
              lastUpdated: Date.now(),
            };
            return updated;
          }

          return [
            ...prev,
            {
              id: targetPeerId,
              customization: {
                ...FALLBACK_DEFAULT_CAT,
                ...initialCustomization,
              },
              stats: statsRef.current,
              x: initX,
              y: initY,
              direction: initDir,
              behavior: 'idle',
              lastUpdated: Date.now(),
            },
          ];
        });

        // Send our cat appearance handshake with our exact position
        const myPos = getCurrentPlayerPos();
        conn.send({
          type: 'cat-joined',
          customization: myCatRef.current,
          stats: statsRef.current,
          x: myPos.x,
          y: myPos.y,
          direction: myPos.direction,
          isGreeting: true,
        });
      });

      conn.on('data', (data) => {
        handleIncomingPacket(data, targetPeerId);
      });

      conn.on('close', () => {
        connectionsRef.current.delete(targetPeerId);
        // Smooth 2.5-second grace period before removal so reload doesn't cause blinking
        setTimeout(() => {
          if (!connectionsRef.current.has(targetPeerId)) {
            setOnlineCats((prev: OnlineCat[]) => prev.filter((c: OnlineCat) => c.id !== targetPeerId));
          }
        }, 2500);
      });

      conn.on('error', () => {
        connectionsRef.current.delete(targetPeerId);
        setOnlineCats((prev: OnlineCat[]) => prev.filter((c: OnlineCat) => c.id !== targetPeerId));
      });
    },
    [handleIncomingPacket, setOnlineCats]
  );

  // Initialize WebRTC Peer and Room Discovery
  useEffect(() => {
    let isCancelled = false;
    let heartbeatTimer: NodeJS.Timeout;

    // Restore cached online cats on refresh so there is 0ms pop-in (excluding self)
    try {
      const cached = localStorage.getItem('wecats_cached_online_cats');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const myName = myCatRef.current.name;
          setOnlineCats(parsed.filter((c: OnlineCat) => c.customization?.name !== myName));
        }
      }
    } catch {}

    connectionsRef.current.clear();

    const initWebRTC = async () => {
      const { default: Peer } = await import('peerjs');

      if (isCancelled) return;

      // Unique peer ID for this tab session
      const generatedPeerId = `wecat_${Math.random().toString(36).substring(2, 10)}`;
      myPeerIdRef.current = generatedPeerId;

      const peer = new Peer(generatedPeerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
      });

      peerInstanceRef.current = peer;

      peer.on('open', async (id) => {
        if (isCancelled) return;

        const myPos = getCurrentPlayerPos();

        // Register in Room Coordinator with our exact current coordinates
        try {
          const res = await fetch('/api/p2p/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              peerId: id,
              roomId,
              catCustomization: myCatRef.current,
              pos: myPos,
            }),
          });

          const data = await res.json();
          if (data.peers && Array.isArray(data.peers)) {
            data.peers.forEach(
              (p: {
                peerId: string;
                customization?: CatCustomization;
                x?: number;
                y?: number;
                direction?: 'up' | 'down' | 'left' | 'right';
              }) => {
                if (p.peerId !== id && !connectionsRef.current.has(p.peerId)) {
                  const conn = peer.connect(p.peerId, { reliable: true });
                  setupConnection(conn, p.customization, { x: p.x, y: p.y, direction: p.direction });
                }
              }
            );
          }
        } catch (e) {
          console.warn('P2P Join warning:', e);
        }

        // Start 6-second heartbeat to discover new peers & keep coordinates synced
        heartbeatTimer = setInterval(async () => {
          if (isCancelled) return;
          try {
            const currentPos = getCurrentPlayerPos();
            const hbRes = await fetch('/api/p2p/heartbeat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                peerId: id,
                roomId,
                catCustomization: myCatRef.current,
                pos: currentPos,
              }),
            });

            const hbData = await hbRes.json();

            if (hbData?.roomDeleted) {
              soundManager.playPop();
              const currentRoomName = useCatStore.getState().currentRoom.name;
              useCatStore.getState().kickToSakuraPlaza(currentRoomName);
              return;
            }

            if (hbData.peers && Array.isArray(hbData.peers)) {
              hbData.peers.forEach(
                (p: {
                  peerId: string;
                  customization?: CatCustomization;
                  x?: number;
                  y?: number;
                  direction?: 'up' | 'down' | 'left' | 'right';
                }) => {
                  if (p.peerId !== id && !connectionsRef.current.has(p.peerId)) {
                    const conn = peer.connect(p.peerId, { reliable: true });
                    setupConnection(conn, p.customization, { x: p.x, y: p.y, direction: p.direction });
                  }
                }
              );
            }
          } catch {}
        }, 6000);
      });

      // Handle incoming connection from other peers
      peer.on('connection', (conn) => {
        setupConnection(conn);
      });

      peer.on('error', (err) => {
        console.warn('Peer error:', err);
      });
    };

    initWebRTC();

    // Clean up on leave/room switch
    const handleBeforeUnload = () => {
      if (myPeerIdRef.current) {
        navigator.sendBeacon('/api/p2p/leave', JSON.stringify({ peerId: myPeerIdRef.current }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isCancelled = true;
      clearInterval(heartbeatTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (myPeerIdRef.current) {
        fetch('/api/p2p/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId: myPeerIdRef.current }),
        }).catch(() => {});
      }

      connectionsRef.current.forEach((conn) => conn.close());
      connectionsRef.current.clear();

      if (peerInstanceRef.current) {
        peerInstanceRef.current.destroy();
        peerInstanceRef.current = null;
      }

      unregisterP2PSender();
    };
  }, [roomId, setOnlineCats, setupConnection]);

  // Broadcast function directly across all WebRTC DataChannels
  const broadcastToAllPeers = useCallback((packet: any) => {
    connectionsRef.current.forEach((conn) => {
      if (conn && conn.open) {
        try {
          conn.send(packet);
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    registerP2PSender(broadcastToAllPeers);
    return () => {
      unregisterP2PSender();
    };
  }, [broadcastToAllPeers]);

  // Function to broadcast local player position (Direct P2P WebRTC)
  const sendMyPosition = useCallback(
    (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right', isMoving: boolean, behavior: string = 'idle') => {
      const now = Date.now();

      if (isMoving) {
        wasMovingRef.current = true;
        // 100ms throttle for smooth 60fps interpolation without flooding
        if (now - lastMoveSentRef.current >= 80) {
          lastMoveSentRef.current = now;
          broadcastToAllPeers({
            type: 'cat-move',
            x,
            y,
            direction,
            isMoving: true,
            behavior,
            customization: myCatRef.current,
          });
        }
      } else {
        // When stopped, send 1 final stop packet
        if (wasMovingRef.current) {
          wasMovingRef.current = false;
          lastMoveSentRef.current = now;
          broadcastToAllPeers({
            type: 'cat-move',
            x,
            y,
            direction,
            isMoving: false,
            behavior: 'idle',
            customization: myCatRef.current,
          });
        }
      }
    },
    [broadcastToAllPeers]
  );

  // Function to broadcast chat or emote (Direct P2P WebRTC)
  const sendMyChat = useCallback(
    (text?: string, emote?: string) => {
      broadcastToAllPeers({
        type: 'cat-chat',
        text,
        emote,
      });
    },
    [broadcastToAllPeers]
  );

  // Function to broadcast friend action (Direct P2P WebRTC)
  const sendFriendAction = useCallback(
    (actionType: 'request' | 'treat') => {
      broadcastToAllPeers({
        type: 'cat-friend-action',
        senderName: myCatRef.current.name,
        actionType,
      });
    },
    [broadcastToAllPeers]
  );

  return {
    sendMyPosition,
    sendMyChat,
    sendFriendAction,
  };
}
