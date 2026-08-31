import { useCatStore } from '@/store/catStore';
import { broadcastP2PPacket } from './p2pManager';

export async function broadcastLiveChat(text?: string, emote?: string) {
  const myCat = useCatStore.getState().myCat;
  const currentRoom = useCatStore.getState().currentRoom;
  broadcastP2PPacket({
    type: 'cat-chat',
    roomId: currentRoom.id,
    text,
    emote,
    senderName: myCat.name,
  });
}

export async function broadcastLiveFriendRequest(targetPeerId: string) {
  const myCat = useCatStore.getState().myCat;
  const currentRoom = useCatStore.getState().currentRoom;
  broadcastP2PPacket({
    type: 'friend-request',
    roomId: currentRoom.id,
    targetPeerId,
    senderName: myCat.name,
    senderCustomization: myCat,
  });
}

export async function broadcastLiveFriendAccepted(targetPeerId: string) {
  const myCat = useCatStore.getState().myCat;
  const currentRoom = useCatStore.getState().currentRoom;
  broadcastP2PPacket({
    type: 'friend-accepted',
    roomId: currentRoom.id,
    targetPeerId,
    senderName: myCat.name,
    senderCustomization: myCat,
  });
}

export async function broadcastLiveDirectMessage(targetPeerId: string, text: string) {
  const myCat = useCatStore.getState().myCat;
  const currentRoom = useCatStore.getState().currentRoom;
  broadcastP2PPacket({
    type: 'direct-message',
    roomId: currentRoom.id,
    toPeerId: targetPeerId,
    text,
    senderName: myCat.name,
  });
}

export async function broadcastLiveFriendAction(actionType: 'request' | 'treat') {
  const myCat = useCatStore.getState().myCat;
  const currentRoom = useCatStore.getState().currentRoom;
  broadcastP2PPacket({
    type: 'cat-friend-action',
    roomId: currentRoom.id,
    actionType,
    senderName: myCat.name,
  });
}
