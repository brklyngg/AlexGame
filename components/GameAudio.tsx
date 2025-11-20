import React, { useEffect, useRef } from 'react';
import { GameState } from '../types';

interface GameAudioProps {
  gameState: GameState;
}

type StopFunction = () => void;

const GameAudio: React.FC<GameAudioProps> = ({ gameState }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopCurrentTrackRef = useRef<StopFunction | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15; // Keep global volume reasonable
    masterGain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    masterGainRef.current = masterGain;

    // Resume context on first user interaction (browser policy)
    const resumeAudio = () => {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    window.addEventListener('click', resumeAudio);
    window.addEventListener('keydown', resumeAudio);

    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
      ctx.close();
    };
  }, []);

  // Handle Track Switching
  useEffect(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;

    // Stop previous track
    if (stopCurrentTrackRef.current) {
      stopCurrentTrackRef.current();
      stopCurrentTrackRef.current = null;
    }

    const ctx = audioCtxRef.current;
    const dest = masterGainRef.current;

    // Start new track based on state
    let stopTrack: StopFunction | null = null;

    switch (gameState) {
      case GameState.MENU:
        stopTrack = playMenuTheme(ctx, dest);
        break;
      case GameState.LEVEL_1:
        stopTrack = playChildhoodTheme(ctx, dest);
        break;
      case GameState.LEVEL_2:
        stopTrack = playTeensTheme(ctx, dest);
        break;
      case GameState.LEVEL_3:
        stopTrack = playTwentiesTheme(ctx, dest);
        break;
      case GameState.LEVEL_4:
        stopTrack = playThirtiesTheme(ctx, dest);
        break;
      case GameState.LEVEL_5:
        stopTrack = playFutureTheme(ctx, dest);
        break;
      case GameState.VICTORY:
        stopTrack = playVictoryTheme(ctx, dest);
        break;
      default:
        break;
    }

    stopCurrentTrackRef.current = stopTrack;

    return () => {
      if (stopCurrentTrackRef.current) {
        stopCurrentTrackRef.current();
      }
    };
  }, [gameState]);

  return null; // Invisible component
};

// --- SYNTHESIS HELPERS ---

// Simple Envelope Generator
const playTone = (
  ctx: AudioContext, 
  dest: AudioNode, 
  freq: number, 
  type: OscillatorType, 
  duration: number, 
  startTime: number,
  vol: number = 1
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(dest);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
};

// --- THEMES ---

// 1. MENU: Retro Arpeggio
const playMenuTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
  let isPlaying = true;
  const tempo = 0.25; // seconds per note
  
  // Arpeggio notes (C Major 7)
  const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 392.00, 329.63]; 
  let noteIdx = 0;

  const loop = () => {
    if (!isPlaying) return;
    const now = ctx.currentTime;
    playTone(ctx, dest, notes[noteIdx], 'square', 0.15, now, 0.2);
    noteIdx = (noteIdx + 1) % notes.length;
    setTimeout(loop, tempo * 1000);
  };

  loop();
  return () => { isPlaying = false; };
};

// 2. CHILDHOOD: Fast 8-bit (Square Waves)
const playChildhoodTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
  let isPlaying = true;
  const speed = 150; // ms

  const melody = [
    523.25, 523.25, 659.25, 523.25, 783.99, 0, 659.25, 0, // C C E C G E
    587.33, 587.33, 698.46, 587.33, 880.00, 0, 783.99, 0  // D D F D A G
  ];
  let idx = 0;

  const loop = () => {
    if (!isPlaying) return;
    const freq = melody[idx];
    if (freq > 0) {
        playTone(ctx, dest, freq, 'square', 0.1, ctx.currentTime, 0.2);
    }
    idx = (idx + 1) % melody.length;
    setTimeout(loop, speed);
  };

  loop();
  return () => { isPlaying = false; };
};

// 3. TEENS: Dance/Rhythm (Kick + Bass)
const playTeensTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
  let isPlaying = true;
  const beatDur = 500; // 120 BPM

  const playKick = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.5);
  };

  const playHiHat = (time: number) => {
     // Simple noise burst
     const bufferSize = ctx.sampleRate * 0.05;
     const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
     const data = buffer.getChannelData(0);
     for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
     
     const source = ctx.createBufferSource();
     source.buffer = buffer;
     
     const filter = ctx.createBiquadFilter();
     filter.type = 'highpass';
     filter.frequency.value = 7000;

     const gain = ctx.createGain();
     gain.gain.value = 0.15;
     
     source.connect(filter);
     filter.connect(gain);
     gain.connect(dest);
     source.start(time);
  };

  const playBass = (time: number, freq: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    const gain = ctx.createGain();
    
    // Filter envelope
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.linearRampToValueAtTime(800, time + 0.05);
    filter.frequency.linearRampToValueAtTime(200, time + 0.3);

    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.linearRampToValueAtTime(0, time + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.5);
  }

  const loop = () => {
    if (!isPlaying) return;
    const now = ctx.currentTime;
    
    // 4 on the floor
    playKick(now);
    
    // Offbeat bass
    playBass(now + 0.25, 55); // A1
    playHiHat(now + 0.25);
    
    setTimeout(loop, beatDur);
  };

  loop();
  return () => { isPlaying = false; };
};

