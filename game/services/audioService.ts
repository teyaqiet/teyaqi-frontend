// C:\Users\msi gp 76\teyaqi-app\game\services\audioService.ts

export type SoundEffect = 'correct' | 'wrong' | 'streak' | 'click' | 'prep' | 'victory' | 'complete' | 'gameover' | 'warning' | 'timesup' | 'tick' | 'tickend' | 'xploader' | 'gamescore';

interface PlayOptions {
  volume?: number;
  loop?: boolean;
}

class AudioService {
  private ctx: AudioContext | null = null;
  private buffers: Map<SoundEffect, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  
  private activeNodes: Map<SoundEffect, AudioBufferSourceNode[]> = new Map();

  private manifest: Record<SoundEffect, string> = {
    correct: "/sounds/correct.mp3",
    wrong: "/sounds/wrong.mp3",
    victory: "/sounds/victory.mp3",
    gameover: "/sounds/gameover.mp3",
    complete: "/sounds/complete.mp3",
    warning: "/sounds/timer-warning.mp3",
    timesup: "/sounds/times-up.mp3",
    tick: "/sounds/m_tick.mp3",
    tickend: "/sounds/e_tick.mp3",
    streak: "/sounds/streak.mp3", 
    click: "/sounds/click.mp3",
    xploader: "/sounds/xploader.mp3",
    gamescore: "/sounds/game_score.mp3",
    prep: "/sounds/prep_background.mp3"
  };

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    if (typeof window === "undefined") return;

    const soundPref = localStorage.getItem("sound_enabled");
    this.isMuted = soundPref === "false";

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API is not supported in this browser environment.");
      return;
    }

    this.ctx = new AudioContextClass();
    this.isInitialized = true;

    const loadPromises = Object.entries(this.manifest).map(([key, url]) => 
      this.loadAudioBuffer(key as SoundEffect, url)
    );

    await Promise.all(loadPromises);
  }

  private async loadAudioBuffer(effect: SoundEffect, url: string): Promise<AudioBuffer | null> {
    if (this.buffers.has(effect)) return this.buffers.get(effect)!;
    if (!this.ctx) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(effect, audioBuffer);
      return audioBuffer;
    } catch (err) {
      console.error(`Failed to load audio asset [${effect}] from ${url}:`, err);
      return null;
    }
  }

  public async play(effect: SoundEffect, options?: number | PlayOptions): Promise<void> {
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("sound_enabled") === "false";
    }

    if (this.isMuted) return;

    // Auto-init context if not done yet
    if (!this.isInitialized || !this.ctx) {
      await this.init();
    }

    if (!this.ctx) return;

    // Handle context suspended state
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn("AudioContext resume blocked by browser policy:", err);
      }
    }

    // Support legacy volume parameter OR options object
    let volume = 1.0;
    let loop = false;

    if (typeof options === "number") {
      volume = options;
    } else if (typeof options === "object" && options !== null) {
      volume = options.volume ?? 1.0;
      loop = options.loop ?? false;
    }

    // Lazy load buffer if missing
    let buffer = this.buffers.get(effect);
    if (!buffer) {
      const url = this.manifest[effect];
      if (url) {
        buffer = (await this.loadAudioBuffer(effect, url)) ?? undefined;
      }
    }

    if (!buffer) return; 

    // Stop existing instance if playing looped to prevent layering duplicate tracks
    if (loop) {
      this.stop(effect);
    }

    const sourceNode = this.ctx.createBufferSource();
    const gainNode = this.ctx.createGain();

    sourceNode.buffer = buffer;
    sourceNode.loop = loop;
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

    sourceNode.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    if (!this.activeNodes.has(effect)) {
      this.activeNodes.set(effect, []);
    }
    this.activeNodes.get(effect)!.push(sourceNode);

    sourceNode.onended = () => {
      const list = this.activeNodes.get(effect) || [];
      this.activeNodes.set(effect, list.filter(node => node !== sourceNode));
    };

    sourceNode.start(0);
  }

  public stop(effect: SoundEffect): void {
    const nodes = this.activeNodes.get(effect);
    if (!nodes || nodes.length === 0) return;

    nodes.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });

    this.activeNodes.set(effect, []);
  }

  public setMute(mute: boolean): void {
    this.isMuted = mute;
    if (typeof window !== "undefined") {
      localStorage.setItem("sound_enabled", (!mute).toString());
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("sound_enabled", (!this.isMuted).toString());
    }
    return this.isMuted;
  }
}

export const audioService = new AudioService();