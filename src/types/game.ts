export type BreedType = 'persian' | 'munchkin' | 'siamese' | 'calico' | 'scottish' | 'bengal' | 'orange_tabby' | 'black_cat';
export type BodyType = 'slim' | 'normal' | 'chonky' | 'munchkin';
export type EarType = 'pointed' | 'folded' | 'curled' | 'round';
export type TailType = 'straight' | 'fluffy' | 'bobtail' | 'kinked';
export type EyeType = 'round' | 'almond' | 'sparkle' | 'sleepy';
export type PatternType = 'solid' | 'tabby' | 'tuxedo' | 'calico' | 'siamese' | 'cow' | 'tiger';
export type HeadAccessory = 'none' | 'straw_hat' | 'flower_crown' | 'wizard_hat' | 'beret' | 'pink_bow' | 'chef_hat' | 'party_hat' | 'princess_tiara' | 'frog_hat' | 'detective_hat';
export type NeckAccessory = 'none' | 'gold_bell' | 'red_ribbon' | 'pink_scarf' | 'fish_pendant' | 'bowtie' | 'pearl_necklace' | 'rainbow_collar';
export type BackAccessory = 'none' | 'backpack' | 'angel_wings' | 'toast_slice' | 'cape' | 'butterfly_wings' | 'dragon_wings';
export type FaceAccessory = 'none' | 'sunglasses' | 'monocle' | 'cute_blush' | 'heart_glasses' | 'mustache';
export type AuraEffect = 'none' | 'sparkles' | 'hearts' | 'music_notes' | 'paw_prints' | 'stars' | 'rainbow' | 'cherry_blossoms';
export type PersonalityType = 'cuddly' | 'chaotic' | 'curious' | 'timid' | 'sleepy' | 'noble';

export interface CatCustomization {
  name: string;
  gender: 'boy' | 'girl';
  breed: BreedType;
  bodyType: BodyType;
  earType: EarType;
  tailType: TailType;
  eyeType: EyeType;
  eyeColorLeft: string;
  eyeColorRight: string;
  baseColor: string;
  patternType: PatternType;
  patternColor: string;
  snoutColor: string;
  pawColor: string;
  bellyColor: string;
  accessoryHead: HeadAccessory;
  accessoryNeck: NeckAccessory;
  accessoryBack: BackAccessory;
  accessoryFace: FaceAccessory;
  aura: AuraEffect;
  personality: PersonalityType;
}

export interface CatStats {
  hunger: number; // 0 - 100
  hydration: number; // 0 - 100
  energy: number; // 0 - 100
  happiness: number; // 0 - 100
  hygiene: number; // 0 - 100
  weightKg: number; // 3.0 - 9.0 kg
  zoomiesEnergy: number; // 0 - 100
  isZooming: boolean;
  affectionExp: number;
  affectionLevel: number;
  lastFed: number;
  lastWatered: number;
  lastGroomed: number;
  lastSlept: number;
}

export type CatBehavior =
  | 'idle'
  | 'walking'
  | 'running'
  | 'sleeping'
  | 'eating'
  | 'drinking'
  | 'grooming'
  | 'scratching'
  | 'zoomies'
  | 'sniffing'
  | 'allogrooming'
  | 'pouncing';

export interface OnlineCat {
  id: string;
  isSelf?: boolean;
  customization: CatCustomization;
  stats: CatStats;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  direction: 'up' | 'down' | 'left' | 'right';
  behavior: CatBehavior;
  isMoving?: boolean;
  currentEmote?: string | null;
  emoteTimer?: number;
  chatMessage?: string | null;
  chatTimer?: number;
  targetCatId?: string | null;
  lastUpdated?: number;
}

export interface InteractiveProp {
  id: string;
  type: 'water_fountain' | 'food_bowl' | 'scratch_post' | 'cat_tree' | 'cardboard_box' | 'sun_patch' | 'laser_pointer' | 'fish_pond' | 'catnip_patch';
  name: string;
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  icon: string;
  actionType: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isEmote?: boolean;
}

// --- NEW EXPANSION TYPES ---

export type ShopCategory = 'hats' | 'neck' | 'back' | 'face' | 'aura' | 'treats';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DiaryEntry {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  icon: string;
  coinsEarned?: number;
  category: 'care' | 'social' | 'explore' | 'photo';
}

export interface SavedPhoto {
  id: string;
  dataUrl: string;
  caption: string;
  location: string;
  timestamp: number;
  filter?: string;
}

export interface FriendData {
  id: string;
  username: string;
  catName: string;
  breed: BreedType;
  isOnline: boolean;
  friendshipPoints: number;
  lastGiftReceived?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'care' | 'social' | 'explorer' | 'collector';
  progress: number;
  target: number;
  rewardCoins: number;
  isClaimed: boolean;
}

export interface CatSlot {
  slotIndex: number;
  customization: CatCustomization;
  stats: CatStats;
}

export interface RoomData {
  id: string;
  name: string;
  type: 'public' | 'private';
  theme: 'sakura' | 'sunshine' | 'moonlight';
  maxCapacity: number;
  currentCount?: number;
}

