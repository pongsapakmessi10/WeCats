import { create } from 'zustand';
import {
  CatCustomization,
  CatStats,
  OnlineCat,
  ChatMessage,
  CatBehavior,
  InteractiveProp,
  ShopItem,
  DiaryEntry,
  SavedPhoto,
  FriendData,
  FriendRequest,
  DirectMessage,
  Achievement,
  CatSlot,
  RoomData,
  CondoCustomization,
  DEFAULT_CONDO,
} from '@/types/game';
import {
  broadcastLiveFriendRequest,
  broadcastLiveFriendAccepted,
  broadcastLiveDirectMessage,
} from '@/game/multiplayer/broadcast';
import {
  broadcastCrossTabChat,
  broadcastCrossTabRoom,
  broadcastCrossTabStats,
  broadcastCrossTabFriendRequest,
  broadcastCrossTabFriendAccepted,
  broadcastCrossTabDM,
} from '@/game/sync/crossTabSync';

export const SHOP_CATALOG: ShopItem[] = [
  // HATS
  { id: 'frog_hat', name: 'หมวกกบเขียวเคโระ 🐸', category: 'hats', price: 80, icon: '🐸', description: 'หมวกกบน้อยสุดกวน ใส่แล้วน่ารักจนใจละลาย', rarity: 'rare' },
  { id: 'princess_tiara', name: 'มงกุฎเจ้าหญิงระยิบระยับ 👑', category: 'hats', price: 120, icon: '👑', description: 'มงกุฎทองประดับเพชร สำหรับคุณหนูแมวสูงศักดิ์', rarity: 'epic' },
  { id: 'detective_hat', name: 'หมวกนักสืบเชอร์ล็อก 🕵️', category: 'hats', price: 90, icon: '🕵️', description: 'สำหรับแมวช่างสงสัยที่ชอบดมกลิ่นหาเบาะแส', rarity: 'rare' },
  { id: 'party_hat', name: 'หมวกปาร์ตี้วันเกิด 🥳', category: 'hats', price: 50, icon: '🥳', description: 'หมวกทรงกรวยฉลองปาร์ตี้กับเพื่อนๆ ใน Plaza', rarity: 'common' },
  { id: 'chef_hat', name: 'หมวกเชฟกูร์เมต์ 👨‍🍳', category: 'hats', price: 70, icon: '👨‍🍳', description: 'สำหรับแมวที่พิถีพิถันเรื่องแซลมอนเป็นพิเศษ', rarity: 'common' },
  { id: 'beret', name: 'หมวกเบเร่ต์ศิลปิน 🎨', category: 'hats', price: 60, icon: '🎨', description: 'เพิ่มฟีลศิลปินอาร์ตติสท์นั่งวาดรูปใต้ต้นซากุระ', rarity: 'common' },

  // NECK
  { id: 'rainbow_collar', name: 'ปลอกคอสายรุ้ง 🌈', category: 'neck', price: 95, icon: '🌈', description: 'ปลอกคอหลากสีสันสดใส มองเห็นได้แต่ไกล', rarity: 'rare' },
  { id: 'pearl_necklace', name: 'สร้อยไข่มุกพรีเมียม 🦪', category: 'neck', price: 110, icon: '🦪', description: 'สร้อยไข่มุกน้ำงาม หรูหราระดับท็อปคลาส', rarity: 'epic' },
  { id: 'bowtie', name: 'หูกระต่ายทักซิโด้ 🎀', category: 'neck', price: 65, icon: '🎀', description: 'เพิ่มความสุภาพเรียบร้อยในงานเลี้ยง Plaza', rarity: 'common' },
  { id: 'fish_pendant', name: 'สร้อยจี้ปลาทูทองคำ 🐟', category: 'neck', price: 85, icon: '🐟', description: 'จี้รูปปลาทูทอง สัญลักษณ์แห่งความอุดมสมบูรณ์', rarity: 'rare' },

  // BACK
  { id: 'dragon_wings', name: 'ปีกมังกรตัวจิ๋ว 🐉', category: 'back', price: 150, icon: '🐉', description: 'ปีกมังกรจิ๋วกระพือเบาๆ เพิ่มความเท่ 100%', rarity: 'legendary' },
  { id: 'angel_wings', name: 'ปีกนางฟ้าขนนุ่ม 🪽', category: 'back', price: 140, icon: '🪽', description: 'ปีกขนนกสีขาวบริสุทธิ์ นุ่มฟูเหมือนปุยเมฆ', rarity: 'epic' },
  { id: 'toast_slice', name: 'ขนมปังปิ้งประกบหลัง 🍞', category: 'back', price: 75, icon: '🍞', description: 'กลิ่นเนยหอมกรุ่น เหมือนแมวบินในตำนาน', rarity: 'common' },
  { id: 'cape', name: 'ผ้าคลุมฮีโร่สีแดง 🦸', category: 'back', price: 85, icon: '🦸', description: 'ผ้าคลุมพัดตามลมเวลาวิ่ง Zoomies', rarity: 'rare' },

  // FACE
  { id: 'heart_glasses', name: 'แว่นตารูปหัวใจสีชมพู 💖', category: 'face', price: 60, icon: '💖', description: 'แว่นตาแฟชั่นรูปหัวใจสุดคิ้วท์', rarity: 'common' },
  { id: 'mustache', name: 'หนวดคุณชายสุดเนี้ยบ 🥸', category: 'face', price: 55, icon: '🥸', description: 'หนวดปลอมสไตล์สุภาพบุรุษแมวอังกฤษ', rarity: 'common' },
  { id: 'monocle', name: 'แว่นตาขุนนางข้างเดียว 🧐', category: 'face', price: 70, icon: '🧐', description: 'แว่นขยายทรงกลมสีทองสำหรับคุณชายแมว', rarity: 'rare' },

  // AURA
  { id: 'rainbow', name: 'ออร่าสายรุ้งเปล่งประกาย 🌈', category: 'aura', price: 180, icon: '🌈', description: 'ประกายสายรุ้งลอยรอบตัวอย่างงดงาม', rarity: 'legendary' },
  { id: 'cherry_blossoms', name: 'ออร่ากลีบซากุระปลิว 🌸', category: 'aura', price: 160, icon: '🌸', description: 'กลีบดอกซากุระโปรยปรายตามทุกย่างก้าว', rarity: 'epic' },
  { id: 'stars', name: 'ออร่าดาวตกหมุนวน ⭐', category: 'aura', price: 130, icon: '⭐', description: 'ประกายดาวสีทองหมุนรอบตัววิบวับ', rarity: 'rare' },

  // TREATS & SNACKS
  { id: 'treat_salmon', name: 'ขนมแมวเลียแซลมอน 🍣', category: 'treats', price: 25, icon: '🍣', description: 'ฟื้นฟู Happiness +30 และได้รับ Affection +40 EXP', rarity: 'common' },
  { id: 'treat_catnip', name: 'ผงแคทนิปอินทรีย์ 🌿', category: 'treats', price: 35, icon: '🌿', description: 'เติมพลัง Zoomies เต็ม 100% พร้อมวิ่งกระจาย', rarity: 'rare' },
  { id: 'treat_tuna_can', name: 'ปลากระป๋องทูน่าเยลลี่ 🥫', category: 'treats', price: 30, icon: '🥫', description: 'เพิ่ม Hunger +40 และเพิ่มน้ำหนัก Chonky +0.1kg', rarity: 'common' },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_care',
    title: 'ทาสแมวมือใหม่ 🍼',
    description: 'ดูแลน้องแมวครบทั้งให้อาหาร ดื่มน้ำ และแปรงขน',
    icon: '🍼',
    category: 'care',
    progress: 1,
    target: 1,
    rewardCoins: 50,
    isClaimed: false,
  },
  {
    id: 'ach_gourmet',
    title: 'นักชิมตัวยง 🐟',
    description: 'ป้อนอาหารหรือขนมให้น้องแมวครบ 10 ครั้ง',
    icon: '🐟',
    category: 'care',
    progress: 3,
    target: 10,
    rewardCoins: 80,
    isClaimed: false,
  },
  {
    id: 'ach_explorer',
    title: 'นักสำรวจ Plaza 🌸',
    description: 'เดินเล่นสำรวจในสวนซากุระครบ 300 ก้าว',
    icon: '🌸',
    category: 'explorer',
    progress: 120,
    target: 300,
    rewardCoins: 60,
    isClaimed: false,
  },
  {
    id: 'ach_social_butterfly',
    title: 'มิตรภาพขนปุย 🤝',
    description: 'ดมก้นทักทายหรือผูกมิตรกับแมวตัวอื่น 3 ตัว',
    icon: '🤝',
    category: 'social',
    progress: 1,
    target: 3,
    rewardCoins: 100,
    isClaimed: false,
  },
  {
    id: 'ach_chonky_master',
    title: 'เจ้าก้อนขนอ้วนตุ้บ 🏆',
    description: 'เลี้ยงน้องแมวจนน้ำหนักถึง 5.5 kg ขึ้นไป',
    icon: '🏆',
    category: 'care',
    progress: 5.4,
    target: 5.5,
    rewardCoins: 120,
    isClaimed: false,
  },
  {
    id: 'ach_photographer',
    title: 'ช่างภาพมือโปร 📸',
    description: 'ถ่ายรูปโพลารอยด์และบันทึกลงอัลบั้ม 1 รูป',
    icon: '📸',
    category: 'collector',
    progress: 0,
    target: 1,
    rewardCoins: 50,
    isClaimed: false,
  },
];

