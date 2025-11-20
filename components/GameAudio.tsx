import React, { useEffect, useRef } from 'react';
import { GameState, AudioMood } from '../types';

interface GameAudioProps {
  gameState: GameState;
  audioMood: AudioMood;
}

type StopFunction = () => void;

const GameAudio: React.FC<GameAudioProps> = ({ gameState, audioMood }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopCurrentTrackRef = useRef<StopFunction | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    masterGainRef.current = masterGain;

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

    // Stop previous
    if (stopCurrentTrackRef.current) {
      stopCurrentTrackRef.current();
      stopCurrentTrackRef.current = null;
    }

    const ctx = audioCtxRef.current;
    const dest = masterGainRef.current;

    let stopTrack: StopFunction | null = null;

    // Mood Logic Overrides
    if (audioMood === 'SILENT') {
        // Do nothing
    } else if (audioMood === 'FANFARE') {
        stopTrack = playFanfare(ctx, dest);
    } else if (audioMood === 'ERROR') {
        stopTrack = playErrorSound(ctx, dest);
    } else if (audioMood === 'PARTY') {
        stopTrack = playLevel5EDM(ctx, dest);
    } else {
        // Standard State Logic
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
                // Level 5 starts silent until "plugged in" (PARTY mood)
                // If we are here, mood is DEFAULT, so silence/drone
                stopTrack = playFutureDrone(ctx, dest);
                break;
            case GameState.VICTORY:
                stopTrack = playVictoryTheme(ctx, dest);
                break;
            default:
                break;
        }
    }

    stopCurrentTrackRef.current = stopTrack;

    return () => {
      if (stopCurrentTrackRef.current) {
        stopCurrentTrackRef.current();
      }
    };
  }, [gameState, audioMood]);

  return null;
};

// --- SYNTHESIS HELPERS ---

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

const playMenuTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
  let isPlaying = true;
  const tempo = 0.25; 
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

const playChildhoodTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
  let isPlaying = true;
  const speed = 150;
  const melody = [
    523.25, 523.25, 659.25, 523.25, 783.99, 0, 659.25, 0,
    587.33, 587.33, 698.46, 587.33, 880.00, 0, 783.99, 0
  ];
  let idx = 0;
  const loop = () => {
    if (!isPlaying) return;
    const freq = melody[idx];
    if (freq > 0) playTone(ctx, dest, freq, 'square', 0.1, ctx.currentTime, 0.2);
    idx = (idx + 1) % melody.length;
    setTimeout(loop, speed);
  };
  loop();
  return () => { isPlaying = false; };
};

const playTeensTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
  let isPlaying = true;
  const beatDur = 500;
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
  const loop = () => {
    if (!isPlaying) return;
    const now = ctx.currentTime;
    playKick(now);
    playTone(ctx, dest, 55, 'sawtooth', 0.3, now + 0.25, 0.3); // Offbeat bass
    setTimeout(loop, beatDur);
  };
  loop();
  return () => { isPlaying = false; };
};

const playTwentiesTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
  let isPlaying = true;
  // Lo-fi noise
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.05;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const nGain = ctx.createGain();
  nGain.gain.value = 0.1;
  noise.connect(nGain);
  nGain.connect(dest);
  noise.start();

  // Chords
  const chords = [[261, 329, 392], [293, 349, 440]];
  let cIdx = 0;
  const loop = () => {
      if (!isPlaying) return;
      const now = ctx.currentTime;
      chords[cIdx].forEach(f => playTone(ctx, dest, f, 'triangle', 2.0, now, 0.1));
      cIdx = (cIdx + 1) % chords.length;
      setTimeout(loop, 4000);
  };
  loop();
  return () => { isPlaying = false; noise.stop(); };
};

const playThirtiesTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    let isPlaying = true;
    // Wind
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    const gain = ctx.createGain();
    gain.gain.value = 0.1;
    noise.connect(filter).connect(gain).connect(dest);
    noise.start();
    
    // Crickets
    const loop = () => {
        if (!isPlaying) return;
        if (Math.random() > 0.7) playTone(ctx, dest, 800 + Math.random()*200, 'sine', 0.1, ctx.currentTime, 0.05);
        setTimeout(loop, 500);
    };
    loop();
    return () => { isPlaying = false; noise.stop(); };
};

const playFutureDrone = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    let isPlaying = true;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 110;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    osc.connect(filter).connect(gain).connect(dest);
    osc.start();
    return () => { isPlaying = false; osc.stop(); };
};

const playVictoryTheme = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    let isPlaying = true;
    const loop = () => {
        if (!isPlaying) return;
        playTone(ctx, dest, 523.25, 'triangle', 0.2, ctx.currentTime, 0.2);
        setTimeout(() => playTone(ctx, dest, 659, 'triangle', 0.2, ctx.currentTime, 0.2), 100);
        setTimeout(() => playTone(ctx, dest, 783, 'triangle', 0.2, ctx.currentTime, 0.2), 200);
        setTimeout(loop, 1000);
    }
    loop();
    return () => { isPlaying = false; };
};

// --- MOOD TRACKS ---

const playFanfare = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    const now = ctx.currentTime;
    // Arpeggio UP
    playTone(ctx, dest, 523.25, 'square', 0.2, now, 0.3); // C
    playTone(ctx, dest, 659.25, 'square', 0.2, now + 0.1, 0.3); // E
    playTone(ctx, dest, 783.99, 'square', 0.2, now + 0.2, 0.3); // G
    playTone(ctx, dest, 1046.50, 'square', 0.8, now + 0.3, 0.3); // C5
    return () => {}; // One shot
};

const playErrorSound = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    return () => {}; // One shot
};

const playLevel5EDM = (ctx: AudioContext, dest: AudioNode): StopFunction => {
    let isPlaying = true;
    const bpm = 128;
    const beat = 60 / bpm;

    // Kick Drum
    const kick = (time: number) => {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.connect(gain).connect(dest);
        osc.start(time);
        osc.stop(time + 0.5);
    };

    // Supersaw Chord
    const saw = (time: number, freq: number) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.linearRampToValueAtTime(0, time + 0.2); // Pluck
        osc.connect(gain).connect(dest);
        osc.start(time);
        osc.stop(time + 0.3);
    };

    const loop = () => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        // 4/4 kick
        kick(now);
        kick(now + beat);
        kick(now + beat*2);
        kick(now + beat*3);

        // Offbeat bass/chords
        [220, 329, 440].forEach(f => saw(now + beat/2, f));
        [220, 329, 440].forEach(f => saw(now + beat + beat/2, f));
        [196, 311, 392].forEach(f => saw(now + beat*2 + beat/2, f));
        [196, 311, 392].forEach(f => saw(now + beat*3 + beat/2, f));

        setTimeout(loop, beat * 4 * 1000);
    };
    loop();

    return () => { isPlaying = false; };
};

export default GameAudio;