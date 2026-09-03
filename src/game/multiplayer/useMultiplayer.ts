'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCatStore, normalizeRoomId } from '@/store/catStore';
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
  return { x: 1100, y: 750, direction: 'down' };
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
  const handleIncomingPacketRef = useRef<(packet: any, senderPeerId: string) => void>(() => {});
  const chatBubbleTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastBehaviorRef = useRef<string>('idle');

  // Sync mutable refs
  useEffect(() => {
    myCatRef.current = myCat;
    statsRef.current = stats;
  }, [myCat, stats]);

  // Handle incoming data packets from a peer
  const handleIncomingPacket = useCallback(
    (packet: any, senderPeerId: string) => {
      if (!packet || typeof packet !== 'object') return;

      const type = packet.type;

      // 1. Movement Sync
      if (type === 'cat-move') {
        if (senderPeerId === myPeerIdRef.current) return;

        setOnlineCats((prev: OnlineCat[]) => {
          const matchIndex = prev.findIndex((c: OnlineCat) => c.id === senderPeerId);

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
        if (senderPeerId === myPeerIdRef.current) return;
        const posX = typeof packet.x === 'number' ? packet.x : 700;
        const posY = typeof packet.y === 'number' ? packet.y : 480;
        const posDir = packet.direction || 'down';

        setOnlineCats((prev: OnlineCat[]) => {
          const existingIndex = prev.findIndex((c: OnlineCat) => c.id === senderPeerId);

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

        // If packet has condoConfig from owner, sync it live for visitors
        if (packet.condoConfig) {
          const currentRoom = useCatStore.getState().currentRoom;
          if (currentRoom.type === 'condo' || currentRoom.theme === 'condo') {
            useCatStore.setState({
              currentRoom: { ...currentRoom, condoConfig: packet.condoConfig },
            });
          }
        }

        // Reply back with our customization AND our current real coordinates
        if (packet.isGreeting) {
          const conn = connectionsRef.current.get(senderPeerId);
          if (conn && conn.open) {
            const myPos = getCurrentPlayerPos();
            const currentRoom = useCatStore.getState().currentRoom;
            const isCondo = currentRoom.type === 'condo' || currentRoom.theme === 'condo';
            conn.send({
              type: 'cat-joined',
              customization: myCatRef.current,
              stats: statsRef.current,
              condoConfig: isCondo ? (currentRoom.condoConfig || useCatStore.getState().myCondo) : undefined,
              x: myPos.x,
              y: myPos.y,
              direction: myPos.direction,
              isGreeting: false,
            });
          }
        }
      }

      // 2.1 Condo Live Decoration Update
      else if (type === 'condo-update') {
        if (packet.condoConfig) {
          const currentRoom = useCatStore.getState().currentRoom;
          if (currentRoom.type === 'condo' || currentRoom.theme === 'condo') {
            useCatStore.setState({
              currentRoom: { ...currentRoom, condoConfig: packet.condoConfig },
            });
          }
        }
      }

      // 3. Chat / Emote
      else if (type === 'cat-chat') {
        const currentActiveRoom = useCatStore.getState().currentRoom;
        const normPacketRoom = normalizeRoomId(packet.roomId);
        const normCurrentRoom = normalizeRoomId(currentActiveRoom.id);

        // Strict Room Isolation Guard: Discard packet if it belongs to another room
        if (normPacketRoom && normCurrentRoom && normPacketRoom !== normCurrentRoom) return;

        soundManager.playPop();
        const senderCat = useCatStore.getState().onlineCats.find((c) => c.id === senderPeerId);
        const senderName = packet.senderName || senderCat?.customization?.name || 'เพื่อนแมว';

        if (packet.text) {
          useCatStore.getState().receiveChatMessage(senderPeerId, senderName, packet.text, currentActiveRoom.id, packet.msgId);
        } else if (packet.emote) {
          useCatStore.getState().receiveChatMessage(senderPeerId, senderName, packet.emote, currentActiveRoom.id, packet.msgId);
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

        // Reset any existing bubble timer for this peer to prevent premature disappearance
        if (chatBubbleTimersRef.current.has(senderPeerId)) {
          clearTimeout(chatBubbleTimersRef.current.get(senderPeerId)!);
        }

        const bubbleTimer = setTimeout(() => {
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
          chatBubbleTimersRef.current.delete(senderPeerId);
        }, 4500);

        chatBubbleTimersRef.current.set(senderPeerId, bubbleTimer);
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

      // 4.3 Real-Time 1-to-1 Direct Message (Matches by PeerID or Persistent CatName)
      else if (type === 'direct-message') {
        const isTarget =
          packet.toPeerId === myPeerIdRef.current ||
          (packet.targetCatName && packet.targetCatName === myCatRef.current.name) ||
          !packet.toPeerId;

        if (isTarget) {
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

  handleIncomingPacketRef.current = handleIncomingPacket;

  // Setup connection event handlers for a DataConnection
  const setupConnection = useCallback(
    (
      conn: DataConnection,
      initialCustomization?: Partial<CatCustomization>,
      initialPos?: { x?: number; y?: number; direction?: 'up' | 'down' | 'left' | 'right' }
    ) => {
      const targetPeerId = conn.peer;

      // Prevent dual connection glare: if an open connection already exists, don't duplicate
      const existingConn = connectionsRef.current.get(targetPeerId);
      if (existingConn && existingConn !== conn) {
        if (existingConn.open) {
          try {
            conn.close();
          } catch {}
          return;
        } else {
          try {
            existingConn.close();
          } catch {}
        }
      }

      const onOpen = () => {
        connectionsRef.current.set(targetPeerId, conn);

        const initX = typeof initialPos?.x === 'number' ? initialPos.x : 700;
        const initY = typeof initialPos?.y === 'number' ? initialPos.y : 480;
        const initDir = initialPos?.direction || 'down';

        if (targetPeerId === myPeerIdRef.current) return;

        // Add or update online cats seamlessly
        setOnlineCats((prev: OnlineCat[]) => {
          const matchIndex = prev.findIndex((c: OnlineCat) => c.id === targetPeerId);

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
        const curRoom = useCatStore.getState().currentRoom;
        const inCondo = curRoom.type === 'condo' || curRoom.theme === 'condo';
        try {
          conn.send({
            type: 'cat-joined',
            customization: myCatRef.current,
            stats: statsRef.current,
            condoConfig: inCondo ? (curRoom.condoConfig || useCatStore.getState().myCondo) : undefined,
            x: myPos.x,
            y: myPos.y,
            direction: myPos.direction,
            isGreeting: true,
          });
        } catch {}
      };

      if (conn.open) {
        onOpen();
      } else {
        conn.on('open', onOpen);
      }

      conn.on('data', (data) => {
        handleIncomingPacketRef.current(data, targetPeerId);
      });

      conn.on('close', () => {
        connectionsRef.current.delete(targetPeerId);
        // Smooth 4-second grace period before removal so reload/reconnect doesn't cause blinking
        setTimeout(() => {
          if (!connectionsRef.current.has(targetPeerId)) {
            setOnlineCats((prev: OnlineCat[]) => prev.filter((c: OnlineCat) => c.id !== targetPeerId));
          }
        }, 4000);
      });

      conn.on('error', (err) => {
        console.warn(`P2P connection notice for ${targetPeerId}:`, err);
        connectionsRef.current.delete(targetPeerId);
      });
    },
    [handleIncomingPacket, setOnlineCats]
  );

  // Initialize WebRTC Peer and Room Discovery
  useEffect(() => {
    let isCancelled = false;
    let heartbeatTimer: NodeJS.Timeout;

    // Reset local peer connections map on room or mount
    connectionsRef.current.clear();

    const initWebRTC = async () => {
      const { default: Peer } = await import('peerjs');

      if (isCancelled) return;

      // Unique peer ID for this tab session
      const generatedPeerId = `wecat_${Math.random().toString(36).substring(2, 10)}`;

      const peer = new Peer(generatedPeerId, {
        config: {
          iceServers: [
            // 1. Google Global STUNs (Fastest for Direct P2P Hole Punching)
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },

            // 2. Cloudflare & Twilio STUNs
            { urls: 'stun:global.stun.twilio.com:3478' },
            { urls: 'stun:stun.cloudflare.com:3478' },

            // 3. Metered OpenRelay STUN (Port 80)
            { urls: 'stun:openrelay.metered.ca:80' },

            // 4. Metered OpenRelay TURN (UDP Port 443)
            {
              urls: 'turn:openrelay.metered.ca:443',
              username: 'openrelayproject',
              credential: 'openrelayproject',
            },

            // 5. Metered OpenRelay TURN (TCP Port 443 - University / Enterprise Firewall Breaker)
            {
              urls: 'turn:openrelay.metered.ca:443?transport=tcp',
              username: 'openrelayproject',
              credential: 'openrelayproject',
            },

            // 6. Metered OpenRelay TURN (UDP Port 80)
            {
              urls: 'turn:openrelay.metered.ca:80',
              username: 'openrelayproject',
              credential: 'openrelayproject',
            },
          ],
        },
      });

      peerInstanceRef.current = peer;

      peer.on('open', async (id) => {
        if (isCancelled) return;
        myPeerIdRef.current = id;

        // 1. Join room via server signaling
        try {
          const myPos = getCurrentPlayerPos();
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
                if (p.peerId !== id) {
                  // Prevent adding clone of own cat
                  const incomingName = p.customization?.name;
                  if (incomingName && incomingName === myCatRef.current.name) {
                    return;
                  }

                  // Pre-seed remote cat in local state so there is 0ms pop-in
                  if (p.customization) {
                    setOnlineCats((prev: OnlineCat[]) => {
                      const matchIndex = prev.findIndex(
                        (c: OnlineCat) => c.id === p.peerId || (incomingName && c.customization.name === incomingName)
                      );
                      if (matchIndex === -1) {
                        return [
                          ...prev,
                          {
                            id: p.peerId,
                            customization: p.customization || FALLBACK_DEFAULT_CAT,
                            stats: statsRef.current,
                            x: typeof p.x === 'number' ? p.x : 1100,
                            y: typeof p.y === 'number' ? p.y : 750,
                            direction: p.direction || 'down',
                            behavior: 'idle',
                            lastUpdated: Date.now(),
                          },
                        ];
                      }
                      return prev;
                    });
                  }

                  // Immediately establish P2P connection to all active room peers
                  if (!connectionsRef.current.has(p.peerId) || !connectionsRef.current.get(p.peerId)?.open) {
                    const conn = peer.connect(p.peerId, { reliable: true });
                    setupConnection(conn, p.customization, { x: p.x, y: p.y, direction: p.direction });
                  }
                }
              }
            );
          }
        } catch (e) {
          console.warn('P2P Join warning:', e);
        }

        // Fast 4-second heartbeat to discover new peers, keep mesh healthy, and sync coordinates
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
              // 1. Prune ghost / disconnected cats that are no longer active in the room
              const activePeerIds = new Set(hbData.peers.map((p: any) => p.peerId));
              setOnlineCats((prev: OnlineCat[]) => prev.filter((c: OnlineCat) => activePeerIds.has(c.id)));

              // 2. Reconcile & connect with active peers
              hbData.peers.forEach(
                (p: {
                  peerId: string;
                  customization?: CatCustomization;
                  x?: number;
                  y?: number;
                  direction?: 'up' | 'down' | 'left' | 'right';
                }) => {
                  if (p.peerId !== id) {
                    // Pre-seed remote cat in local state so there is 0ms pop-in
                    if (p.customization) {
                      setOnlineCats((prev: OnlineCat[]) => {
                        const matchIndex = prev.findIndex((c: OnlineCat) => c.id === p.peerId);
                        if (matchIndex === -1) {
                          return [
                            ...prev,
                            {
                              id: p.peerId,
                              customization: p.customization || FALLBACK_DEFAULT_CAT,
                              stats: statsRef.current,
                              x: typeof p.x === 'number' ? p.x : 1100,
                              y: typeof p.y === 'number' ? p.y : 750,
                              direction: p.direction || 'down',
                              behavior: 'idle',
                              lastUpdated: Date.now(),
                            },
                          ];
                        }
                        return prev;
                      });
                    }

                    // Connect or repair connection if not connected yet
                    if (!connectionsRef.current.has(p.peerId) || !connectionsRef.current.get(p.peerId)?.open) {
                      const conn = peer.connect(p.peerId, { reliable: true });
                      setupConnection(conn, p.customization, { x: p.x, y: p.y, direction: p.direction });
                    }
                  }
                }
              );
            }
          } catch {}
        }, 4000);
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

    // Auto-reconnect and refresh heartbeat when coming back from mobile background / screen lock
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && myPeerIdRef.current) {
        const myPos = getCurrentPlayerPos();
        fetch('/api/p2p/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            peerId: myPeerIdRef.current,
            roomId,
            catCustomization: myCatRef.current,
            pos: myPos,
          }),
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      clearInterval(heartbeatTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Clear all active speech bubble timers
      chatBubbleTimersRef.current.forEach((t) => clearTimeout(t));
      chatBubbleTimersRef.current.clear();

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

    const handleWindowBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        broadcastToAllPeers(customEvent.detail);
      }
    };

    const handleBehaviorChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.behavior) {
        const myPos = getCurrentPlayerPos();
        lastBehaviorRef.current = customEvent.detail.behavior;
        broadcastToAllPeers({
          type: 'cat-move',
          x: myPos.x,
          y: myPos.y,
          direction: myPos.direction,
          isMoving: false,
          behavior: customEvent.detail.behavior,
          customization: myCatRef.current,
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('wecats-p2p-broadcast', handleWindowBroadcast);
      window.addEventListener('wecats-behavior-change', handleBehaviorChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('wecats-p2p-broadcast', handleWindowBroadcast);
        window.removeEventListener('wecats-behavior-change', handleBehaviorChange);
      }
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
        // When stopped or in special behavior, send packet when behavior changes
        if (wasMovingRef.current || lastBehaviorRef.current !== behavior) {
          wasMovingRef.current = false;
          lastBehaviorRef.current = behavior;
          lastMoveSentRef.current = now;
          broadcastToAllPeers({
            type: 'cat-move',
            x,
            y,
            direction,
            isMoving: false,
            behavior,
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