const DEFAULT_CAT: CatCustomization = {
  name: 'Mochi (โมจิ)',
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

const DEFAULT_STATS: CatStats = {
  hunger: 78,
  hydration: 82,
  energy: 90,
  happiness: 85,
  hygiene: 75,
  weightKg: 5.4,
  zoomiesEnergy: 65,
  isZooming: false,
  affectionExp: 140,
  affectionLevel: 2,
  lastFed: Date.now(),
  lastWatered: Date.now(),
  lastGroomed: Date.now(),
  lastSlept: Date.now(),
};

export const PLAZA_PROPS: InteractiveProp[] = [
  {
    id: 'prop-fountain',
    type: 'water_fountain',
    name: 'น้ำพุแมวน้ำแร่บริสุทธิ์ ⛲',
    prompt: 'กด [E] ดื่มน้ำพุสดชื่น (+Hydration & Coins)',
    x: 550,
    y: 400,
    width: 80,
    height: 80,
    icon: '⛲',
    actionType: 'water',
  },
  {
    id: 'prop-food',
    type: 'food_bowl',
    name: 'ชามบุฟเฟ่ต์ปลาแซลมอน 🐟',
    prompt: 'กด [E] กินแซลมอนสุดอร่อย (+Hunger & Coins)',
    x: 250,
    y: 300,
    width: 70,
    height: 70,
    icon: '🐟',
    actionType: 'food',
  },
  {
    id: 'prop-scratch',
    type: 'scratch_post',
    name: 'เสาลับเล็บเชือกป่าน 🪵',
    prompt: 'กด [E] ลับเล็บสุดมันส์ (+Happiness & Hygiene)',
    x: 750,
    y: 480,
    width: 60,
    height: 90,
    icon: '🪵',
    actionType: 'scratch',
  },
  {
    id: 'prop-box',
    type: 'cardboard_box',
    name: 'กล่องกระดาษพัสดุลับ 📦',
    prompt: 'กด [E] มุดกล่องซ่อนตัว (+Comfort)',
    x: 200,
    y: 500,
    width: 65,
    height: 65,
    icon: '📦',
    actionType: 'box',
  },
  {
    id: 'prop-sun',
    type: 'sun_patch',
    name: 'ลานแดดอุ่นนอนกลิ้ง ☀️',
    prompt: 'กด [E] นอนอาบแดดอุ่นสบาย (+Energy Recovery)',
    x: 700,
    y: 200,
    width: 120,
    height: 80,
    icon: '☀️',
    actionType: 'sleep',
  },
  {
    id: 'prop-laser',
    type: 'laser_pointer',
    name: 'จุดเลเซอร์สีแดงปริศนา 🔴',
    prompt: 'กด [E] ไล่ตะปบเลเซอร์ (+Zoomies Exp & Coins)',
    x: 450,
    y: 560,
    width: 40,
    height: 40,
    icon: '🔴',
    actionType: 'laser',
  },
];

function loadInitialChatHistory(): Record<string, ChatMessage[]> {
  const defaultHistory: Record<string, ChatMessage[]> = {
    'public-sakura': [
      {
        id: 'msg-welcome-sakura',
        senderId: 'system',
        senderName: 'ระบบ Plaza',
        text: 'ยินดีต้อนรับสู่ สวนซากุระ Plaza #1! วิ่งเล่นและคุยกับเพื่อนแมวได้เลย 🌸',
        timestamp: Date.now(),
      },
    ],
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('wecats_chat_history_by_room');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultHistory, ...parsed };
        }
      }
    } catch {}
  }
  return defaultHistory;
}

function saveChatHistory(history: Record<string, ChatMessage[]>) {
  if (typeof window !== 'undefined') {
    try {
      const pruned: Record<string, ChatMessage[]> = {};
      Object.keys(history).forEach((roomId) => {
        pruned[roomId] = (history[roomId] || []).slice(-60);
      });
      localStorage.setItem('wecats_chat_history_by_room', JSON.stringify(pruned));
    } catch {}
  }
}

interface CatStoreState {
  myCat: CatCustomization;
  stats: CatStats;
  onlineCats: OnlineCat[];
  chatMessages: ChatMessage[];
  chatMessagesByRoom: Record<string, ChatMessage[]>;
  unreadChatCount: number;
  isChatExpanded: boolean;
  myCatChat: { text: string | null; emote: string | null };
  
  // Economy & Shop
  fishCoins: number;
  unlockedItems: string[];
  isShopOpen: boolean;

  // Diary, Album & Achievements
  diaryEntries: DiaryEntry[];
  savedPhotos: SavedPhoto[];
  achievements: Achievement[];
  isDiaryOpen: boolean;

  // Social & Friend Requests
  friends: FriendData[];
  pendingFriendRequests: FriendRequest[];
  directMessages: Record<string, DirectMessage[]>;
  activeDirectChatFriend: FriendData | null;
  isFriendsOpen: boolean;
  isDirectChatOpen: boolean;

