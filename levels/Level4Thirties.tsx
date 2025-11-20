import React, { useState, useEffect } from 'react';
import { LevelProps } from '../types';
import { Flame, Baby, ShieldAlert } from 'lucide-react';

const Level4Thirties: React.FC<LevelProps> = ({ onComplete, onFail }) => {
  const [fireIntensity, setFireIntensity] = useState(0); // 0 to 100, needs 100 to win
  const [toddlerPos, setToddlerPos] = useState(0); // 0 (safe) to 100 (danger)
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFailed, setIsFailed] = useState(false);

  // Game Loop
  useEffect(() => {
    if (isFailed) return;

    const loop = setInterval(() => {
      // Fire decays slowly
      setFireIntensity(prev => Math.max(0, prev - 0.2));

      // Toddler crawls towards fire (100)
      setToddlerPos(prev => {
        if (prev >= 95) {
            setIsFailed(true);
            onFail();
            return 100;
        }
        return prev + 0.4; // Constant approach speed
      });

      setTimeLeft(prev => {
          if (prev <= 0) {
              // Time up, if fire is lit, win
              if (fireIntensity > 50) {
                onComplete(Math.floor(fireIntensity * 10));
              } else {
                onFail();
              }
              return 0;
          }
          return prev - 0.05; // Loop runs fast, so decrement fraction
      });

    }, 50);

    return () => clearInterval(loop);
  }, [isFailed, onFail, onComplete, fireIntensity]);

  const handleStokeFire = () => {
      if (isFailed) return;
      setFireIntensity(prev => Math.min(100, prev + 15));
  };

  const handleBlockToddler = () => {
      if (isFailed) return;
      // Push toddler back
      setToddlerPos(prev => Math.max(0, prev - 15));
  };

  // Keyboard interaction for blocking
  useEffect(() => {
      const handler = (e: KeyboardEvent) => {
          if (e.key.toLowerCase() === 'a') {
              handleBlockToddler();
          }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
  }, [isFailed]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 relative overflow-hidden border-4 border-black select-none">
      {/* Moon / Night Sky */}
      <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-yellow-100 shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
      
      {/* Stars */}
      <div className="absolute top-20 left-20 text-white text-xs">.</div>
      <div className="absolute top-5 left-1/2 text-white text-xs">.</div>
      <div className="absolute top-32 right-1/3 text-white text-xs">.</div>

      <div className="z-10 p-4 text-center text-white drop-shadow-md">
          <h2 className="text-2xl font-bold">THE THIRTIES: PROTECT THE FLAME</h2>
          <p className="text-sm opacity-80">CLICK FIRE to Stoke. Press <span className="text-yellow-400 font-bold">[A]</span> to Block Baby.</p>
          <div className="mt-2 text-xl font-mono">{Math.ceil(timeLeft)}s Remaining</div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-32 bg-green-900 border-t-4 border-black"></div>

      {/* Fire Pit Area */}
      <div className="absolute bottom-16 right-1/4 flex flex-col items-center z-20 cursor-pointer group" onClick={handleStokeFire}>
          {/* Fire Graphic */}
          <div className={`transition-all duration-200 relative ${fireIntensity > 50 ? 'scale-125' : 'scale-100'}`}>
               <Flame 
                    size={64 + (fireIntensity / 2)} 
                    className={`transition-colors duration-300 ${fireIntensity > 50 ? 'text-orange-500 fill-orange-500' : 'text-gray-500'}`} 
               />
               {/* Glow */}
               <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 blur-xl opacity-50 transition-all"
                style={{ width: `${fireIntensity}px`, height: `${fireIntensity}px` }}
               ></div>
          </div>
          <div className="mt-2 bg-black/50 px-2 py-1 rounded text-xs text-white border border-white/20">
             HEAT: {Math.round(fireIntensity)}%
          </div>
          <div className="text-white text-xs animate-bounce mt-1 opacity-0 group-hover:opacity-100">CLICK!</div>
      </div>

      {/* Toddler Area */}
      <div 
        className="absolute bottom-12 transition-all duration-75 z-30 flex flex-col items-center"
        style={{ left: `${toddlerPos}%` }}
      >
          <Baby size={48} className="text-pink-300 fill-pink-200 animate-bounce" />
          <div className="bg-red-600 text-white text-[10px] px-1 font-bold uppercase">Danger</div>
      </div>

      {/* Barrier/Block Visual */}
      <div className="absolute bottom-10 left-[15%] z-10 opacity-50">
          <ShieldAlert size={32} className="text-white" />
          <div className="text-white text-xs">[A] ZONE</div>
      </div>

      {/* Touch Controls for Mobile */}
      <button 
        className="md:hidden absolute bottom-4 left-4 w-24 h-24 bg-red-500/50 rounded-full border-4 border-white flex items-center justify-center active:bg-red-500"
        onClick={handleBlockToddler}
      >
          BLOCK
      </button>
    </div>
  );
};

export default Level4Thirties;