// 4. TWENTIES: Lo-fi Hip Hop (Chill, Filtered)
const playTwentiesTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
  let isPlaying = true;
  
  // 1. Add Vinyl Crackle (Pink Noiseish)
  const noiseBufferSize = ctx.sampleRate * 4;
  const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < noiseBufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02; // Brown/Pink-ish
    lastOut = output[i];
    output[i] *= 3.5; 
  }

  const crackleNode = ctx.createBufferSource();
  crackleNode.buffer = noiseBuffer;
  crackleNode.loop = true;
  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.03; // Very quiet
  crackleNode.connect(crackleGain);
  crackleGain.connect(dest);
  crackleNode.start();

  // 2. Chords (Filtered Triangle)
  const chordProgression = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [293.66, 349.23, 440.00, 523.25]  // Dm7
  ];
  let chordIdx = 0;

  const playChord = (time: number, freqs: number[]) => {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500; // Muffled lo-fi sound
      filter.connect(dest);

      freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          // Slight detune for "wobbly" tape feel
          osc.frequency.value = f + (Math.random() * 2 - 1); 
          
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.08, time + 0.5); // Slow attack
          gain.gain.linearRampToValueAtTime(0, time + 3.5); // Long release

          osc.connect(gain);
          gain.connect(filter);
          osc.start(time);
          osc.stop(time + 4);
      });
  };

  const loop = () => {
      if (!isPlaying) return;
      playChord(ctx.currentTime, chordProgression[chordIdx]);
      chordIdx = (chordIdx + 1) % chordProgression.length;
      setTimeout(loop, 4000); // Slow chords
  };

  loop();

  return () => {
      isPlaying = false;
      crackleNode.stop();
  };
};

// 5. THIRTIES: Ambient Night (Wind & Blips)
const playThirtiesTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    let isPlaying = true;

    // Wind Generator
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const windSource = ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 400;
    windFilter.Q.value = 1;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(dest);
    windSource.start();

    // Automate Wind Filter to "whoosh"
    const modulateWind = () => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        windFilter.frequency.linearRampToValueAtTime(300 + Math.random() * 400, now + 2);
        setTimeout(modulateWind, 2000);
    };
    modulateWind();

    // Random Blips (Crickets/Stars)
    const playBlip = () => {
        if (!isPlaying) return;
        if (Math.random() > 0.7) {
            playTone(ctx, dest, 880 + Math.random() * 500, 'sine', 0.05, ctx.currentTime, 0.05);
        }
        setTimeout(playBlip, 500);
    };
    playBlip();

    return () => {
        isPlaying = false;
        windSource.stop();
    };
};

// 6. FUTURE: Ethereal Drone
const playFutureTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    let isPlaying = true;

    const playDrone = (freq: number) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;

        const gain = ctx.createGain();
        gain.gain.value = 0.05;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start();

        // Filter sweep
        const sweep = () => {
             if (!isPlaying) {
                 osc.stop();
                 return;
             }
             const now = ctx.currentTime;
             filter.frequency.exponentialRampToValueAtTime(600, now + 5);
             filter.frequency.exponentialRampToValueAtTime(150, now + 10);
             setTimeout(sweep, 10000);
        }
        sweep();

        return () => osc.stop();
    };

    // Drone chord
    const stop1 = playDrone(110); // A2
    const stop2 = playDrone(164.81); // E3
    
    return () => {
        isPlaying = false;
        stop1();
        stop2();
    };
};

const playVictoryTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    let isPlaying = true;
    const loop = () => {
        if (!isPlaying) return;
        // C Major fast arp
        playTone(ctx, dest, 523.25, 'triangle', 0.2, ctx.currentTime, 0.2);
        setTimeout(() => playTone(ctx, dest, 659.25, 'triangle', 0.2, ctx.currentTime, 0.2), 100);
        setTimeout(() => playTone(ctx, dest, 783.99, 'triangle', 0.2, ctx.currentTime, 0.2), 200);
        setTimeout(loop, 1000);
    }
    loop();
    return () => { isPlaying = false; };
};

export default GameAudio;