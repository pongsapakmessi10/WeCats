// Global P2P WebRTC Dispatcher for instant cross-component messaging

type P2PListener = (packet: any) => void;
let globalSendFunction: ((packet: any) => void) | null = null;

export function registerP2PSender(sender: (packet: any) => void) {
  globalSendFunction = sender;
}

export function unregisterP2PSender() {
  globalSendFunction = null;
}

export function broadcastP2PPacket(packet: any) {
  if (globalSendFunction) {
    globalSendFunction(packet);
  }
}
