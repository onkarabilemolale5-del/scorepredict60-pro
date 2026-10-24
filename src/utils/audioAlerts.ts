/**
 * Web Audio & Speech Synthesis alerts for trading entry triggers
 */

class SoundAlertManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private speechEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
    const savedSound = localStorage.getItem('daytrader_sound_enabled');
    if (savedSound !== null) {
      this.soundEnabled = savedSound === 'true';
    }
    const savedSpeech = localStorage.getItem('daytrader_speech_enabled');
    if (savedSpeech !== null) {
      this.speechEnabled = savedSpeech === 'true';
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('daytrader_sound_enabled', String(enabled));
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
    localStorage.setItem('daytrader_speech_enabled', String(enabled));
  }

  public isSpeechEnabled(): boolean {
    return this.speechEnabled;
  }

  /**
   * Play high-clarity synthesized chime for Buy / Sell / Wait
   */
  public playChime(type: 'BUY' | 'SELL' | 'WAIT') {
    if (!this.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (type === 'BUY') {
        // Bullish ascending futuristic harmonic chime
        const freqs = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.65);
        });
      } else if (type === 'SELL') {
        // Bearish descending assertive alert chime
        const freqs = [1046.5, 880.0, 698.46, 523.25]; // C6, A5, F5, C5
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          // lowpass filter for punch without harshness
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2000, now);

          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.55);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.6);
        });
      } else {
        // Subtle soft double-tap for WAIT
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(370, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn('AudioContext playback error:', e);
    }
  }

  /**
   * Speak clear vocal instructions: "ENTRY TRIGGERED BUY at 2650"
   */
  public speak(text: string) {
    if (!this.soundEnabled || !this.speechEnabled) return;

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try selecting an English voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Android')));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  }

  /**
   * Vibrate device if supported on Android
   */
  public vibrate(pattern: number | number[] = [200, 100, 200, 100, 300]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored if device does not support vibration
      }
    }
  }

  /**
   * Trigger full alert sequence for entry signal
   */
  public triggerEntryAlert(type: 'BUY' | 'SELL', symbol: string, price: number) {
    this.playChime(type);
    this.vibrate([200, 100, 200, 100, 400]);
    const priceFormatted = price.toLocaleString('en-US', {
      maximumFractionDigits: price < 10 ? 4 : 2,
    });
    this.speak(`ENTRY TRIGGERED. ${type} ${symbol} at ${priceFormatted}`);
  }
}

export const soundAlert = new SoundAlertManager();
