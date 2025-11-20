import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LevelProps, NoteKey, RhythmNote } from '../types';
import { Music } from 'lucide-react';

const TARGET_SCORE = 4; // Reduced from 15 for easier difficulty
const SPAWN_RATE = 2000; // Slower spawn rate (2s)
const KEYS: NoteKey[] = ['D', 'I', 'Y', 'M'];

const Level2Teens: React.FC<LevelProps> = ({ onComplete, onFail }) => {
  const [notes, setNotes] = useState<RhythmNote[]>([]);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{text: string, color: string} | null>(null);
  
  const requestRef = useRef<number>();
  const lastSpawnTime = useRef<number>(0);

  // Game Loop
  const updateGame = useCallback((time: number) => {
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
        position: n.position + 0.4 // Slowed down from 0.6
      })).filter(n => {
        // Remove notes that fall off screen
        if (n.position > 115 && !n.hit) {
           return false;
        }
        return n.position <= 115; 
      });
      return nextNotes;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [updateGame]);

  // Miss detection
  useEffect(() => {
    const missed = notes.find(n => n.position > 110 && !n.hit);
    if (missed) {
        setHealth(h => Math.max(0, h - 10));
        setCombo(0);
        setFeedback({ text: 'MISS', color: 'text-red-500' });
        setTimeout(() => setFeedback(null), 500);
    }
  }, [notes]);

  useEffect(() => {
    if (health <= 0) onFail();
    if (score >= TARGET_SCORE) onComplete(score * 100 + (health * 10));
  }, [health, score, onFail, onComplete]);

  const handleInteractionStart = useCallback((key: string) => {
    const upperKey = key.toUpperCase();
    if (!KEYS.includes(upperKey as NoteKey)) return;

    // Visual Feedback: Immediately show key as pressed
    setActiveKeys(prev => new Set(prev).add(upperKey));

    // Gameplay Logic: Check for hit
    setNotes(prev => {
        // Significantly widened hit window (60% to 110%)
        // This allows hitting the note much earlier or slightly late
        const hitIndex = prev.findIndex(n => 
            n.key === upperKey && 
            n.position > 60 && 
            n.position < 110 && 
            !n.hit
        );

        if (hitIndex !== -1) {
            // Hit!
            const newNotes = [...prev];
            newNotes[hitIndex].hit = true;
            setScore(s => s + 1);
            setCombo(c => c + 1);
            
            setFeedback({ text: 'PERFECT!', color: 'text-green-400' });
            setTimeout(() => setFeedback(null), 500);
            
            return newNotes;
        }
        return prev;
    });
  }, []);

  const handleInteractionEnd = useCallback((key: string) => {
      const upperKey = key.toUpperCase();
      setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(upperKey);
          return newSet;
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        handleInteractionStart(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => handleInteractionEnd(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInteractionStart, handleInteractionEnd]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-purple-900 text-white relative border-4 border-black overflow-hidden select-none">
      {/* Disco/Stage Lights */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,255,0.2),transparent)] animate-pulse pointer-events-none" />
      
      {/* HUD */}
      <div className="absolute top-4 w-full flex justify-between px-8 z-10">
        <div className="flex flex-col">
             <span className="text-pink-400 font-bold drop-shadow-md">HITS: {score}/{TARGET_SCORE}</span>
             <div className="w-32 h-4 border-2 border-white bg-black mt-1">
                 <div className="h-full bg-green-500 transition-all duration-300" style={{width: `${health}%`}}></div>
             </div>
        </div>
        <div className="text-right">
            <div className="text-yellow-400 text-2xl font-bold drop-shadow-[2px_2px_0_black]">COMBO {combo}</div>
        </div>
      </div>

      <div className="mb-4 text-center z-10">
        <h2 className="text-3xl font-bold text-pink-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">TEENAGE SYMPHONY</h2>
        <p className="text-sm text-purple-200">Press D, I, Y, M when notes hit the bar!</p>
      </div>

      {/* Rhythm Track */}
      <div className="relative w-full max-w-md h-96 bg-black/80 border-x-4 border-gray-700 flex justify-around items-end pb-8 shadow-2xl mt-4">
         {/* Hit Zone Indicator */}
         <div className="absolute bottom-[32px] left-0 w-full h-16 bg-white/10 border-y-2 border-white/30 pointer-events-none box-border"></div>

         {/* Feedback Pop-up */}
         {feedback && (
            <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl font-bold ${feedback.color} animate-bounce z-50 drop-shadow-md`}>
                {feedback.text}
            </div>
         )}

         {KEYS.map(key => {
             const isActive = activeKeys.has(key);
             return (
             <div key={key} className={`w-16 h-full relative border-r border-gray-800 last:border-r-0 flex justify-center transition-colors duration-100 ${isActive ? 'bg-white/10' : ''}`}>
                 
                 {/* Lane Beam when active */}
                 {isActive && <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-pink-500/20 to-transparent animate-pulse" />}

                 {/* Key Label / Target Button */}
                 <div className={`absolute bottom-2 w-14 h-14 border-4 rounded-lg flex items-center justify-center font-bold text-2xl transition-all duration-75 z-20 ${
                     isActive 
                     ? 'bg-pink-500 border-pink-300 text-white scale-95 shadow-[0_0_15px_#ec4899] translate-y-1' 
                     : 'border-gray-600 bg-gray-900/80 text-gray-500'
                 }`}>
                     {key}
                 </div>
                 
                 {/* Falling Notes */}
                 {notes.filter(n => n.key === key && !n.hit).map(note => (
                     <div 
                        key={note.id}
                        className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-white shadow-[0_0_10px_cyan] flex items-center justify-center z-10"
                        style={{ top: `${note.position}%` }}
                     >
                        <Music size={20} className="text-black animate-spin" />
                     </div>
                 ))}
             </div>
         )})}
      </div>

      {/* Mobile Controls (Touch Friendly) */}
      <div className="flex gap-2 mt-4 md:hidden w-full max-w-md px-4 z-20">
         {KEYS.map(k => (
             <button 
                key={k}
                className={`flex-1 h-16 border-2 rounded-lg font-bold text-xl transition-colors ${activeKeys.has(k) ? 'bg-pink-600 border-white' : 'bg-gray-800 border-gray-500'}`}
                onPointerDown={(e) => {
                    e.preventDefault();
                    handleInteractionStart(k);
                }}
                onPointerUp={(e) => {
                    e.preventDefault();
                    handleInteractionEnd(k);
                }}
                onPointerLeave={(e) => {
                    handleInteractionEnd(k);
                }}
             >
                 {k}
             </button>
         ))}
      </div>
    </div>
  );
};

export default Level2Teens;