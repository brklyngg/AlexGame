import React, { useState, useEffect } from 'react';
import { LevelProps } from '../types';
import { Plug, Zap, Heart, Users, Sun } from 'lucide-react';

const Level5Future: React.FC<LevelProps> = ({ onComplete, setAudioMood }) => {
  const [pluggedIn, setPluggedIn] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [textStep, setTextStep] = useState(0);

  const handlePlug = () => {
      setPluggedIn(true);
      setAudioMood('PARTY'); // Trigger EDM
  };

  useEffect(() => {
      if (pluggedIn) {
          const fade = setInterval(() => {
              setOpacity(o => Math.min(1, o + 0.01));
          }, 50);

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
        
        {/* Lasers */}
        <div className="absolute top-0 left-1/4 w-1 h-full bg-pink-500 opacity-30 animate-[spin_4s_linear_infinite] origin-top"></div>
        <div className="absolute top-0 right-1/4 w-1 h-full bg-cyan-500 opacity-30 animate-[spin_5s_linear_infinite_reverse] origin-top"></div>

        {/* Mutant Vehicle / Art Car */}
        <div className="absolute bottom-10 w-full flex justify-center transition-transform duration-[5000ms] translate-y-10" style={{ opacity }}>
             <div className="relative w-[500px] h-64">
                 {/* Body */}
                 <div className="absolute bottom-0 w-full h-48 bg-stone-800 rounded-xl border-4 border-gray-600 overflow-hidden shadow-2xl">
                      {/* Deck */}
                      <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] opacity-50"></div>
                 </div>

                 {/* String Lights (Outline) */}
                 <div className="absolute top-16 -left-4 w-[530px] h-48 flex justify-between pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                          <div key={i} className="w-3 h-3 rounded-full bg-yellow-300 animate-pulse shadow-[0_0_10px_yellow]" style={{ animationDelay: `${i * 0.1}s` }}></div>
                      ))}
                 </div>

                 {/* Speakers */}
                 <div className="absolute bottom-4 left-4 w-24 h-24 bg-black rounded-full border-4 border-gray-500 flex items-center justify-center animate-pulse">
                      <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
                 </div>
                 <div className="absolute bottom-4 right-4 w-24 h-24 bg-black rounded-full border-4 border-gray-500 flex items-center justify-center animate-pulse">
                      <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
                 </div>

                 {/* Dancing Crowd Silhouettes */}
                 <div className="absolute top-0 left-10 flex items-end h-64 space-x-4">
                      <Users size={48} className="text-pink-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <Users size={56} className="text-cyan-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <Users size={48} className="text-lime-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
                      <Users size={64} className="text-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                 </div>
                 
                 {/* Main Totem */}
                 <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                     <div className="relative">
                        <Sun size={100} className="text-amber-400 animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-0 bg-amber-500 blur-xl opacity-50 animate-pulse"></div>
                     </div>
                 </div>
             </div>
        </div>

        {/* Narrative Text */}
        <div className="z-10 text-center p-8 max-w-2xl mt-[-200px]">
            {textStep >= 1 && (
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 animate-[fadeIn_2s_ease-in] drop-shadow-lg mb-8">
                    ILLUMINATION
                </h1>
            )}
            
            {textStep >= 2 && (
                <p className="text-xl text-white/90 font-mono bg-black/50 px-4 py-2 rounded animate-[fadeIn_2s_ease-in] mb-4 inline-block">
                    Endurance. Creation. Friendship.
                </p>
            )}

            {textStep >= 3 && (
                 <div className="flex flex-col items-center animate-[fadeIn_2s_ease-in]">
                    <Heart className="text-red-500 fill-red-500 w-16 h-16 mb-4 animate-bounce drop-shadow-[0_0_20px_red]" />
                    <p className="text-2xl text-white font-bold drop-shadow-md">IMMORTALITY</p>
                 </div>
            )}
        </div>
    </div>
  );
};

export default Level5Future;