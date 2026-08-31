'use client';

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// 🐟 1. Fish Coin (Main Currency)
export const FishCoinIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <circle cx="12" cy="12" r="10" fill="#FFC107" stroke="#D97706" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="7.5" fill="#FFE082" stroke="#F59E0B" strokeWidth="1" />
    {/* Fish Motif */}
    <path
      d="M16 12C15 9.8 11.5 9.5 9 11C7.5 12 7.5 12 6 10.5V13.5C7.5 12 7.5 12 9 13C11.5 14.5 15 14.2 16 12Z"
      fill="#D97706"
    />
    <circle cx="14" cy="11.5" r="0.8" fill="#FFF" />
  </svg>
);

// 🐾 2. Cozy Cat Paw (Identity & Navigation)
export const CatPawIcon: React.FC<IconProps> = ({ size = 20, className = '', color = '#523E32' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    {/* Main Palm */}
    <path
      d="M12 10.5C9.2 10.5 7.5 12.8 7.5 15.5C7.5 18 9.5 20 12 20C14.5 20 16.5 18 16.5 15.5C16.5 12.8 14.8 10.5 12 10.5Z"
      fill={color}
    />
    {/* Toes */}
    <ellipse cx="6.5" cy="10" rx="2" ry="2.8" fill={color} />
    <ellipse cx="10" cy="6.8" rx="2.2" ry="3" fill={color} />
    <ellipse cx="14" cy="6.8" rx="2.2" ry="3" fill={color} />
    <ellipse cx="17.5" cy="10" rx="2" ry="2.8" fill={color} />
  </svg>
);

// 🍲 3. Food Bowl (Hunger & Feeding)
export const FoodBowlIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    {/* Bowl base */}
    <path
      d="M3 10C3 15.5 7 20 12 20C17 20 21 15.5 21 10H3Z"
      fill="#FFB5C5"
      stroke="#523E32"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Food content */}
    <ellipse cx="12" cy="10" rx="8.5" ry="3.5" fill="#FF758F" stroke="#523E32" strokeWidth="1.5" />
    {/* Fish bone design on bowl */}
    <path d="M10 15H14M11 13.5L13 16.5M13 13.5L11 16.5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 💧 4. Water Droplet (Hydration & Fountain)
export const WaterDropIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <path
      d="M12 2.5C12 2.5 5 11 5 15.5C5 19.3 8.1 22 12 22C15.9 22 19 19.3 19 15.5C19 11 12 2.5 12 2.5Z"
      fill="#90E0EF"
      stroke="#0077B6"
      strokeWidth="1.8"
    />
    {/* Highlight reflection */}
    <path
      d="M9 13.5C8.5 15 9 17.5 11 18.5"
      stroke="#FFF"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// ✨ 5. Grooming Brush (Hygiene & Fur Care)
export const GroomBrushIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    {/* Brush Back */}
    <rect x="5" y="4" width="14" height="7" rx="3" fill="#DDB892" stroke="#523E32" strokeWidth="1.8" />
    {/* Bristles */}
    <path d="M7 11V16M10 11V17M12 11V17M14 11V17M17 11V16" stroke="#523E32" strokeWidth="1.6" strokeLinecap="round" />
    {/* Handle */}
    <path d="M12 4V2" stroke="#523E32" strokeWidth="2" strokeLinecap="round" />
    {/* Sparkle */}
    <path d="M18 3L19 5L21 6L19 7L18 9L17 7L15 6L17 5L18 3Z" fill="#FFD166" />
  </svg>
);

// 💖 6. Petting Heart (Affection & Bonding)
export const PetHeartIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <path
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
      fill="#FF8FA3"
      stroke="#523E32"
      strokeWidth="1.8"
    />
    {/* Gentle shine */}
    <path d="M6 7C6 5.5 7.5 4.5 9 4.5" stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// ⚡ 7. Laser & Zoomies Energy
export const LaserZapIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      fill="#FFD166"
      stroke="#D97706"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

// 📸 8. Polaroid Photo Camera
export const PhotoCameraIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <rect x="2.5" y="6" width="19" height="15" rx="4" fill="#F8EDEB" stroke="#523E32" strokeWidth="1.8" />
    <path d="M7 6L8.5 3.5H15.5L17 6H7Z" fill="#FFCAD4" stroke="#523E32" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="12" cy="13.5" r="4.2" fill="#BDE0FE" stroke="#523E32" strokeWidth="1.8" />
    <circle cx="12" cy="13.5" r="2" fill="#523E32" />
    <circle cx="18" cy="9.5" r="1.2" fill="#FF758F" />
  </svg>
);

// 🛍️ 9. Boutique Bag (Shop)
export const BoutiqueBagIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <path
      d="M4.5 9H19.5L18 21H6L4.5 9Z"
      fill="#FFE5A3"
      stroke="#523E32"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 9V6C8.5 4.1 10.1 2.5 12 2.5C13.9 2.5 15.5 4.1 15.5 6V9"
      stroke="#523E32"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="14" r="2" fill="#FF8FA3" />
  </svg>
);

