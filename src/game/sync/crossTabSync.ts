// Native High-Performance Cross-Tab Synchronizer for WeCats

export type CrossTabMessage =
  | {
      type: 'pos-sync';
      x: number;
      y: number;
      dir: 'up' | 'down' | 'left' | 'right';
      isMoving: boolean;
      behavior?: string;
    }
  | {
      type: 'customization-sync';
      customization: any;
    }
  | {
      type: 'chat-sync';
      roomId: string;
      message: any;
    }
  | {
      type: 'room-sync';
      room: any;
    }
  | {
      type: 'stats-sync';
      stats: any;
      fishCoins?: number;
      unlockedItems?: string[];
    }
  | {
      type: 'friend-req-sync';
      request: any;
    }
  | {
      type: 'friend-accepted-sync';
      friend: any;
    }
  | {
      type: 'dm-sync';
      friendId: string;
      message: any;
    };

let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('wecats_cross_tab_channel');
  } catch {}
}

export function broadcastCrossTabPos(
  x: number,
  y: number,
  dir: 'up' | 'down' | 'left' | 'right',
  isMoving: boolean,
  behavior: string = 'idle'
) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'pos-sync',
        x,
        y,
        dir,
        isMoving,
        behavior,
      });
    } catch {}
  }
}

export function broadcastCrossTabCustomization(customization: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'customization-sync',
        customization,
      });
    } catch {}
  }
}

export function broadcastCrossTabChat(roomId: string, message: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'chat-sync',
        roomId,
        message,
      });
    } catch {}
  }
}

export function broadcastCrossTabRoom(room: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'room-sync',
        room,
      });
    } catch {}
  }
}

export function broadcastCrossTabStats(stats: any, fishCoins?: number, unlockedItems?: string[]) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'stats-sync',
        stats,
        fishCoins,
        unlockedItems,
      });
    } catch {}
  }
}

export function broadcastCrossTabFriendRequest(request: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'friend-req-sync',
        request,
      });
    } catch {}
  }
}

export function broadcastCrossTabFriendAccepted(friend: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'friend-accepted-sync',
        friend,
      });
    } catch {}
  }
}

export function broadcastCrossTabDM(friendId: string, message: any) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'dm-sync',
        friendId,
        message,
      });
    } catch {}
  }
}

export function subscribeCrossTabSync(callback: (msg: CrossTabMessage) => void): () => void {
  if (!broadcastChannel) {
    // Fallback using storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'wecats_player_pos' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback({
            type: 'pos-sync',
            x: parsed.x,
            y: parsed.y,
            dir: parsed.dir || 'down',
            isMoving: false,
          });
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object') {
      callback(event.data as CrossTabMessage);
    }
  };

  broadcastChannel.addEventListener('message', handleMessage);
  return () => {
    broadcastChannel?.removeEventListener('message', handleMessage);
  };
}
