// Web Audio API procedural sound synthesizer (Disabled/Silent by default)
class SoundManager {
  private isMuted: boolean = true;

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public playPop() {}
  public playRealisticRandomMeow() {}
  public playMeow(pitch: number = 1.0) {}
  public playPurr() {}
  public playEat() {}
  public playWater() {}
  public playBell() {}
  public playSparkle() {}
}

export const soundManager = new SoundManager();
