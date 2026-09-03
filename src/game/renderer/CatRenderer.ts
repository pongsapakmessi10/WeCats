import { CatCustomization, CatStats, CatBehavior } from '@/types/game';

export interface RenderCatOptions {
  ctx: CanvasRenderingContext2D;
  custom: CatCustomization;
  stats?: CatStats;
  behavior?: CatBehavior;
  direction?: 'up' | 'down' | 'left' | 'right';
  x: number;
  y: number;
  scale?: number;
  timeMs: number;
  isMoving?: boolean;
  showNameTag?: boolean;
  emote?: string | null;
  chatMessage?: string | null;
}

export class CatRenderer {
  public static render(options: RenderCatOptions) {
    const {
      ctx,
      custom,
      stats,
      behavior = 'idle',
      direction = 'down',
      x,
      y,
      scale = 1.0,
      timeMs,
      isMoving = false,
      showNameTag = true,
      emote = null,
      chatMessage = null,
    } = options;

    ctx.save();
    ctx.translate(x, y);

    // Flip horizontal if facing left
    const isFacingLeft = direction === 'left';
    const flipX = isFacingLeft ? -1 : 1;
    ctx.scale(flipX * scale, scale);

    // Behavior Flags
    const isDrinking = behavior === 'drinking';
    const isEating = behavior === 'eating';
    const isGrooming = behavior === 'grooming';
    const isSleeping = behavior === 'sleeping';
    const isScratching = behavior === 'scratching';
    const isAllogrooming = behavior === 'allogrooming';
    const isZooming = behavior === 'zoomies' || stats?.isZooming || false;

    // Animation Timers & Rates
    const t = timeMs / 1000;
    const walkSpeed = isZooming ? 20 : isMoving ? 10 : isDrinking ? 14 : isEating ? 10 : isScratching ? 16 : isGrooming ? 6 : 0;
    const walkCycle = Math.sin(t * walkSpeed);
    const breatheCycle = isSleeping ? Math.sin(t * 1.8) * 2.5 : Math.sin(t * 3) * 1.5;
    let tailSwing = Math.sin(t * (isZooming ? 14 : isEating ? 12 : isDrinking ? 4 : 4)) * (isEating ? 0.45 : isDrinking ? 0.2 : 0.35);
    if (isSleeping) tailSwing = -0.3; // Curled tight
    if (isScratching) tailSwing = -0.7 + Math.sin(t * 6) * 0.15; // Raised high
    const blinkCycle = isSleeping ? false : Math.sin(t * 1.5) > 0.96;

    // Body dimensions based on body type & behavior
    let bodyWidth = 36;
    let bodyHeight = 28;
    let legHeight = 12;
    if (custom.bodyType === 'chonky') {
      bodyWidth = 46;
      bodyHeight = 32;
    } else if (custom.bodyType === 'munchkin') {
      bodyWidth = 38;
      bodyHeight = 24;
      legHeight = 6;
    } else if (custom.bodyType === 'slim') {
      bodyWidth = 30;
      bodyHeight = 24;
    }

    if (isSleeping) {
      bodyWidth += 8; // Cat Loaf expansion
      bodyHeight -= 2;
    } else if (isScratching) {
      bodyHeight += 6; // Stretch tall
    }

    // 0. Soft Ground Shadow
    ctx.beginPath();
    ctx.ellipse(0, isSleeping ? 16 : 18, (bodyWidth / 2) + (isSleeping ? 8 : 6), isSleeping ? 10 : 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = isSleeping ? 'rgba(82, 62, 50, 0.26)' : 'rgba(82, 62, 50, 0.22)';
    ctx.fill();

    // 1. AURA EFFECT (Behind Cat)
    if (custom.aura !== 'none') {
      this.renderAura(ctx, custom.aura, t, bodyWidth);
    }

    // 2. TAIL (Behind Body)
    this.renderTail(ctx, custom, tailSwing, bodyWidth, bodyHeight, behavior);

    // 3. BACK ACCESSORY (e.g. Angel Wings, Backpack)
    if (custom.accessoryBack !== 'none') {
      this.renderBackAccessory(ctx, custom.accessoryBack, t, bodyWidth, bodyHeight);
    }

    // 4. BACK LEGS
    this.renderLegs(ctx, custom, walkCycle, bodyWidth, legHeight, true, behavior, t);

    // 5. CAT BODY (Spine & Torso)
    const purrTremor = isAllogrooming ? Math.sin(t * 35) * 0.5 : 0;
    const torsoY = isDrinking ? 4 : isEating ? 3 : isSleeping ? 3 : isScratching ? -5 : -breatheCycle * 0.5;
    ctx.save();
    ctx.translate(purrTremor, torsoY);

    // Torso Base
    ctx.beginPath();
    ctx.ellipse(0, 4, bodyWidth / 2, bodyHeight / 2 + (breatheCycle * 0.3), 0, 0, Math.PI * 2);
    ctx.fillStyle = custom.baseColor;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#4a3b32';
    ctx.stroke();

    // Coat Pattern on Torso
    this.renderTorsoPattern(ctx, custom, bodyWidth, bodyHeight);

    // Belly White/Cream Patch
    if (custom.bellyColor) {
      ctx.beginPath();
      ctx.ellipse(0, 6, bodyWidth / 3, bodyHeight / 3.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = custom.bellyColor;
      ctx.fill();
    }
    ctx.restore();

    // 6. FRONT LEGS
    this.renderLegs(ctx, custom, walkCycle, bodyWidth, legHeight, false, behavior, t);

    // 7. CAT HEAD & EARS & FACE
    ctx.save();
    let headBob = isMoving ? Math.abs(Math.sin(t * walkSpeed)) * 3 : breatheCycle * 0.7;
    let headYOffset = -18 - headBob;
    let headTilt = (direction === 'up' ? -0.1 : direction === 'down' ? 0.05 : 0) + (isMoving ? walkCycle * 0.05 : 0);

    if (isDrinking) {
      headYOffset = -8 + Math.sin(t * 14) * 2; // Head down lapping water
      headTilt = 0.28;
    } else if (isEating) {
      headYOffset = -9 + Math.sin(t * 9) * 2.2; // Head in bowl chewing
      headTilt = 0.22;
    } else if (isGrooming) {
      headYOffset = -14;
      headTilt = -0.25; // Tilt toward raised paw
    } else if (isSleeping) {
      headYOffset = -11 + (breatheCycle * 0.3); // Resting on floor
      headTilt = 0.06;
    } else if (isScratching) {
      headYOffset = -25; // Reaching up scratching post
      headTilt = -0.12;
    } else if (isAllogrooming) {
      headYOffset = -22; // Head tilted back enjoying pets
      headTilt = -0.22;
    }

    ctx.translate(purrTremor, headYOffset);
    ctx.rotate(headTilt);

    // EARS
    this.renderEars(ctx, custom, t, behavior);

    // HEAD BASE
    const headRadius = 22;
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = custom.baseColor;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#4a3b32';
    ctx.stroke();

    // Head Coat Patterns (Tabby stripes / Calico spots / Siamese mask)
    this.renderHeadPattern(ctx, custom, headRadius);

    // FACE DETAILS (Eyes, Snout, Whiskers, Blush)
    this.renderFace(ctx, custom, blinkCycle, t, direction, behavior);

    // NECK ACCESSORY (Gold Bell, Bowtie, Ribbon)
    if (custom.accessoryNeck !== 'none') {
      this.renderNeckAccessory(ctx, custom.accessoryNeck, t);
    }

    // HEAD ACCESSORY (Straw Hat, Wizard Hat, Flower Crown, Beret)
    if (custom.accessoryHead !== 'none') {
      this.renderHeadAccessory(ctx, custom.accessoryHead, t);
    }

    // FACE ACCESSORY (Glasses, Monocle, Blush)
    if (custom.accessoryFace !== 'none') {
      this.renderFaceAccessory(ctx, custom.accessoryFace);
    }

    ctx.restore(); // Head restore

    // 7.5 Signature Behavioral Particles (Water, crumbs, Zzz, hearts)
    this.renderBehavioralParticles(ctx, behavior, t);

    ctx.restore(); // Root cat transform restore

    // 8. HUD LABELS: Name Tag, Emotes, Chat Speech Bubble (Unflipped & Unscaled)
    if (showNameTag || emote || chatMessage) {
      this.renderHUDOverlays(ctx, x, y - (48 * scale), custom, stats, emote, chatMessage);
    }
  }

  // --- SUB RENDERERS ---

  private static renderTail(
    ctx: CanvasRenderingContext2D,
    custom: CatCustomization,
    swing: number,
    bw: number,
    bh: number,
    behavior: CatBehavior = 'idle'
  ) {
    ctx.save();
    const tailStartX = -bw / 2.2;
    const tailStartY = 4;
    ctx.translate(tailStartX, tailStartY);

    let baseAngle = -0.6;
    if (behavior === 'sleeping') baseAngle = -1.1; // Curled around body
    if (behavior === 'scratching') baseAngle = -1.35; // Question mark tail pointing up

    ctx.rotate(baseAngle + swing);

    ctx.lineWidth = custom.tailType === 'fluffy' ? 10 : 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = custom.baseColor;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (custom.tailType === 'bobtail') {
      ctx.lineTo(-8, -12);
    } else if (custom.tailType === 'kinked') {
      ctx.lineTo(-12, -14);
      ctx.lineTo(-8, -26);
    } else if (behavior === 'scratching') {
      // Question mark curve
      ctx.quadraticCurveTo(-14, -20, -4, -34);
      ctx.quadraticCurveTo(4, -36, 6, -30);
    } else {
      ctx.quadraticCurveTo(-18, -14, -8, -32);
    }
    ctx.stroke();

    // Tail outline stroke
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#4a3b32';
    ctx.stroke();

    // Tail tip color if siamese or calico
    if (custom.patternType === 'siamese') {
      ctx.beginPath();
      ctx.arc(-8, -30, 4, 0, Math.PI * 2);
      ctx.fillStyle = custom.patternColor;
      ctx.fill();
    }

    ctx.restore();
  }

  private static renderLegs(
    ctx: CanvasRenderingContext2D,
    custom: CatCustomization,
    walkCycle: number,
    bw: number,
    legH: number,
    isBackLayer: boolean,
    behavior: CatBehavior = 'idle',
    t: number = 0
  ) {
    const legWidth = 7;
    const offset = isBackLayer ? -10 : 8;
    const animOffset = isBackLayer ? -walkCycle * 5 : walkCycle * 5;

    // 1. SPECIAL CASE: SLEEPING (Cat Loaf Paws 🍞)
    if (behavior === 'sleeping') {
      if (isBackLayer) return; // Hidden under body
      ctx.save();
      ctx.fillStyle = custom.pawColor || custom.baseColor;
      ctx.strokeStyle = '#4a3b32';
      ctx.lineWidth = 2;
      // Two cute tucked paws resting under chest
      ctx.beginPath();
      ctx.ellipse(-bw / 3.8, 12, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(bw / 3.8, 12, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    // 2. SPECIAL CASE: GROOMING (One paw raised near face)
    if (behavior === 'grooming') {
      ctx.save();
      ctx.fillStyle = custom.pawColor || custom.baseColor;
      ctx.strokeStyle = '#4a3b32';
      ctx.lineWidth = 2;
      if (isBackLayer) {
        // Folded hind legs sitting
        ctx.beginPath();
        ctx.roundRect(-bw / 3 - 8, 8, legWidth, legH * 0.8, 4);
        ctx.roundRect(bw / 4 - 8, 8, legWidth, legH * 0.8, 4);
        ctx.fill();
        ctx.stroke();
      } else {
        // Right paw on ground
        ctx.beginPath();
        ctx.roundRect(bw / 4 + 4, 8, legWidth, legH * 0.9, 4);
        ctx.fill();
        ctx.stroke();
        // Left paw raised up near cheek licking
        const lickBob = Math.sin(t * 8) * 2.5;
        ctx.beginPath();
        ctx.roundRect(-bw / 3 + 2, -6 + lickBob, legWidth, legH * 1.25, 4);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // 3. SPECIAL CASE: SCRATCHING (Standing tall on hind legs & clawing)
    if (behavior === 'scratching') {
      ctx.save();
      ctx.fillStyle = custom.pawColor || custom.baseColor;
      ctx.strokeStyle = '#4a3b32';
      ctx.lineWidth = 2;
      if (isBackLayer) {
        // Hind legs standing tall
        ctx.beginPath();
        ctx.roundRect(-bw / 3, 6, legWidth, legH * 1.3, 4);
        ctx.roundRect(bw / 4, 6, legWidth, legH * 1.3, 4);
        ctx.fill();
        ctx.stroke();
      } else {
        // Front paws alternate clawing up and down
        const claw1 = Math.sin(t * 16) * 5;
        const claw2 = -claw1;
        ctx.beginPath();
        ctx.roundRect(-bw / 3 + 4, -14 + claw1, legWidth, legH * 1.3, 4);
        ctx.roundRect(bw / 4 + 4, -14 + claw2, legWidth, legH * 1.3, 4);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // 4. DRINKING & EATING (Front legs crouched lower)
    let effLegH = legH;
    if ((behavior === 'drinking' || behavior === 'eating') && !isBackLayer) {
      effLegH = legH * 0.65;
    }

    ctx.save();
    ctx.fillStyle = custom.pawColor || custom.baseColor;
    ctx.strokeStyle = '#4a3b32';
    ctx.lineWidth = 2;

    // Left leg
    ctx.beginPath();
    ctx.roundRect(-bw / 3 + offset, 8 + animOffset, legWidth, effLegH, 4);
    ctx.fill();
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.roundRect(bw / 4 + (offset * 0.5), 8 - animOffset, legWidth, effLegH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private static renderEars(ctx: CanvasRenderingContext2D, custom: CatCustomization, t: number, behavior: CatBehavior = 'idle') {
    const isAirplane = behavior === 'zoomies';
    const isDrinking = behavior === 'drinking';
    const earTwitch = Math.sin(t * 5) > 0.9 ? 0.15 : 0;

    const leftAngle = isAirplane ? -0.65 : isDrinking ? -0.4 : -0.25 + earTwitch;
    const rightAngle = isAirplane ? 0.65 : isDrinking ? 0.4 : 0.25 - earTwitch;

    // Left Ear
    ctx.save();
    ctx.translate(-14, -14);
    ctx.rotate(leftAngle);
    ctx.beginPath();
    if (custom.earType === 'folded') {
      ctx.moveTo(-6, 8);
      ctx.quadraticCurveTo(0, -6, 8, 4);
    } else if (custom.earType === 'curled') {
      ctx.moveTo(-6, 8);
      ctx.quadraticCurveTo(-2, -18, 6, -8);
    } else {
      ctx.moveTo(-8, 8);
      ctx.lineTo(0, -18);
      ctx.lineTo(10, 6);
    }
    ctx.closePath();
    ctx.fillStyle = custom.baseColor;
    ctx.fill();
    ctx.strokeStyle = '#4a3b32';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner pink ear
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(0, -12);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fillStyle = '#ffaec0';
    ctx.fill();
    ctx.restore();

    // Right Ear
    ctx.save();
    ctx.translate(14, -14);
    ctx.rotate(rightAngle);
    ctx.beginPath();
    if (custom.earType === 'folded') {
      ctx.moveTo(-8, 4);
      ctx.quadraticCurveTo(0, -6, 6, 8);
    } else if (custom.earType === 'curled') {
      ctx.moveTo(-6, -8);
      ctx.quadraticCurveTo(2, -18, 6, 8);
    } else {
      ctx.moveTo(-10, 6);
      ctx.lineTo(0, -18);
      ctx.lineTo(8, 8);
    }
    ctx.closePath();
    ctx.fillStyle = custom.baseColor;
    ctx.fill();
    ctx.strokeStyle = '#4a3b32';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner pink ear
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(0, -12);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fillStyle = '#ffaec0';
    ctx.fill();
    ctx.restore();
  }

  private static renderFace(
    ctx: CanvasRenderingContext2D,
    custom: CatCustomization,
    isBlinking: boolean,
    t: number,
    dir: 'up' | 'down' | 'left' | 'right',
    behavior: CatBehavior = 'idle'
  ) {
    if (dir === 'up') return; // Head is seen from back when looking up

    const isSleeping = behavior === 'sleeping';
    const isGrooming = behavior === 'grooming';
    const isBliss = behavior === 'allogrooming' || behavior === 'grooming';
    const isDrinking = behavior === 'drinking';
    const isEating = behavior === 'eating';
    const isZooming = behavior === 'zoomies';

    // Snout Muzzle
    ctx.beginPath();
    ctx.ellipse(0, 4, 9, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = custom.snoutColor || '#ffffff';
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.moveTo(-3, 1);
    ctx.lineTo(3, 1);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fillStyle = '#ff8fab';
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(-3, 6, 3, 0.2, Math.PI * 0.9);
    ctx.arc(3, 6, 3, 0.1, Math.PI * 0.8);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#4a3b32';
    ctx.stroke();

    // Cute Lapping Pink Tongue when Drinking or Grooming
    if (isDrinking) {
      const lap = Math.sin(t * 14);
      if (lap > 0) {
        ctx.beginPath();
        ctx.ellipse(0, 8.5 + (lap * 3), 3, 3.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ff758f';
        ctx.fill();
        ctx.strokeStyle = '#4a3b32';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (isGrooming) {
      const lick = Math.sin(t * 8);
      if (lick > 0) {
        ctx.beginPath();
        ctx.ellipse(-3, 7.5, 2.5, 3.5, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ff758f';
        ctx.fill();
      }
    }

    // Whiskers
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#6c584c';
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(-10, 3);
    ctx.lineTo(-24, 0);
    ctx.moveTo(-10, 6);
    ctx.lineTo(-24, 8);
    ctx.stroke();
    // Right whiskers
    ctx.beginPath();
    ctx.moveTo(10, 3);
    ctx.lineTo(24, 0);
    ctx.moveTo(10, 6);
    ctx.lineTo(24, 8);
    ctx.stroke();

    // Eyes
    const eyeSpacing = 10;
    const eyeY = -3;

    if (isSleeping) {
      // Sleeping straight serene eyes (- -)
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 4, eyeY);
      ctx.lineTo(-eyeSpacing + 4, eyeY);
      ctx.moveTo(eyeSpacing - 4, eyeY);
      ctx.lineTo(eyeSpacing + 4, eyeY);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#4a3b32';
      ctx.lineCap = 'round';
      ctx.stroke();
    } else if (isBliss) {
      // Blissful curved happy eyes (⌒ ⌒) + Pink Blush
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY + 1, 4.5, 0.85 * Math.PI, 0.15 * Math.PI, true);
      ctx.arc(eyeSpacing, eyeY + 1, 4.5, 0.85 * Math.PI, 0.15 * Math.PI, true);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();

      // Pink blush cheeks
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing - 3, eyeY + 7, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeSpacing + 3, eyeY + 7, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 117, 143, 0.55)';
      ctx.fill();
    } else if (isBlinking) {
      // Closed happy blink eyes (⌒ ⌒)
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 5, 0.9 * Math.PI, 0.1 * Math.PI, true);
      ctx.arc(eyeSpacing, eyeY, 5, 0.9 * Math.PI, 0.1 * Math.PI, true);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();
    } else {
      const pupilRadius = isZooming ? 4.5 : 3;

      // Left Eye (Heterochromia Left)
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing, eyeY, 5, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = custom.eyeColorLeft;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();
      // Pupil & Sparkle
      ctx.beginPath();
      ctx.arc(-eyeSpacing + 0.5, eyeY, pupilRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1412';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-eyeSpacing - 1.5, eyeY - 2, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Right Eye (Heterochromia Right)
      ctx.beginPath();
      ctx.ellipse(eyeSpacing, eyeY, 5, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = custom.eyeColorRight;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();
      // Pupil & Sparkle
      ctx.beginPath();
      ctx.arc(eyeSpacing - 0.5, eyeY, pupilRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1412';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeSpacing - 1.5, eyeY - 2, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  private static renderTorsoPattern(ctx: CanvasRenderingContext2D, custom: CatCustomization, bw: number, bh: number) {
    if (custom.patternType === 'solid') return;

    ctx.fillStyle = custom.patternColor;
    ctx.strokeStyle = custom.patternColor;

    if (custom.patternType === 'tabby' || custom.patternType === 'tiger') {
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-bw / 2.5, i * 8);
        ctx.lineTo(-bw / 5, i * 8 + 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bw / 2.5, i * 8);
        ctx.lineTo(bw / 5, i * 8 + 3);
        ctx.stroke();
      }
    } else if (custom.patternType === 'tuxedo') {
      // Dark coat with chest white
      ctx.beginPath();
      ctx.ellipse(0, 0, bw / 2.1, bh / 2.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = custom.patternColor;
      ctx.fill();
    } else if (custom.patternType === 'calico' || custom.patternType === 'cow') {
      ctx.beginPath();
      ctx.ellipse(-bw / 3, -4, 8, 10, 0.4, 0, Math.PI * 2);
      ctx.ellipse(bw / 3.5, 6, 10, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static renderHeadPattern(ctx: CanvasRenderingContext2D, custom: CatCustomization, hr: number) {
    if (custom.patternType === 'solid') return;

    ctx.fillStyle = custom.patternColor;
    ctx.strokeStyle = custom.patternColor;

    if (custom.patternType === 'tabby' || custom.patternType === 'tiger') {
      // Tabby M mark on forehead
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-6, -16);
      ctx.lineTo(-3, -9);
      ctx.lineTo(0, -14);
      ctx.lineTo(3, -9);
      ctx.lineTo(6, -16);
      ctx.stroke();
    } else if (custom.patternType === 'siamese') {
      // Siamese dark face mask
      ctx.beginPath();
      ctx.ellipse(0, 1, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (custom.patternType === 'calico') {
      ctx.beginPath();
      ctx.arc(8, -10, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static renderHeadAccessory(ctx: CanvasRenderingContext2D, item: string, t: number) {
    ctx.save();
    if (item === 'straw_hat') {
      ctx.beginPath();
      ctx.ellipse(0, -18, 22, 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#7f5539';
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, -22, 12, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe082';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ff6b81';
      ctx.fillRect(-12, -21, 24, 4);
    } else if (item === 'frog_hat') {
      ctx.font = '22px sans-serif';
      ctx.fillText('🐸', -11, -16);
    } else if (item === 'princess_tiara') {
      ctx.font = '20px sans-serif';
      ctx.fillText('👑', -10, -16);
    } else if (item === 'detective_hat') {
      ctx.font = '22px sans-serif';
      ctx.fillText('🕵️', -11, -16);
    } else if (item === 'party_hat') {
      ctx.font = '20px sans-serif';
      ctx.fillText('🥳', -10, -16);
    } else if (item === 'wizard_hat') {
      ctx.beginPath();
      ctx.moveTo(-16, -16);
      ctx.lineTo(16, -16);
      ctx.lineTo(0, -42);
      ctx.closePath();
      ctx.fillStyle = '#6a4c93';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();
      ctx.fillStyle = '#ffd166';
      ctx.font = '14px sans-serif';
      ctx.fillText('⭐', -7, -42);
    } else if (item === 'flower_crown') {
      const flowers = ['🌸', '🌼', '🌺', '🌸'];
      flowers.forEach((fl, idx) => {
        ctx.font = '12px sans-serif';
        ctx.fillText(fl, -18 + idx * 10, -18);
      });
    } else if (item === 'pink_bow') {
      ctx.font = '16px sans-serif';
      ctx.fillText('🎀', -8, -16);
    } else if (item === 'chef_hat') {
      ctx.beginPath();
      ctx.arc(0, -28, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();
    }
    ctx.restore();
  }

  private static renderNeckAccessory(ctx: CanvasRenderingContext2D, item: string, t: number) {
    ctx.save();
    ctx.translate(0, 14);

    if (item === 'gold_bell') {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ef476f';
      ctx.beginPath();
      ctx.arc(0, -2, 14, 0.2, Math.PI * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 5, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#7f5539';
      ctx.stroke();
    } else if (item === 'rainbow_collar') {
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ff6b81';
      ctx.beginPath();
      ctx.arc(0, -2, 14, 0.2, Math.PI * 0.8);
      ctx.stroke();
      ctx.font = '12px sans-serif';
      ctx.fillText('🌈', -6, 8);
    } else if (item === 'pearl_necklace') {
      ctx.font = '14px sans-serif';
      ctx.fillText('🦪', -7, 8);
    } else if (item === 'bowtie') {
      ctx.font = '14px sans-serif';
      ctx.fillText('🎀', -7, 8);
    } else if (item === 'fish_pendant') {
      ctx.font = '14px sans-serif';
      ctx.fillText('🐟', -7, 8);
    } else if (item === 'pink_scarf') {
      ctx.beginPath();
      ctx.ellipse(0, 2, 14, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffcad4';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();
    }
    ctx.restore();
  }

  private static renderBackAccessory(ctx: CanvasRenderingContext2D, item: string, t: number, bw: number, bh: number) {
    ctx.save();
    if (item === 'angel_wings') {
      const wingFlap = Math.sin(t * 8) * 0.2;
      ctx.font = '22px sans-serif';
      ctx.save();
      ctx.translate(-bw / 2 - 4, -4);
      ctx.rotate(-wingFlap);
      ctx.fillText('🪽', 0, 0);
      ctx.restore();
    } else if (item === 'dragon_wings') {
      ctx.font = '22px sans-serif';
      ctx.fillText('🐉', -bw / 2 - 4, 0);
    } else if (item === 'butterfly_wings') {
      ctx.font = '22px sans-serif';
      ctx.fillText('🦋', -bw / 2 - 4, 0);
    } else if (item === 'cape') {
      ctx.font = '22px sans-serif';
      ctx.fillText('🦸', -bw / 2 - 4, 0);
    } else if (item === 'backpack') {
      ctx.beginPath();
      ctx.roundRect(-bw / 2.8, -8, 14, 18, 5);
      ctx.fillStyle = '#ffd166';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-bw / 2.8 + 2, -1, 10, 9, 3);
      ctx.fillStyle = '#f4a261';
      ctx.fill();
      ctx.stroke();
    } else if (item === 'toast_slice') {
      ctx.font = '24px sans-serif';
      ctx.fillText('🍞', -bw / 2.5, 4);
    }
    ctx.restore();
  }

  private static renderFaceAccessory(ctx: CanvasRenderingContext2D, item: string) {
    ctx.save();
    if (item === 'sunglasses') {
      ctx.fillStyle = '#1f2421';
      ctx.fillRect(-16, -6, 12, 7);
      ctx.fillRect(4, -6, 12, 7);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffd166';
      ctx.strokeRect(-16, -6, 12, 7);
      ctx.strokeRect(4, -6, 12, 7);
      ctx.beginPath();
      ctx.moveTo(-4, -3);
      ctx.lineTo(4, -3);
      ctx.stroke();
    } else if (item === 'heart_glasses') {
      ctx.font = '14px sans-serif';
      ctx.fillText('💖', -14, 0);
      ctx.fillText('💖', 2, 0);
    } else if (item === 'mustache') {
      ctx.font = '14px sans-serif';
      ctx.fillText('🥸', -7, 6);
    } else if (item === 'monocle') {
      ctx.beginPath();
      ctx.arc(8, -2, 6, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffd166';
      ctx.stroke();
    } else if (item === 'cute_blush') {
      ctx.beginPath();
      ctx.ellipse(-14, 4, 4.5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(14, 4, 4.5, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 138, 161, 0.55)';
      ctx.fill();
    }
    ctx.restore();
  }

  private static renderAura(ctx: CanvasRenderingContext2D, aura: string, t: number, bw: number) {
    ctx.save();
    const count = 4;
    const icons: Record<string, string> = {
      sparkles: '✨',
      hearts: '💖',
      music_notes: '🎵',
      paw_prints: '🐾',
      stars: '⭐',
      rainbow: '🌈',
      cherry_blossoms: '🌸',
    };
    const icon = icons[aura] || '✨';

    for (let i = 0; i < count; i++) {
      const angle = (t * 2) + (i * ((Math.PI * 2) / count));
      const radius = (bw / 1.5) + Math.sin(t * 3 + i) * 6;
      const ax = Math.cos(angle) * radius;
      const ay = Math.sin(angle) * (radius * 0.6) - 10;

      ctx.font = '14px sans-serif';
      ctx.fillText(icon, ax - 7, ay);
    }
    ctx.restore();
  }

  private static renderHUDOverlays(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    custom: CatCustomization,
    stats: CatStats | undefined,
    emote: string | null,
    chatMessage: string | null
  ) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Emote / Speech Bubble
    if (emote || chatMessage) {
      const text = chatMessage || emote || '';
      ctx.font = 'bold 13px Fredoka, sans-serif';
      const textWidth = ctx.measureText(text).width;
      const bubbleW = Math.max(48, textWidth + 24);
      const bubbleH = 30;
      const bubbleY = -40;

      // Bubble Background (Pastel Cloud shape)
      ctx.beginPath();
      ctx.roundRect(-bubbleW / 2, bubbleY, bubbleW, bubbleH, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#4a3b32';
      ctx.stroke();

      // Little tail triangle pointing to cat
      ctx.beginPath();
      ctx.moveTo(-4, bubbleY + bubbleH);
      ctx.lineTo(4, bubbleY + bubbleH);
      ctx.lineTo(0, bubbleY + bubbleH + 6);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Text inside bubble
      ctx.fillStyle = '#4a3b32';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, bubbleY + bubbleH / 2);
    }

    // 2. Name Tag & Personality Badge
    const nameStr = custom.name;
    ctx.font = 'bold 12px Fredoka, sans-serif';
    const nameW = ctx.measureText(nameStr).width + 24;

    ctx.beginPath();
    ctx.roundRect(-nameW / 2, -6, nameW, 20, 10);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ebd9c8';
    ctx.stroke();

    ctx.fillStyle = '#523e32';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nameStr, 0, 4);

    ctx.restore();
  }

  // --- SIGNATURE BEHAVIORAL PARTICLES ---

  private static renderBehavioralParticles(
    ctx: CanvasRenderingContext2D,
    behavior: CatBehavior,
    t: number
  ) {
    if (behavior === 'drinking') {
      // 3 animated blue water droplets bouncing under mouth
      for (let i = 0; i < 3; i++) {
        const dropT = (t * 3.5 + i * 0.33) % 1;
        const dropX = -6 + (i * 6) + Math.sin(t * 8 + i) * 2;
        const dropY = 12 + dropT * 10;
        const dropAlpha = 1 - dropT;
        ctx.beginPath();
        ctx.arc(dropX, dropY, 2.5 * (1 - dropT * 0.35), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 189, 255, ${dropAlpha * 0.85})`;
        ctx.fill();
      }
    } else if (behavior === 'eating') {
      // 3 crunchy sparkle bits bouncing near mouth
      for (let i = 0; i < 3; i++) {
        const crumbT = (t * 3 + i * 0.33) % 1;
        const crumbX = -8 + (i * 8) + Math.cos(t * 7 + i) * 3;
        const crumbY = 10 - crumbT * 12;
        const crumbAlpha = 1 - crumbT;
        ctx.beginPath();
        ctx.arc(crumbX, crumbY, 2, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? `rgba(255, 183, 3, ${crumbAlpha})` : `rgba(251, 133, 0, ${crumbAlpha})`;
        ctx.fill();
      }
    } else if (behavior === 'grooming') {
      // Clean sparkle stars drifting up
      for (let i = 0; i < 2; i++) {
        const spT = (t * 1.5 + i * 0.5) % 1;
        const spX = -12 + (i * 24) + Math.sin(t * 3 + i) * 5;
        const spY = -15 - spT * 22;
        const spAlpha = Math.sin(spT * Math.PI);
        this.renderMiniSparkle(ctx, spX, spY, 4.5, `rgba(255, 214, 10, ${spAlpha * 0.95})`);
      }
    } else if (behavior === 'sleeping') {
      // Floating Zzz letters drifting diagonally in gentle sine wave
      const zCycles = [0, 0.33, 0.66];
      ctx.save();
      ctx.font = 'bold 12px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      zCycles.forEach((offset, idx) => {
        const zT = (t * 0.6 + offset) % 1;
        const zX = 14 + (zT * 20) + Math.sin(zT * Math.PI * 2) * 5;
        const zY = -12 - (zT * 32);
        const zAlpha = Math.sin(zT * Math.PI);
        const zScale = 0.7 + idx * 0.25;
        ctx.save();
        ctx.translate(zX, zY);
        ctx.scale(zScale, zScale);
        ctx.fillStyle = `rgba(168, 140, 126, ${zAlpha * 0.9})`;
        ctx.fillText('Z', 0, 0);
        ctx.restore();
      });
      ctx.restore();
    } else if (behavior === 'scratching') {
      // Scratch sparks / wood dust
      for (let i = 0; i < 3; i++) {
        const scT = (t * 4.5 + i * 0.3) % 1;
        const scX = 8 + Math.cos(t * 14 + i) * 6;
        const scY = -18 + scT * 14;
        const scAlpha = 1 - scT;
        ctx.beginPath();
        ctx.arc(scX, scY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 163, 115, ${scAlpha})`;
        ctx.fill();
      }
    } else if (behavior === 'allogrooming') {
      // Floating pink hearts
      for (let i = 0; i < 2; i++) {
        const hT = (t * 1.2 + i * 0.5) % 1;
        const hX = -6 + (i * 12) + Math.sin(t * 2 + i) * 4;
        const hY = -28 - (hT * 22);
        const hAlpha = Math.sin(hT * Math.PI);
        const hSize = 5 + (1 - hT) * 2;
        this.renderMiniHeart(ctx, hX, hY, hSize, `rgba(255, 117, 143, ${hAlpha * 0.9})`);
      }
    } else if (behavior === 'zoomies') {
      // Dust clouds puffing behind paws
      for (let i = 0; i < 2; i++) {
        const dustT = (t * 5 + i * 0.5) % 1;
        const dustX = -18 - dustT * 15;
        const dustY = 16 + Math.sin(t * 10 + i) * 3;
        const dustAlpha = 1 - dustT;
        ctx.beginPath();
        ctx.arc(dustX, dustY, 3 + dustT * 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 217, 200, ${dustAlpha * 0.6})`;
        ctx.fill();
      }
    }
  }

  private static renderMiniHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 1.5, 0, size);
    ctx.bezierCurveTo(0, (size + topCurveHeight) / 1.5, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  private static renderMiniSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.3, -r * 0.3);
    ctx.lineTo(r, 0);
    ctx.lineTo(r * 0.3, r * 0.3);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.3, r * 0.3);
    ctx.lineTo(-r, 0);
    ctx.lineTo(-r * 0.3, -r * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
