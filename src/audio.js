import { readSetting, writeSetting } from './storage.js';

function createPool(src, size, volume) {
  const clips = [];
  for (let i = 0; i < size; i += 1) {
    const clip = new Audio(src);
    clip.preload = 'auto';
    clip.volume = volume;
    clips.push(clip);
  }
  return { clips, next: 0 };
}

export class AudioManager {
  constructor() {
    this.muted = readSetting('muted', false);
    this.unlocked = false;
    this.hit = createPool('sounds/hit.wav', 5, 0.55);
    this.score = createPool('sounds/score.wav', 3, 0.5);
    this.music = new Audio('sounds/music.mp3');
    this.music.loop = true;
    this.music.volume = 0.28;
  }

  unlock() {
    this.unlocked = true;
    this.resumeMusic();
  }

  play(name) {
    if (this.muted || !this.unlocked) return;
    const pool = this[name];
    const clip = pool.clips[pool.next];
    pool.next = (pool.next + 1) % pool.clips.length;
    clip.currentTime = 0;
    clip.play().catch(() => {});
  }

  resumeMusic() {
    if (this.muted || !this.unlocked) return;
    this.music.play().catch(() => {});
  }

  pauseMusic() {
    this.music.pause();
  }

  toggleMute() {
    this.muted = !this.muted;
    writeSetting('muted', this.muted);
    if (this.muted) this.pauseMusic();
    else this.resumeMusic();
    return this.muted;
  }
}
