import React, { useState, useEffect } from 'react';
import { LevelProps } from '../types';
import { Plug, Zap, Heart, Users, Sun } from 'lucide-react';

const Level5Future: React.FC<LevelProps> = ({ onComplete }) => {
  const [pluggedIn, setPluggedIn] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [textStep, setTextStep] = useState(0);

  const handlePlug = () => {
      setPluggedIn(true);
  };

  // Animation sequence
  useEffect(() => {
      if (pluggedIn) {
          const fade = setInterval(() => {
              setOpacity(o => Math.min(1, o + 0.01));
          }, 50);

          // Text sequence
          const textSeq = setTimeout(() => setTextStep(1), 2000);
          const textSeq2 = setTimeout(() => setTextStep(2), 5000);
          const textSeq3 = setTimeout(() => setTextStep(3), 9000);
          const complete = setTimeout(() => onComplete(99999), 14000);

          return () => {
              clearInterval(fade);
              clearTimeout(textSeq);
              clearTimeout(textSeq2);
              clearTimeout(textSeq3);
              clearTimeout(complete);
          };
      }
  }, [pluggedIn, onComplete]);

  if (!pluggedIn) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white border-4 border-white/20">
            <h2 className="text-xl mb-8 text-gray-400">THE TWELFTH DECADE</h2>
            <div className="flex items-center gap-8 cursor-pointer group" onClick={handlePlug}>
                <div className="relative">
                    <div className="absolute -left-20 top-1/2 w-20 h-2 bg-gray-600"></div>
                    <Plug size={64} className="text-gray-300 group-hover:text-white transition-colors rotate-90" />
                </div>
                <div className="relative">
                     <Zap size={64} className="text-yellow-500 opacity-20 group-hover:opacity-100 transition-opacity animate-pulse" />
                     <div className="absolute -right-20 top-1/2 w-20 h-2 bg-gray-600"></div>
                </div>
            </div>
            <p className="mt-8 animate-pulse text-sm">[ CLICK TO CONNECT ]</p>
        </div>
      );
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col items-center justify-center">
        {/* Light Show Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black transition-opacity duration-[3000ms]" style={{ opacity }}></div>
        
        {/* Art Car / Burning Man visuals (Abstract) */}
        <div className="absolute bottom-0 w-full flex justify-center transition-transform duration-[5000ms] translate-y-10" style={{ opacity }}>
             <div className="w-96 h-64 bg-black/30 backdrop-blur-sm rounded-t-full border-t-4 border-yellow-500 shadow-[0_0_50px_rgba(255,200,0,0.5)] flex items-end justify-center pb-10 relative">
                 {/* Silhouette Crowd */}
                 <Users size={48} className="text-pink-500 mx-2" />
                 <Users size={64} className="text-blue-500 mx-2 -mt-4" />
                 <Users size={48} className="text-purple-500 mx-2" />
                 
                 {/* Goddess Figure */}
                 <div className="absolute -top-16 text-white drop-shadow-[0_0_15px_white]">
                     <Sun size={80} className="animate-[spin_10s_linear_infinite]" />
                 </div>
             </div>
        </div>

        {/* Narrative Text */}
        <div className="z-10 text-center p-8 max-w-2xl">
            {textStep >= 1 && (
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 animate-[fadeIn_2s_ease-in] drop-shadow-lg mb-8">
                    ILLUMINATION
                </h1>
            )}
            
            {textStep >= 2 && (
                <p className="text-xl text-white/80 font-mono animate-[fadeIn_2s_ease-in] mb-4">
                    Endurance. Creation. Friendship.
                </p>
            )}

            {textStep >= 3 && (
                 <div className="flex flex-col items-center animate-[fadeIn_2s_ease-in]">
                    <Heart className="text-red-500 fill-red-500 w-16 h-16 mb-4 animate-bounce" />
                    <p className="text-2xl text-white font-bold">IMMORTALITY</p>
                 </div>
            )}
        </div>
    </div>
  );
};

export default Level5Future;