// 📖 10. Diary Journal (Memory Book)
export const DiaryJournalIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <rect x="4" y="3" width="16" height="18" rx="3" fill="#CAEEDF" stroke="#2D6A4F" strokeWidth="1.8" />
    <path d="M8 3V21" stroke="#2D6A4F" strokeWidth="1.5" />
    <path d="M12 7H16M12 11H16M12 15H15" stroke="#523E32" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 8L6 10" stroke="#E76F51" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 🪪 11. Cat Passport Badge (Citizen ID)
export const PassportBadgeIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <path
      d="M12 2L4 5V11C4 16.5 7.4 21.6 12 22.8C16.6 21.6 20 16.5 20 11V5L12 2Z"
      fill="#FFE5A3"
      stroke="#523E32"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="11.5" r="3.5" fill="#FFCAD4" stroke="#523E32" strokeWidth="1.4" />
    <circle cx="12" cy="11.5" r="1.5" fill="#523E32" />
  </svg>
);

// 👥 12. Friends & Community Duo
export const FriendsDuoIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    {/* Left Cat */}
    <circle cx="8" cy="10" r="4.5" fill="#BDE0FE" stroke="#523E32" strokeWidth="1.6" />
    <path d="M5 6.5L7 9M11 6.5L9 9" stroke="#523E32" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M3.5 19C3.5 15.5 5.5 14.5 8 14.5C10.5 14.5 12.5 15.5 12.5 19" fill="#BDE0FE" stroke="#523E32" strokeWidth="1.6" />

    {/* Right Cat */}
    <circle cx="16" cy="11" r="4" fill="#FFCAD4" stroke="#523E32" strokeWidth="1.6" />
    <path d="M13.5 8L15 10M18.5 8L17 10" stroke="#523E32" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12.5 19C12.5 16.5 14 15.5 16 15.5C18 15.5 19.5 16.5 19.5 19" fill="#FFCAD4" stroke="#523E32" strokeWidth="1.6" />
  </svg>
);

// 🌸 13. Sakura Blossom (Sakura Theme)
export const SakuraBlossomIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <circle cx="12" cy="7" r="4" fill="#FFCAD4" stroke="#FF8FA3" strokeWidth="1.4" />
    <circle cx="16.5" cy="10.5" r="4" fill="#FFCAD4" stroke="#FF8FA3" strokeWidth="1.4" />
    <circle cx="15" cy="16" r="4" fill="#FFCAD4" stroke="#FF8FA3" strokeWidth="1.4" />
    <circle cx="9" cy="16" r="4" fill="#FFCAD4" stroke="#FF8FA3" strokeWidth="1.4" />
    <circle cx="7.5" cy="10.5" r="4" fill="#FFCAD4" stroke="#FF8FA3" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="2.5" fill="#FFE5A3" stroke="#D97706" strokeWidth="1" />
  </svg>
);

// ☀️ 14. Sunshine Sun (Sunshine Theme)
export const SunshineSunIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <circle cx="12" cy="12" r="5.5" fill="#FFD166" stroke="#D97706" strokeWidth="1.8" />
    {/* Sun rays */}
    <path
      d="M12 2.5V4.5M12 19.5V21.5M2.5 12H4.5M19.5 12H21.5M5.3 5.3L6.7 6.7M17.3 17.3L18.7 18.7M5.3 18.7L6.7 17.3M17.3 6.7L18.7 5.3"
      stroke="#D97706"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// 🌙 15. Moonlight Crescent (Moonlight Theme)
export const MoonlightCrescentIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <path
      d="M20.5 14C19.5 18.5 15.5 21.5 11 21C6.2 20.5 2.5 16.3 3 11.5C3.4 7.5 6.7 4 10.8 3.5C9.8 6.5 10.5 10.2 13 12.5C15 14.2 17.8 14.8 20.5 14Z"
      fill="#BDE0FE"
      stroke="#4A6FA5"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M18 4L18.8 5.8L20.5 6.5L18.8 7.2L18 9L17.2 7.2L15.5 6.5L17.2 5.8L18 4Z" fill="#FFD166" />
  </svg>
);

// 🪵 16. Scratch Post Prop Icon
export const ScratchPostIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <ellipse cx="12" cy="20" rx="8" ry="2.5" fill="#9C6644" stroke="#523E32" strokeWidth="1.6" />
    <rect x="10" y="4" width="4" height="16" rx="1.5" fill="#E9D8A6" stroke="#523E32" strokeWidth="1.6" />
    <path d="M10 7H14M10 10H14M10 13H14M10 16H14" stroke="#B08968" strokeWidth="1.2" />
    <circle cx="12" cy="4" r="2" fill="#D4A373" stroke="#523E32" strokeWidth="1.4" />
  </svg>
);

// 📦 17. AMACAT Cardboard Box
export const AmacatBoxIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
  >
    <rect x="3" y="6" width="18" height="14" rx="2.5" fill="#D4A373" stroke="#523E32" strokeWidth="1.8" />
    <path d="M3 10H21" stroke="#523E32" strokeWidth="1.5" />
    <rect x="9" y="6" width="6" height="5" fill="#B08968" />
    <circle cx="8" cy="15" r="1" fill="#523E32" />
    <circle cx="16" cy="15" r="1" fill="#523E32" />
  </svg>
);
