import React from 'react';
import PixelButton from '../components/PixelButton';

interface MainMenuProps {
  onStart: () => void;
  highScore: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, highScore }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-900 text-green-400 border-4 border-zinc-700 p-8 relative overflow-hidden">
       {/* CRT Scanline effect */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,6px_100%] pointer-events-none"></div>

       <div className="z-20 text-center space-y-8">
           <div>
               <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-700 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                   ALEX
               </h1>
               <h2 className="text-2xl md:text-3xl text-white mt-2 font-bold tracking-widest">
                   FORTY LEVELS DEEP
               </h2>
           </div>

           <div className="border-2 border-green-600 bg-black/50 p-4 w-64 mx-auto">
               <p className="text-sm text-green-300 mb-1">HIGH SCORE</p>
               <p className="text-3xl text-white font-mono">{highScore.toString().padStart(6, '0')}</p>
           </div>

           <div className="space-y-4">
               <PixelButton onClick={onStart} className="w-full text-xl animate-pulse">INSERT COIN (START)</PixelButton>
           </div>

           <div className="text-xs text-zinc-500 mt-12">
               © 2024 RETRO LIFE SIMULATOR LTD.
           </div>
       </div>
    </div>
  );
};

export default MainMenu;