  // Multi-Cat Slots
  currentSlotIndex: number;
  catSlots: CatSlot[];

  // HUD & UI Modals
  isCustomizerOpen: boolean;
  isProfileOpen: boolean;
  isPhotoMode: boolean;
  isSoundEnabled: boolean;
  selectedNearbyCat: OnlineCat | null;
  activeNearbyProp: InteractiveProp | null;
  notificationText: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  currentRoom: RoomData;
  roomDeletedModal: { isOpen: boolean; roomName: string };

  // Modal Setters
  setCurrentRoom: (room: RoomData) => void;
  setRoomDeletedModal: (data: { isOpen: boolean; roomName: string }) => void;
  kickToSakuraPlaza: (roomName?: string) => void;
  setCustomizerOpen: (open: boolean) => void;
  setProfileOpen: (open: boolean) => void;
  setPhotoMode: (photo: boolean) => void;
  setShopOpen: (open: boolean) => void;
  setDiaryOpen: (open: boolean) => void;
  setFriendsOpen: (open: boolean) => void;
  setDirectChatOpen: (open: boolean) => void;
  setActiveDirectChatFriend: (friend: FriendData | null) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  isCondoCustomizerOpen: boolean;
  setIsCondoCustomizerOpen: (open: boolean) => void;
  myCondo: CondoCustomization;
  updateCondoCustomization: (updates: Partial<CondoCustomization>) => void;
  enterMyCondo: () => void;
  visitFriendCondo: (friendCatName: string, config?: CondoCustomization) => void;
  exitCondoToPlaza: () => void;
  cameraZoomMode: 'close' | 'wide';
  toggleCameraZoom: () => void;
  setCameraZoomMode: (mode: 'close' | 'wide') => void;
  toggleSound: () => void;

  // Economy Actions
  addFishCoins: (amount: number, reason?: string) => void;
  buyShopItem: (item: ShopItem) => boolean;

  // Diary & Photo Actions
  addDiaryEntry: (title: string, description: string, icon: string, coins?: number, category?: DiaryEntry['category']) => void;
  savePhoto: (photo: SavedPhoto) => void;
  deletePhoto: (id: string) => void;

  // Social Actions
  addFriend: (cat: OnlineCat) => void;
  addFriendFromPeer: (friend: FriendData) => void;
  sendFriendRequestToCat: (targetCat: OnlineCat) => void;
  receiveFriendRequest: (request: FriendRequest) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  sendDirectMessage: (friendId: string, text: string) => void;
  receiveDirectMessage: (msg: DirectMessage) => void;
  sendTreatToFriend: (friendId: string) => void;

  // Achievement Actions
  claimAchievement: (id: string) => void;

  // Multi-Cat Actions
  switchCatSlot: (slotIndex: number) => void;
  createCatSlot: (slotIndex: number, customization: CatCustomization) => void;

  // Core Care & Movement Actions
  updateCustomization: (updates: Partial<CatCustomization>) => void;
  setMyCatPosition: (x: number, y: number, vx: number, vy: number, dir: 'up' | 'down' | 'left' | 'right', behavior: CatBehavior) => void;
  feedCat: (type: 'dry' | 'wet' | 'treat') => void;
  waterCat: () => void;
  groomCat: () => void;
  petCat: () => void;
  triggerZoomies: () => void;
  interactWithProp: (prop: InteractiveProp) => void;
  sniffCat: (targetId: string) => void;
  allogroomCat: (targetId: string) => void;
  sendChatMessage: (text: string) => void;
  sendEmote: (emote: string) => void;
  receiveChatMessage: (senderId: string, senderName: string, text: string, roomId?: string) => void;
  syncCrossTabChatMessage: (roomId: string, message: ChatMessage) => void;
  syncCrossTabRoom: (room: RoomData) => void;
  syncCrossTabStats: (stats: CatStats, fishCoins?: number, unlockedItems?: string[]) => void;
  syncCrossTabFriendRequest: (request: FriendRequest) => void;
  syncCrossTabFriendAccepted: (friend: FriendData) => void;
  syncCrossTabDM: (friendId: string, message: DirectMessage) => void;
  setIsChatExpanded: (expanded: boolean) => void;
  clearUnreadChat: () => void;
  setSelectedNearbyCat: (cat: OnlineCat | null) => void;
  setOnlineCats: (catsOrUpdater: OnlineCat[] | ((prev: OnlineCat[]) => OnlineCat[])) => void;
  setActiveNearbyProp: (prop: InteractiveProp | null) => void;
  setNotification: (text: string) => void;
  tickBiology: () => void;
}

function loadInitialCondo(): CondoCustomization {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('wecats_my_condo');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_CONDO, ...parsed };
        }
      }
    } catch {}
  }
  return DEFAULT_CONDO;
}

