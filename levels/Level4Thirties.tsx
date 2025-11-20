import React, { useState, useEffect } from 'react';
import { LevelProps } from '../types';
import { Flame, Baby, ShieldAlert } from 'lucide-react';

const Level4Thirties: React.FC<LevelProps> = ({ onComplete, onFail }) => {
  const [fireIntensity, setFireIntensity] = useState(50); // 0 to 100
  const [toddler1Pos, setToddler1Pos] = useState(0); // 0 (safe) to 100 (danger)
  const [toddler2Pos, setToddler2Pos] = useState(0); // 0 (safe) to 100 (danger)
  const [timeLeft, setTimeLeft] = useState(30); // Shortened to 30 seconds
  const [isFailed, setIsFailed] = useState(false);

  // Game Loop
  useEffect(() => {
    if (isFailed) return;

    const loop = setInterval(() => {
      // Fire decays FASTER now (Harder difficulty)
      setFireIntensity(prev => Math.max(0, prev - 0.6));

      // Toddler 1 Crawl Logic
      setToddler1Pos(prev => {
        if (prev >= 85) { // Hit the fire pit area
            setIsFailed(true);
            onFail();
            return 85;
        }
        return prev + 0.35; // Crawl speed
      });

      // Toddler 2 Crawl Logic (Appears halfway through: 15s)
      if (timeLeft <= 15) {
        setToddler2Pos(prev => {
            if (prev >= 85) {
                setIsFailed(true);
                onFail();
                return 85;
            }
            return prev + 0.4; // Slightly faster than baby 1
        });
      }

      setTimeLeft(prev => {
          if (prev <= 0) {
              // Time up, if fire is lit, win
              if (fireIntensity > 20) {
                onComplete(Math.floor(fireIntensity * 10));
              } else {
                onFail();
              }
              return 0;
          }
          return prev - 0.05; // 50ms tick
      });

    }, 50);

    return () => clearInterval(loop);
  }, [isFailed, onFail, onComplete, fireIntensity, timeLeft]);

  const handleStokeFire = () => {
      if (isFailed) return;
      // Harder to maintain: reduced boost per click (was 15)
      setFireIntensity(prev => Math.min(100, prev + 8)); 
  };

  const handleBlockToddler1 = () => {
      if (isFailed) return;
      setToddler1Pos(prev => Math.max(0, prev - 15));
  };

  const handleBlockToddler2 = () => {
      if (isFailed || timeLeft > 15) return; // Only works if baby 2 exists
      setToddler2Pos(prev => Math.max(0, prev - 15));
  };

  // Keyboard interaction
  useEffect(() => {
      const handler = (e: KeyboardEvent) => {
          if (e.key.toLowerCase() === 'a') handleBlockToddler1();
          if (e.key.toLowerCase() === 's') handleBlockToddler2();
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
  }, [isFailed, timeLeft]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 relative overflow-hidden border-4 border-black select-none">
      {/* Moon / Night Sky */}
      <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-yellow-100 shadow-[0_0_30px_rgba(255,255,255,0.3)]"></div>
      
      {/* Stars */}
      <div className="absolute top-20 left-20 text-white text-xs opacity-50">✦</div>
      <div className="absolute top-5 left-1/2 text-white text-xs opacity-70">✦</div>
      <div className="absolute top-32 right-1/3 text-white text-xs opacity-40">✦</div>

      <div className="z-10 p-4 text-center text-white drop-shadow-md pointer-events-none">
          <h2 className="text-2xl font-bold text-orange-100">THE THIRTIES: INFERNO PARENTING</h2>
          <p className="text-sm opacity-90 font-mono mt-1">
              CLICK FIRE constantly. 
              <br/>
              <span className="text-pink-300">[A] blocks Baby 1</span> 
              <span className="mx-2">•</span>
              <span className="text-cyan-300">{timeLeft <= 15 ? '[S] blocks Baby 2' : 'Wait for it...'}</span>
          </p>
          <div className="mt-2 text-3xl font-bold text-yellow-500">{Math.ceil(timeLeft)}s</div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-32 bg-[#1a2e1a] border-t-4 border-black"></div>

      {/* ---------------- FIRE PIT AREA ---------------- */}
      <div 
        className="absolute bottom-10 right-[10%] flex flex-col items-center z-20 cursor-pointer group" 
        onClick={handleStokeFire}
      >
          {/* Fire Graphic */}
          <div className={`relative transition-transform duration-100 ${fireIntensity > 50 ? 'scale-110' : 'scale-100'}`}>
               <Flame 
                    size={64 + (fireIntensity / 1.5)} 
                    className={`transition-colors duration-300 drop-shadow-[0_0_20px_orange] ${fireIntensity > 20 ? 'text-orange-500 fill-orange-500' : 'text-gray-600'}`} 
               />
               {/* Glow */}
               <div 
                className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 blur-xl opacity-40 pointer-events-none transition-all"
                style={{ width: `${fireIntensity * 1.5}px`, height: `${fireIntensity * 1.5}px` }}
               ></div>
          </div>

          {/* Wood Pile (Piled High) */}
          <div className="relative -mt-4 z-10">
              <div className="absolute bottom-0 left-[-10px] w-2 h-16 bg-[#5c4033] rotate-12 rounded border border-black"></div>
              <div className="absolute bottom-0 right-[-10px] w-2 h-16 bg-[#4a3728] -rotate-12 rounded border border-black"></div>
              <div className="absolute bottom-2 left-0 w-2 h-14 bg-[#6b4423] rotate-45 rounded border border-black"></div>
              <div className="absolute bottom-2 right-0 w-2 h-14 bg-[#3e2b1e] -rotate-45 rounded border border-black"></div>
              <div className="w-16 h-8 bg-transparent"></div> {/* Spacer */}
          </div>

          {/* Stainless Steel Pit */}
          <div className="w-32 h-16 bg-gradient-to-r from-gray-300 via-white to-gray-400 rounded-b-[2rem] rounded-t-sm border-x-2 border-b-2 border-gray-600 shadow-lg relative z-20 flex items-center justify-center">
                <div className="absolute top-2 w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none"></div>
                <span className="text-[8px] text-gray-500 font-mono tracking-widest opacity-60 mt-4">STAINLESS</span>
          </div>

          <div className="mt-2 bg-black/80 px-3 py-1 rounded-full text-xs text-white border border-white/20 font-bold shadow-lg z-30">
             HEAT: {Math.round(fireIntensity)}%
          </div>
      </div>


      {/* ---------------- TODDLER 1 ---------------- */}
      <div 
        className="absolute bottom-12 transition-all duration-75 z-30 flex flex-col items-center"
        style={{ left: `${toddler1Pos}%` }}
      >
          <Baby size={48} className="text-pink-300 fill-pink-200 animate-bounce" />
          <div className="bg-red-600 text-white text-[10px] px-1 font-bold uppercase border border-white shadow-md">Baby 1</div>
      </div>

      {/* Barrier 1 */}
      <div className="absolute bottom-10 left-[10%] z-10 opacity-30 pointer-events-none">
          <ShieldAlert size={40} className="text-pink-400" />
          <div className="text-pink-200 text-xs font-bold">[A]</div>
      </div>


      {/* ---------------- TODDLER 2 ---------------- */}
      {timeLeft <= 15 && (
        <div 
            className="absolute bottom-24 transition-all duration-75 z-20 flex flex-col items-center"
            style={{ left: `${toddler2Pos}%` }}
        >
            <Baby size={48} className="text-cyan-300 fill-cyan-200 animate-bounce" />
            <div className="bg-red-600 text-white text-[10px] px-1 font-bold uppercase border border-white shadow-md">Baby 2</div>
        </div>
      )}

      {/* Barrier 2 */}
      {timeLeft <= 15 && (
        <div className="absolute bottom-28 left-[10%] z-10 opacity-30 pointer-events-none">
            <ShieldAlert size={40} className="text-cyan-400" />
            <div className="text-cyan-200 text-xs font-bold">[S]</div>
        </div>
      )}


      {/* Mobile Controls */}
      <div className="md:hidden absolute bottom-4 left-4 flex gap-2">
          <button 
            className="w-20 h-20 bg-pink-500/50 rounded-full border-4 border-white flex flex-col items-center justify-center active:bg-pink-500"
            onClick={handleBlockToddler1}
          >
              <span className="font-bold text-xs">BLOCK</span>
              <span className="font-bold text-lg">1</span>
          </button>
          
          {timeLeft <= 15 && (
             <button 
                className="w-20 h-20 bg-cyan-500/50 rounded-full border-4 border-white flex flex-col items-center justify-center active:bg-cyan-500"
                onClick={handleBlockToddler2}
              >
                  <span className="font-bold text-xs">BLOCK</span>
                  <span className="font-bold text-lg">2</span>
              </button>
          )}
      </div>
    </div>
  );
};

export default Level4Thirties;