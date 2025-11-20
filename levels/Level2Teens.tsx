import React, { useState, useEffect, useRef } from 'react';
import { LevelProps, NoteKey, RhythmNote } from '../types';
import { Music, Zap } from 'lucide-react';

const TARGET_SCORE = 15; // Hits needed
const SPAWN_RATE = 1500; // ms - Slowed down from 800

const KEYS: NoteKey[] = ['D', 'I', 'Y', 'M'];

const Level2Teens: React.FC<LevelProps> = ({ onComplete, onFail }) => {
  const [notes, setNotes] = useState<RhythmNote[]>([]);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  
  const requestRef = useRef<number>();
  const lastSpawnTime = useRef<number>(0);

  // Game Loop
  const updateGame = (time: number) => {
    if (!lastSpawnTime.current) lastSpawnTime.current = time;

    // Spawn Notes
    if (time - lastSpawnTime.current > SPAWN_RATE) {
      const randomKey = KEYS[Math.floor(Math.random() * KEYS.length)];
      const newNote: RhythmNote = {
        id: time,
        key: randomKey,
        position: 0,
        hit: false
      };
      setNotes(prev => [...prev, newNote]);
      lastSpawnTime.current = time;
    }

    // Move Notes
    setNotes(prevNotes => {
      const nextNotes = prevNotes.map(n => ({
        ...n,
        position: n.position + 0.6 // Speed slowed down from 1.2
      })).filter(n => {
        if (n.position > 110 && !n.hit) {
           // Missed note logic handled in effect to avoid state loop in render
           return false;
        }
        return n.position <= 110; 
      });
      
      return nextNotes;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  // Miss detection (approximate for simplicity)
  useEffect(() => {
    const missed = notes.find(n => n.position > 100 && !n.hit);
    if (missed) {
        setHealth(h => h - 10);
        setCombo(0);
    }
  }, [notes]);

  useEffect(() => {
    if (health <= 0) onFail();
    if (score >= TARGET_SCORE) onComplete(score * 100 + (health * 10));
  }, [health, score, onFail, onComplete]);

  const handleKeyPress = (key: string) => {
    const upperKey = key.toUpperCase();
    if (!KEYS.includes(upperKey as NoteKey)) return;

    setNotes(prev => {
        const hitIndex = prev.findIndex(n => 
            n.key === upperKey && 
            n.position > 75 && 
            n.position < 95 && 
            !n.hit
        );

        if (hitIndex !== -1) {
            // Hit!
            const newNotes = [...prev];
            newNotes[hitIndex].hit = true;
            setScore(s => s + 1);
            setCombo(c => c + 1);
            return newNotes;
        } else {
            // Miss click (optional penalty)
            return prev;
        }
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyPress(e.key);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-purple-900 text-white relative border-4 border-black overflow-hidden">
      {/* Disco/Stage Lights */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,255,0.2),transparent)] animate-pulse pointer-events-none" />
      
      {/* HUD */}
      <div className="absolute top-4 w-full flex justify-between px-8 z-10">
        <div className="flex flex-col">
             <span className="text-pink-400 font-bold">HYPE: {score}/{TARGET_SCORE}</span>
             <div className="w-32 h-4 border-2 border-white bg-black mt-1">
                 <div className="h-full bg-green-500" style={{width: `${health}%`}}></div>
             </div>
        </div>
        <div className="text-right">
            <div className="text-yellow-400 text-2xl font-bold">COMBO {combo}</div>
        </div>
      </div>

      <div className="mb-4 text-center z-10">
        <h2 className="text-3xl font-bold text-pink-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">TEENAGE SYMPHONY</h2>
        <p className="text-sm">Press <span className="text-yellow-300">D, I, Y, M</span> to the beat!</p>
      </div>

      {/* Rhythm Track */}
      <div className="relative w-full max-w-md h-96 bg-black/80 border-x-4 border-gray-700 flex justify-around items-end pb-8 shadow-2xl">
         {/* Hit Zone */}
         <div className="absolute bottom-8 left-0 w-full h-16 bg-white/10 border-y-2 border-white/30 pointer-events-none"></div>

         {KEYS.map(key => (
             <div key={key} className="w-16 h-full relative border-r border-gray-800 last:border-r-0 flex justify-center">
                 {/* Key Label */}
                 <div className={`absolute bottom-2 w-12 h-12 border-2 rounded flex items-center justify-center font-bold text-xl transition-colors ${
                     ['D', 'I', 'Y', 'M'].includes(key) ? 'border-pink-500 text-pink-500' : 'border-gray-500'
                 }`}>
                     {key}
                 </div>
                 
                 {/* Falling Notes */}
                 {notes.filter(n => n.key === key && !n.hit).map(note => (
                     <div 
                        key={note.id}
                        className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-white shadow-[0_0_10px_cyan] flex items-center justify-center"
                        style={{ top: `${note.position}%` }}
                     >
                        <Music size={16} className="text-black" />
                     </div>
                 ))}
             </div>
         ))}
      </div>

      {/* Mobile Controls (Fallback) */}
      <div className="flex gap-4 mt-4 md:hidden z-20">
         {KEYS.map(k => (
             <button 
                key={k}
                className="w-12 h-12 bg-gray-800 border-2 border-white rounded active:bg-pink-600"
                onClick={() => handleKeyPress(k)}
             >
                 {k}
             </button>
         ))}
      </div>
    </div>
  );
};

export default Level2Teens;