export const useCatStore = create<CatStoreState>((set, get) => ({
  myCat: DEFAULT_CAT,
  stats: DEFAULT_STATS,
  onlineCats: [],
  chatMessages: (loadInitialChatHistory()['public-sakura']) || [
    {
      id: 'msg-welcome',
      senderId: 'system',
      senderName: 'ระบบ WeCats',
      text: 'ยินดีต้อนรับสู่ WeCats Plaza! วิ่งเล่นและพบปะเพื่อนแมวออนไลน์ได้เลย 🌸',
      timestamp: Date.now(),
    },
  ],
  chatMessagesByRoom: loadInitialChatHistory(),
  unreadChatCount: 0,
  isChatExpanded: true,
  myCatChat: { text: null, emote: null },

  // Economy & Shop
  fishCoins: 150,
  unlockedItems: ['straw_hat', 'gold_bell', 'backpack', 'cute_blush', 'sparkles'],
  isShopOpen: false,

  // Diary, Album & Achievements
  diaryEntries: [
    {
      id: 'diary-1',
      title: 'เริ่มต้นการเดินทางใน Plaza 🌸',
      description: 'โมจิได้ก้าวเข้าสู่สวนซากุระเป็นครั้งแรก พร้อมรับเลี้ยงดูอย่างอบอุ่น',
      timestamp: Date.now() - 120000,
      icon: '🌸',
      coinsEarned: 50,
      category: 'explore',
    },
  ],
  savedPhotos: [],
  achievements: INITIAL_ACHIEVEMENTS,
  isDiaryOpen: false,

  // Social (Real Online Friends Only)
  friends: [],
  pendingFriendRequests: [],
  directMessages: {},
  activeDirectChatFriend: null,
  isFriendsOpen: false,
  isDirectChatOpen: false,

  // Multi-Cat Slots
  currentSlotIndex: 0,
  catSlots: [
    {
      slotIndex: 0,
      customization: DEFAULT_CAT,
      stats: DEFAULT_STATS,
    },
  ],

  // HUD & UI Modals
  isCustomizerOpen: false,
  isProfileOpen: false,
  isPhotoMode: false,
  isSoundEnabled: false,
  selectedNearbyCat: null,
  activeNearbyProp: null,
  notificationText: 'ยินดีต้อนรับสู่ WeCats Plaza! กด [E] เพื่อโต้ตอบกับสิ่งของ 🐾',
  timeOfDay: 'morning',
  isMobileDrawerOpen: false,
  isCondoCustomizerOpen: false,
  myCondo: loadInitialCondo(),
  cameraZoomMode: (typeof window !== 'undefined' && (localStorage.getItem('wecats_camera_zoom') as 'close' | 'wide')) || 'close',
  currentRoom: {
    id: 'public-sakura',
    name: 'Plaza #1: สวนซากุระ',
    type: 'public',
    theme: 'sakura',
    maxCapacity: 20,
  },
  roomDeletedModal: { isOpen: false, roomName: '' },

  // Modal Setters
  setCurrentRoom: (room) => {
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
    if (room.theme === 'moonlight') timeOfDay = 'night';
    else if (room.theme === 'sunshine') timeOfDay = 'afternoon';

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wecats_current_room', JSON.stringify(room));
      } catch {}
    }

    const currentByRoom = { ...get().chatMessagesByRoom };
    if (!currentByRoom[room.id]) {
      currentByRoom[room.id] = [
        {
          id: `msg-welcome-${room.id}`,
          senderId: 'system',
          senderName: 'ระบบ WeCats',
          text: `ยินดีต้อนรับสู่ห้อง "${room.name}"! แชทสดและส่ง Emote เฉพาะในห้องนี้ได้เลย 🐾✨`,
          timestamp: Date.now(),
        },
      ];
    }
    const activeMessages = currentByRoom[room.id] || [];

    set({
      currentRoom: room,
      onlineCats: [], // reset room members for new room
      timeOfDay,
      chatMessagesByRoom: currentByRoom,
      chatMessages: activeMessages,
      unreadChatCount: 0,
    });
    get().setNotification(`ย้ายเข้าสู่ห้อง "${room.name}" สำเร็จ! 🐾`);

    // Sync room switch across other tabs of the same account
    broadcastCrossTabRoom(room);
  },

  syncCrossTabRoom: (room) => {
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
    if (room.theme === 'moonlight') timeOfDay = 'night';
    else if (room.theme === 'sunshine') timeOfDay = 'afternoon';

    const currentByRoom = { ...get().chatMessagesByRoom };
    const activeMessages = currentByRoom[room.id] || [];

    set({
      currentRoom: room,
      onlineCats: [],
      timeOfDay,
      chatMessages: activeMessages,
      unreadChatCount: 0,
    });
  },

  syncCrossTabStats: (stats, fishCoins, unlockedItems) => {
    set((state) => ({
      stats: stats || state.stats,
      fishCoins: typeof fishCoins === 'number' ? fishCoins : state.fishCoins,
      unlockedItems: unlockedItems || state.unlockedItems,
    }));
  },

  syncCrossTabFriendRequest: (request) => {
    set((state) => {
      if (state.pendingFriendRequests.some((r) => r.id === request.id)) return state;
      return {
        pendingFriendRequests: [request, ...state.pendingFriendRequests],
      };
    });
  },

  syncCrossTabFriendAccepted: (friend) => {
    set((state) => {
      if (state.friends.some((f) => f.id === friend.id)) return state;
      return {
        friends: [...state.friends, friend],
      };
    });
  },

  syncCrossTabDM: (friendId, message) => {
    set((state) => {
      const existing = state.directMessages[friendId] || [];
      if (existing.some((m) => m.id === message.id)) return state;
      return {
        directMessages: {
          ...state.directMessages,
          [friendId]: [...existing, message],
        },
      };
    });
  },

  setRoomDeletedModal: (data) => set({ roomDeletedModal: data }),

  kickToSakuraPlaza: (roomName = 'ห้องส่วนตัว') => {
    const defaultSakura: RoomData = {
      id: 'public-sakura',
      name: 'Plaza #1: สวนซากุระ',
      type: 'public',
      theme: 'sakura',
      maxCapacity: 20,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wecats_current_room', JSON.stringify(defaultSakura));
      } catch {}
    }
    set({
      currentRoom: defaultSakura,
      onlineCats: [],
      timeOfDay: 'morning',
      roomDeletedModal: { isOpen: true, roomName },
      notificationText: `🚪 ห้อง "${roomName}" ถูกลบแล้ว! กำลังพาน้องแมวกลับสู่สวนซากุระ...`,
    });
  },

  setCustomizerOpen: (open) => set({ isCustomizerOpen: open }),
  setProfileOpen: (open) => set({ isProfileOpen: open }),
  setPhotoMode: (photo) => set({ isPhotoMode: photo }),
  setShopOpen: (open) => set({ isShopOpen: open }),
  setDiaryOpen: (open) => set({ isDiaryOpen: open }),
  setFriendsOpen: (open) => set({ isFriendsOpen: open }),
  setDirectChatOpen: (open) => set({ isDirectChatOpen: open }),
  setActiveDirectChatFriend: (friend) => set({ activeDirectChatFriend: friend, isDirectChatOpen: !!friend }),
  setIsMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  setIsCondoCustomizerOpen: (open) => set({ isCondoCustomizerOpen: open }),
  updateCondoCustomization: (updates) =>
    set((state) => {
      const updated = { ...state.myCondo, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wecats_my_condo', JSON.stringify(updated));
        } catch {}
      }
      // If currently in self condo, update currentRoom config as well
      const updatedRoom =
        state.currentRoom.type === 'condo' && state.currentRoom.ownerName === state.myCat.name
          ? { ...state.currentRoom, condoConfig: updated }
          : state.currentRoom;

      return {
        myCondo: updated,
        currentRoom: updatedRoom,
      };
    }),
  enterMyCondo: () => {
    const { myCat, myCondo, setCurrentRoom, setNotification } = get();
    const condoRoom: RoomData = {
      id: `condo-${myCat.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: `คอนโดของ ${myCat.name} 🏡`,
      type: 'condo',
      theme: 'condo',
      maxCapacity: 10,
      ownerName: myCat.name,
      condoConfig: myCondo,
    };
    setCurrentRoom(condoRoom);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('wecats-self-pos-sync', {
          detail: { x: 800, y: 580, direction: 'down', isMoving: false },
        })
      );
    }
    setNotification(`ยินดีต้อนรับกลับบ้าน "${myCat.name}"! 🏡🛋️✨`);
  },
  visitFriendCondo: (friendCatName, config) => {
    const { setCurrentRoom, setNotification } = get();
    const condoRoom: RoomData = {
      id: `condo-${friendCatName.toLowerCase().replace(/\s+/g, '_')}`,
      name: `บ้านของ ${friendCatName} 🏡`,
      type: 'condo',
      theme: 'condo',
      maxCapacity: 10,
      ownerName: friendCatName,
      condoConfig: config || DEFAULT_CONDO,
    };
    setCurrentRoom(condoRoom);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('wecats-self-pos-sync', {
          detail: { x: 800, y: 800, direction: 'up', isMoving: false },
        })
      );
    }
    setNotification(`วาร์ปมาถึงบ้านของ "${friendCatName}" แล้ว! 🏡🎉`);
  },
  exitCondoToPlaza: () => {
    const { setCurrentRoom, setNotification } = get();
    const defaultSakura: RoomData = {
      id: 'public-sakura',
      name: 'Plaza #1: สวนซากุระ',
      type: 'public',
      theme: 'sakura',
      maxCapacity: 20,
    };
    setCurrentRoom(defaultSakura);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('wecats-self-pos-sync', {
          detail: { x: 1100, y: 750, direction: 'down', isMoving: false },
        })
      );
    }
    setNotification('ก้าวออกจากบ้านสู่สวนซากุระ Plaza #1 🌸');
  },
  toggleCameraZoom: () =>
    set((state) => {
      const nextMode = state.cameraZoomMode === 'close' ? 'wide' : 'close';
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('wecats_camera_zoom', nextMode);
        } catch {}
      }
      return { cameraZoomMode: nextMode };
    }),
  setCameraZoomMode: (mode) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('wecats_camera_zoom', mode);
      } catch {}
    }
    set({ cameraZoomMode: mode });
  },
  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),

  // Economy Actions
  addFishCoins: (amount, reason) => {
    set((state) => {
      const newCoins = state.fishCoins + amount;
      if (reason) {
        state.addDiaryEntry(`ได้รับเหรียญปลาทู +${amount} 🐟`, reason, '🐟', amount, 'care');
      }
      return { fishCoins: newCoins };
    });
  },

  buyShopItem: (item) => {
    const { fishCoins, unlockedItems, stats } = get();
    if (fishCoins < item.price) return false;

    // If it's a consumable treat
    if (item.category === 'treats') {
      if (item.id === 'treat_salmon') {
        set((state) => ({
          fishCoins: state.fishCoins - item.price,
          stats: {
            ...state.stats,
            happiness: Math.min(100, state.stats.happiness + 30),
            affectionExp: state.stats.affectionExp + 40,
          },
        }));
        get().addDiaryEntry('ป้อนขนมแมวเลียแซลมอน 🍣', 'โมจิกินขนมแมวเลียอย่างเอร็ดอร่อย เลียปากแผล็บๆ', '🍣', 0, 'care');
      } else if (item.id === 'treat_catnip') {
        set((state) => ({
          fishCoins: state.fishCoins - item.price,
          stats: {
            ...state.stats,
            zoomiesEnergy: 100,
            isZooming: true,
          },
        }));
        get().addDiaryEntry('ให้ผงแคทนิปอินทรีย์ 🌿', 'โมจิดมแคทนิปแล้วพลัง Zoomies พลุ่งพล่าน!', '🌿', 0, 'care');
      } else if (item.id === 'treat_tuna_can') {
        set((state) => ({
          fishCoins: state.fishCoins - item.price,
          stats: {
            ...state.stats,
            hunger: Math.min(100, state.stats.hunger + 40),
            weightKg: +(state.stats.weightKg + 0.1).toFixed(1),
          },
        }));
        get().addDiaryEntry('กินปลากระป๋องทูน่าเยลลี่ 🥫', 'โมจิกินทูน่าจนพุงกาง น้ำหนักขึ้น +0.1kg', '🥫', 0, 'care');
      }
      return true;
    }

    // If already owned
    if (unlockedItems.includes(item.id)) return true;

    set((state) => ({
      fishCoins: state.fishCoins - item.price,
      unlockedItems: [...state.unlockedItems, item.id],
    }));

    get().addDiaryEntry(`ซื้อไอเทมใหม่: ${item.name}`, item.description, item.icon, 0, 'care');
    return true;
  },

  // Diary Actions
  addDiaryEntry: (title, description, icon, coinsEarned = 0, category = 'care') => {
    const entry: DiaryEntry = {
      id: `diary-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      timestamp: Date.now(),
      icon,
      coinsEarned,
      category,
    };
    set((state) => ({
      diaryEntries: [entry, ...state.diaryEntries].slice(0, 50), // keep latest 50
    }));
  },

  savePhoto: (photo) => {
    set((state) => ({
      savedPhotos: [photo, ...state.savedPhotos],
    }));
    get().addDiaryEntry(`บันทึกรูปภาพโพลารอยด์ 📸`, `ถ่ายภาพที่ ${photo.location}: "${photo.caption}"`, '📸', 15, 'photo');
    get().addFishCoins(15);
  },

  deletePhoto: (id) => {
    set((state) => ({
      savedPhotos: state.savedPhotos.filter((p) => p.id !== id),
    }));
  },

  // Social Actions
  addFriend: (cat) => {
    set((state) => {
      if (state.friends.some((f) => f.id === cat.id)) return state;
      const newFriend: FriendData = {
        id: cat.id,
        username: cat.customization.name,
        catName: cat.customization.name,
        breed: cat.customization.breed,
        customization: cat.customization,
        isOnline: true,
        friendshipPoints: 20,
      };
      state.addDiaryEntry(`ได้เพื่อนใหม่: ${cat.customization.name} 🤝`, `ผูกมิตรกับเพื่อนแมวใน Plaza เรียบร้อยแล้ว`, '🤝', 20, 'social');
      state.addFishCoins(20);
      return { friends: [...state.friends, newFriend] };
    });
  },

  addFriendFromPeer: (friend) => {
    set((state) => {
      if (state.friends.some((f) => f.id === friend.id || f.catName === friend.catName)) return state;
      state.addDiaryEntry(`ได้เพื่อนใหม่: ${friend.catName} 🤝`, `ผูกมิตรกับเพื่อนแมวใน Plaza เรียบร้อยแล้ว`, '🤝', 20, 'social');
      state.addFishCoins(20);
      return { friends: [...state.friends, friend] };
    });
  },

  sendFriendRequestToCat: (targetCat) => {
    const isAlreadyFriend = get().friends.some((f) => f.id === targetCat.id);
    if (isAlreadyFriend) {
      get().setNotification(`คุณและ ${targetCat.customization.name} เป็นเพื่อนกันอยู่แล้ว 💕`);
      return;
    }
    broadcastLiveFriendRequest(targetCat.id);
    get().setNotification(`ส่งคำขอเป็นเพื่อนไปยัง ${targetCat.customization.name} แล้ว! 💌 รอการตอบรับ`);
  },

  receiveFriendRequest: (request) => {
    set((state) => {
      if (state.pendingFriendRequests.some((r) => r.id === request.id || r.senderId === request.senderId)) {
        return state;
      }
      return {
        pendingFriendRequests: [request, ...state.pendingFriendRequests],
      };
    });
    broadcastCrossTabFriendRequest(request);
  },

  acceptFriendRequest: (requestId) => {
    const req = get().pendingFriendRequests.find((r) => r.id === requestId);
    if (!req) return;

    broadcastLiveFriendAccepted(req.senderId);

    const newFriend: FriendData = {
      id: req.senderId,
      username: req.senderName,
      catName: req.senderName,
      breed: req.senderCustomization.breed,
      customization: req.senderCustomization,
      isOnline: true,
      friendshipPoints: 20,
    };

    set((state) => ({
      pendingFriendRequests: state.pendingFriendRequests.filter((r) => r.id !== requestId),
      friends: state.friends.some((f) => f.id === req.senderId) ? state.friends : [...state.friends, newFriend],
    }));

    broadcastCrossTabFriendAccepted(newFriend);

    get().addDiaryEntry(`ตอบรับคำขอเป็นเพื่อนกับ ${req.senderName} 💕`, 'กลายเป็นเพื่อนสนิทใน WeCats Plaza!', '💕', 25, 'social');
    get().addFishCoins(25);
    get().setNotification(`ยอมรับคำขอเป็นเพื่อนกับ ${req.senderName} แล้ว! 💕 เป็นเพื่อนกันแล้ว`);
  },

  declineFriendRequest: (requestId) => {
    set((state) => ({
      pendingFriendRequests: state.pendingFriendRequests.filter((r) => r.id !== requestId),
    }));
    get().setNotification('ปฏิเสธคำขอเป็นเพื่อนแล้ว');
  },

  sendDirectMessage: (friendId, text) => {
    const myCat = get().myCat;
    const dm: DirectMessage = {
      id: `dm-${Date.now()}`,
      fromPeerId: 'self',
      toPeerId: friendId,
      senderName: myCat.name,
      text,
      timestamp: Date.now(),
    };

    broadcastLiveDirectMessage(friendId, text);
    broadcastCrossTabDM(friendId, dm);

    set((state) => ({
      directMessages: {
        ...state.directMessages,
        [friendId]: [...(state.directMessages[friendId] || []), dm],
      },
    }));
  },

  receiveDirectMessage: (msg) => {
    const friendKey = msg.fromPeerId;
    set((state) => ({
      directMessages: {
        ...state.directMessages,
        [friendKey]: [...(state.directMessages[friendKey] || []), msg],
      },
    }));
    broadcastCrossTabDM(friendKey, msg);
  },

  sendTreatToFriend: (friendId) => {
    const { fishCoins } = get();
    if (fishCoins < 15) {
      get().setNotification('เหรียญปลาทูไม่พอสำหรับส่งขนม (ต้องใช้ 15 🐟)');
      return;
    }

    set((state) => ({
      fishCoins: state.fishCoins - 15,
      friends: state.friends.map((f) =>
        f.id === friendId
          ? { ...f, friendshipPoints: f.friendshipPoints + 15, lastGiftReceived: Date.now() }
          : f
      ),
    }));
    get().setNotification('ส่งขนมแมวเลียให้เพื่อนสำเร็จ! 🍣 +15 คะแนนมิตรภาพ');
  },

  // Achievement Actions
  claimAchievement: (id) => {
    set((state) => {
      const ach = state.achievements.find((a) => a.id === id);
      if (!ach || ach.isClaimed || ach.progress < ach.target) return state;

      state.addFishCoins(ach.rewardCoins, `ปลดล็อกรางวัล: ${ach.title}`);
      return {
        achievements: state.achievements.map((a) =>
          a.id === id ? { ...a, isClaimed: true } : a
        ),
      };
    });
  },

  // Multi-Cat Actions
  switchCatSlot: (slotIndex) => {
    const { catSlots, myCat, stats, currentSlotIndex } = get();
    // Save current active cat to its slot
    const updatedSlots = [...catSlots];
    updatedSlots[currentSlotIndex] = {
      slotIndex: currentSlotIndex,
      customization: myCat,
      stats,
    };

    const targetSlot = updatedSlots[slotIndex];
    if (targetSlot) {
      set({
        currentSlotIndex: slotIndex,
        catSlots: updatedSlots,
        myCat: targetSlot.customization,
        stats: targetSlot.stats,
      });
      get().setNotification(`สลับเป็นน้องแมว ${targetSlot.customization.name} เรียบร้อย 🐾`);
    }
  },

  createCatSlot: (slotIndex, customization) => {
    set((state) => {
      const newSlot: CatSlot = {
        slotIndex,
        customization,
        stats: { ...DEFAULT_STATS },
      };
      const updated = [...state.catSlots];
      updated[slotIndex] = newSlot;
      return {
        catSlots: updated,
        currentSlotIndex: slotIndex,
        myCat: customization,
        stats: { ...DEFAULT_STATS },
      };
    });
    get().setNotification(`รับเลี้ยงน้องแมวตัวใหม่ ${customization.name} เรียบร้อย! 🌸`);
  },

  updateCustomization: (updates) =>
    set((state) => ({
      myCat: { ...state.myCat, ...updates },
    })),

  setMyCatPosition: (x, y, vx, vy, dir, behavior) => {},

  feedCat: (type) => {
    set((state) => {
      const boost = type === 'dry' ? 25 : type === 'wet' ? 35 : 15;
      const weightDelta = type === 'dry' ? 0.05 : type === 'wet' ? 0.08 : 0.02;
      const happinessBoost = type === 'treat' ? 20 : 10;
      const newHunger = Math.min(100, state.stats.hunger + boost);
      const newHappiness = Math.min(100, state.stats.happiness + happinessBoost);
      const newWeight = +(state.stats.weightKg + weightDelta).toFixed(2);
      const newExp = state.stats.affectionExp + 15;
      const newLevel = Math.floor(newExp / 100) + 1;

      state.addFishCoins(10);
      state.addDiaryEntry(
        `ป้อนอาหารน้องแมว (${type === 'dry' ? 'อาหารเม็ด' : type === 'wet' ? 'อาหารเปียก' : 'ขนม'}) 🐟`,
        `ความอิ่ม +${boost}%, น้ำหนัก +${weightDelta}kg, ได้รับ +10 🐟`,
        '🐟',
        10,
        'care'
      );

      const updatedStats = {
        ...state.stats,
        hunger: newHunger,
        happiness: newHappiness,
        weightKg: newWeight,
        affectionExp: newExp,
        affectionLevel: newLevel,
        lastFed: Date.now(),
      };

      broadcastCrossTabStats(updatedStats);

      return {
        stats: updatedStats,
      };
    });
  },

  waterCat: () => {
    set((state) => {
      const newHydration = Math.min(100, state.stats.hydration + 30);
      const newExp = state.stats.affectionExp + 10;
      state.addFishCoins(5);
      state.addDiaryEntry('ดื่มน้ำสะอาด 💧', 'ความชุ่มชื้น +30%, ได้รับ +5 🐟', '💧', 5, 'care');

      const updatedStats = {
        ...state.stats,
        hydration: newHydration,
        affectionExp: newExp,
        lastWatered: Date.now(),
      };

      broadcastCrossTabStats(updatedStats);

      return {
        stats: updatedStats,
      };
    });
  },

  groomCat: () => {
    set((state) => {
      const newHygiene = Math.min(100, state.stats.hygiene + 35);
      const newHappiness = Math.min(100, state.stats.happiness + 15);
      const newExp = state.stats.affectionExp + 20;
      state.addFishCoins(15);
      state.addDiaryEntry('แปรงขนสางก้อนขน ✨', 'ความสะอาด +35%, ขนฟูนุ่มเงางาม, ได้รับ +15 🐟', '✨', 15, 'care');

      const updatedStats = {
        ...state.stats,
        hygiene: newHygiene,
        happiness: newHappiness,
        affectionExp: newExp,
        lastGroomed: Date.now(),
      };

      broadcastCrossTabStats(updatedStats);

      return {
        stats: updatedStats,
      };
    });
  },

  petCat: () => {
    set((state) => {
      const newHappiness = Math.min(100, state.stats.happiness + 20);
      const newExp = state.stats.affectionExp + 25;
      const newLevel = Math.floor(newExp / 100) + 1;
      state.addFishCoins(8);
      state.addDiaryEntry('ลูบหัวเกาคาง 💖', 'โมจินอนครางเพอร์อย่างมีความสุข, ได้รับ +8 🐟', '💖', 8, 'care');

      const updatedStats = {
        ...state.stats,
        happiness: newHappiness,
        affectionExp: newExp,
        affectionLevel: newLevel,
      };

      broadcastCrossTabStats(updatedStats);

      return {
        stats: updatedStats,
      };
    });
  },

  triggerZoomies: () => {
    set((state) => {
      if (state.stats.zoomiesEnergy < 30) {
        state.setNotification('พลัง Zoomies ยังไม่พอ (ต้องการอย่างน้อย 30%) ⚡');
        return state;
      }
      state.addFishCoins(20);
      state.addDiaryEntry('เริ่มการวิ่ง Zoomies กระจาย ⚡', 'โมจิออกวิ่งสปีดเต็มสปีดรอบ Plaza, ได้รับ +20 🐟', '⚡', 20, 'care');

      const updatedStats = {
        ...state.stats,
        isZooming: true,
        zoomiesEnergy: 0,
        happiness: 100,
      };

      broadcastCrossTabStats(updatedStats);

      return {
        stats: updatedStats,
      };
    });
  },

  interactWithProp: (prop) => {
    const { addFishCoins, addDiaryEntry, setNotification } = get();
    if (prop.actionType === 'water') {
      get().waterCat();
      setNotification('ดื่มน้ำพุแร่ธรรมชาติสดชื่น! ⛲ +5 🐟');
    } else if (prop.actionType === 'food') {
      get().feedCat('wet');
      setNotification('กินแซลมอนบุฟเฟ่ต์สุดอร่อย! 🐟 +10 🐟');
    } else if (prop.actionType === 'scratch') {
      set((state) => ({
        stats: {
          ...state.stats,
          hygiene: Math.min(100, state.stats.hygiene + 20),
          happiness: Math.min(100, state.stats.happiness + 15),
        },
      }));
      addFishCoins(12);
      addDiaryEntry('ลับเล็บกับเสาเชือกป่าน 🪵', 'เล็บคมสวยและอารมณ์ดี, ได้รับ +12 🐟', '🪵', 12, 'care');
      setNotification('ลับเล็บสุดมันส์! 🪵 +12 🐟');
    } else if (prop.actionType === 'laser') {
      set((state) => ({
        stats: {
          ...state.stats,
          zoomiesEnergy: Math.min(100, state.stats.zoomiesEnergy + 40),
          happiness: 100,
        },
      }));
      addFishCoins(15);
      addDiaryEntry('ไล่ตะปบจุดเลเซอร์สีแดง 🔴', 'กระโดดตะปบเลเซอร์อย่างตื่นเต้น, ได้รับ +15 🐟', '🔴', 15, 'care');
      setNotification('ตะปบเลเซอร์แดง! 🔴 +15 🐟');
    } else if (prop.actionType === 'sleep') {
      set((state) => ({
        stats: {
          ...state.stats,
          energy: Math.min(100, state.stats.energy + 35),
          happiness: Math.min(100, state.stats.happiness + 10),
        },
      }));
      addFishCoins(10);
      addDiaryEntry('นอนอาบแดดอุ่นสบาย ☀️', 'ฟื้นฟูพลังงาน Energy +35%, ได้รับ +10 🐟', '☀️', 10, 'care');
      setNotification('นอนอาบแดดอุ่นสบาย~ ☀️ +10 🐟');
    } else if (prop.actionType === 'tea') {
      set((state) => ({
        stats: {
          ...state.stats,
          hunger: Math.min(100, state.stats.hunger + 30),
          happiness: Math.min(100, state.stats.happiness + 25),
        },
      }));
      addFishCoins(12);
      addDiaryEntry('กินดังโงะและจิบชาเขียวมัทฉะ 🍡', 'อิ่มอร่อยกับขนมดังโงะ 3 สีใต้ต้นซากุระ, ได้รับ +12 🐟', '🍡', 12, 'care');
      setNotification('กินดังโงะ 3 สีแสนอร่อย! 🍡 +12 🐟');
    } else if (prop.actionType === 'koi') {
      set((state) => ({
        stats: {
          ...state.stats,
          happiness: Math.min(100, state.stats.happiness + 20),
          affectionExp: state.stats.affectionExp + 25,
        },
      }));
      addFishCoins(12);
      addDiaryEntry('ให้อาหารปลาคาร์ปริมสะพาน 🐟', 'ชมปลาคาร์ปญี่ปุ่นว่ายน้ำอย่างเพลิดเพลิน, ได้รับ +12 🐟', '🐟', 12, 'care');
      setNotification('ชมปลาคาร์ปว่ายน้ำดุ๊กดิ๊ก! 🐟 +12 🐟');
    } else if (prop.actionType === 'windmill') {
      set((state) => ({
        stats: {
          ...state.stats,
          zoomiesEnergy: Math.min(100, state.stats.zoomiesEnergy + 30),
          happiness: Math.min(100, state.stats.happiness + 15),
        },
      }));
      addFishCoins(10);
      addDiaryEntry('ยืนรับลมชมกังหันลมหมุน 🌾', 'สายลมสดชื่นพัดผ่านทุ่งหญ้าแดดอุ่น, ได้รับ +10 🐟', '🌾', 10, 'care');
      setNotification('รับลมเย็นสบายใต้กังหันลม! 🌾 +10 🐟');
    } else if (prop.actionType === 'tent') {
      set((state) => ({
        stats: {
          ...state.stats,
          energy: Math.min(100, state.stats.energy + 40),
          happiness: Math.min(100, state.stats.happiness + 20),
        },
      }));
      addFishCoins(15);
      addDiaryEntry('นอนพักในเต็นท์กระโจม ⛺', 'นอนแคมป์ปิ้งบนกองฟางนุ่มๆ อบอุ่นสบาย, ได้รับ +15 🐟', '⛺', 15, 'care');
      setNotification('นอนพักผ่อนในเต็นท์แคมป์ปิ้ง! ⛺ +15 🐟');
    } else if (prop.actionType === 'campfire') {
      set((state) => ({
        stats: {
          ...state.stats,
          happiness: Math.min(100, state.stats.happiness + 25),
          affectionExp: state.stats.affectionExp + 20,
        },
      }));
      addFishCoins(12);
      addDiaryEntry('ผิงไฟอุ่นๆ ข้างกองฟืน 🔥', 'ฟังเสียงฟืนเปาะแปะยามค่ำคืนอย่างอบอุ่นใจ, ได้รับ +12 🐟', '🔥', 12, 'care');
      setNotification('ผิงไฟอุ่นสบายใต้แสงดาว! 🔥 +12 🐟');
    } else if (prop.actionType === 'gramophone') {
      set((state) => ({
        stats: {
          ...state.stats,
          happiness: 100,
          affectionExp: state.stats.affectionExp + 30,
        },
      }));
      addFishCoins(15);
      addDiaryEntry('ฟังเพลง Lofi แผ่นเสียงไวนิล 🎵', 'ท่วงทำนอง Lofi ชวนฝันเคลิบเคลิ้ม, ได้รับ +15 🐟', '🎵', 15, 'care');
      setNotification('ฟังเพลง Lofi ชวนฝันเคลิบเคลิ้ม~ 🎵 +15 🐟');
    } else if (prop.actionType === 'telescope') {
      set((state) => ({
        stats: {
          ...state.stats,
          happiness: 100,
          affectionExp: state.stats.affectionExp + 35,
        },
      }));
      addFishCoins(15);
      addDiaryEntry('ส่องกล้องดูดวงดาวและดาวตก 🔭', 'พบกลุ่มดาวแมวเหมียวบนท้องฟ้าราตรี, ได้รับ +15 🐟', '🔭', 15, 'care');
      setNotification('ส่องกล้องพบดาวตกพาดผ่านฟ้า! 🔭 +15 🐟');
    } else if (prop.actionType === 'exit_condo') {
      get().exitCondoToPlaza();
    }
  },

  sniffCat: (targetId) => {
    const target = get().onlineCats.find((c) => c.id === targetId);
    if (!target) return;
    get().addFriend(target);
    get().setNotification(`ดมก้นทักทายกับ ${target.customization.name} สำเร็จ! 🐾 เป็นเพื่อนกันแล้ว`);
  },

  allogroomCat: (targetId) => {
    const target = get().onlineCats.find((c) => c.id === targetId);
    if (!target) return;
    get().addFishCoins(15);
    get().addDiaryEntry(`ช่วยเลียขนให้ ${target.customization.name} 💕`, `มิตรภาพแมวเติบโตแน่นแฟ้น, ได้รับ +15 🐟`, '💕', 15, 'social');
    get().setNotification(`เลียขนให้ ${target.customization.name} 💕 +15 🐟`);
  },

  sendChatMessage: (text) => {
    const roomId = get().currentRoom.id;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'self',
      senderName: get().myCat.name,
      text,
      timestamp: Date.now(),
    };
    set((state) => {
      const roomMsgs = [...(state.chatMessagesByRoom[roomId] || []), newMsg];
      const updatedByRoom = {
        ...state.chatMessagesByRoom,
        [roomId]: roomMsgs,
      };
      saveChatHistory(updatedByRoom);

      return {
        chatMessagesByRoom: updatedByRoom,
        chatMessages: roomMsgs,
        myCatChat: { text, emote: null },
      };
    });

    // Real-time broadcast to other tabs of the same browser
    broadcastCrossTabChat(roomId, newMsg);

    setTimeout(() => {
      set({ myCatChat: { text: null, emote: null } });
    }, 4500);
  },

  sendEmote: (emote) => {
    const roomId = get().currentRoom.id;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'self',
      senderName: get().myCat.name,
      text: emote,
      timestamp: Date.now(),
      isEmote: true,
    };
    set((state) => {
      const roomMsgs = [...(state.chatMessagesByRoom[roomId] || []), newMsg];
      const updatedByRoom = {
        ...state.chatMessagesByRoom,
        [roomId]: roomMsgs,
      };
      saveChatHistory(updatedByRoom);

      return {
        chatMessagesByRoom: updatedByRoom,
        chatMessages: roomMsgs,
        myCatChat: { text: null, emote },
      };
    });

    // Real-time broadcast to other tabs of the same browser
    broadcastCrossTabChat(roomId, newMsg);

    setTimeout(() => {
      set({ myCatChat: { text: null, emote: null } });
    }, 4500);
  },

  receiveChatMessage: (senderId, senderName, text, targetRoomId) => {
    const roomId = targetRoomId || get().currentRoom.id;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId,
      senderName,
      text,
      timestamp: Date.now(),
    };
    set((state) => {
      const roomMsgs = [...(state.chatMessagesByRoom[roomId] || []), newMsg];
      const updatedByRoom = {
        ...state.chatMessagesByRoom,
        [roomId]: roomMsgs,
      };
      saveChatHistory(updatedByRoom);

      const isCurrent = state.currentRoom.id === roomId;
      const isExpanded = state.isChatExpanded;
      const newUnread = isCurrent && !isExpanded ? state.unreadChatCount + 1 : state.unreadChatCount;

      return {
        chatMessagesByRoom: updatedByRoom,
        chatMessages: isCurrent ? roomMsgs : state.chatMessages,
        unreadChatCount: newUnread,
      };
    });
  },

  syncCrossTabChatMessage: (roomId, msg) => {
    set((state) => {
      const existingMsgs = state.chatMessagesByRoom[roomId] || [];
      if (existingMsgs.some((m) => m.id === msg.id)) return state;

      const roomMsgs = [...existingMsgs, msg];
      const updatedByRoom = {
        ...state.chatMessagesByRoom,
        [roomId]: roomMsgs,
      };
      saveChatHistory(updatedByRoom);

      const isCurrent = state.currentRoom.id === roomId;
      return {
        chatMessagesByRoom: updatedByRoom,
        chatMessages: isCurrent ? roomMsgs : state.chatMessages,
        myCatChat: msg.senderId === 'self' ? { text: msg.isEmote ? null : msg.text, emote: msg.isEmote ? msg.text : null } : state.myCatChat,
      };
    });

    if (msg.senderId === 'self') {
      setTimeout(() => {
        set({ myCatChat: { text: null, emote: null } });
      }, 4500);
    }
  },

  setIsChatExpanded: (expanded) => {
    set((state) => ({
      isChatExpanded: expanded,
      unreadChatCount: expanded ? 0 : state.unreadChatCount,
    }));
  },

  clearUnreadChat: () => {
    set({ unreadChatCount: 0 });
  },

  setSelectedNearbyCat: (cat) => set({ selectedNearbyCat: cat }),
  setOnlineCats: (catsOrUpdater) =>
    set((state) => {
      const raw = typeof catsOrUpdater === 'function' ? catsOrUpdater(state.onlineCats) : catsOrUpdater;
      if (!Array.isArray(raw)) return state;

      const myName = state.myCat.name;
      const seen = new Set<string>();
      const deduplicated: OnlineCat[] = [];

      for (const cat of raw) {
        if (!cat || !cat.id) continue;
        const catName = cat.customization?.name;
        // Exclude own cat
        if (catName && catName === myName) continue;

        const uniqueKey = catName || cat.id;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          deduplicated.push(cat);
        }
      }

      return { onlineCats: deduplicated };
    }),
  setActiveNearbyProp: (prop) => set({ activeNearbyProp: prop }),
  setNotification: (text) => set({ notificationText: text }),

  tickBiology: () => {
    set((state) => {
      const hunger = Math.max(0, state.stats.hunger - 0.05);
      const hydration = Math.max(0, state.stats.hydration - 0.06);
      const hygiene = Math.max(0, state.stats.hygiene - 0.03);
      const zoomies = Math.min(100, state.stats.zoomiesEnergy + 0.08);

      let happiness = state.stats.happiness;
      if (hunger < 30 || hydration < 30) happiness = Math.max(0, happiness - 0.1);

      return {
        stats: {
          ...state.stats,
          hunger,
          hydration,
          hygiene,
          zoomiesEnergy: zoomies,
          happiness,
        },
      };
    });
  },
}));
