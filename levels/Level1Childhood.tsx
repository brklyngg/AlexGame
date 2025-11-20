import React, { useState, useEffect, useCallback } from 'react';
import { LevelProps } from '../types';
import PixelButton from '../components/PixelButton';
import { Flag, Timer, Trophy, X } from 'lucide-react';

const GOAL_DISTANCE = 100;

const Level1Childhood: React.FC<LevelProps> = ({ onComplete, onFail, setAudioMood }) => {
  const [distance, setDistance] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0); // Count UP
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSprint = useCallback((key: string) => {
    if (!started && !finished) setStarted(true);
    if (finished) return;
    
    setDistance(prev => Math.min(prev + 2, GOAL_DISTANCE));
  }, [started, finished]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        handleSprint(e.code);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSprint]);

  // Timer: Counts UP
  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  // Win Condition Sequence
  useEffect(() => {
    if (distance >= GOAL_DISTANCE && !finished) {
      setFinished(true);
      
      // 1. Fanfare
      setAudioMood('FANFARE');

      // 2. Error after delay
      setTimeout(() => {
          setAudioMood('ERROR');
          setShowError(true);
      }, 2000);

      // 3. Complete Level
      setTimeout(() => {
          onComplete(Math.max(100, 1000 - (timeElapsed * 10)));
      }, 4000);
    }
  }, [distance, finished, onComplete, timeElapsed, setAudioMood]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-sky-300 relative overflow-hidden border-4 border-black select-none">
      {/* Background Scenery */}
      <div className="absolute bottom-0 w-full h-32 bg-green-600 border-t-4 border-black"></div>
      <div className="absolute top-20 left-20 w-16 h-16 bg-yellow-300 rounded-full border-4 border-black animate-pulse"></div>
      
      <div className="absolute top-10 right-10 text-white opacity-80 text-6xl select-none">☁️</div>
      <div className="absolute top-24 left-1/3 text-white opacity-60 text-6xl select-none">☁️</div>

      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black text-white p-2 border-2 border-white z-10">
        <div className="flex items-center gap-2">
          <Timer size={20} />
          <span className="text-xl">{timeElapsed}s</span>
        </div>
      </div>

      <div className="z-10 text-center mb-8">
        <h2 className="text-4xl font-bold text-black drop-shadow-md mb-2">CAMP OLYMPIC</h2>
        <p className="text-black font-bold bg-white/50 px-2">MASH <span className="text-red-600">[SPACE]</span> or <span className="text-red-600">[ARROWS]</span>!</p>
      </div>

      {/* Track */}
      <div className="w-full max-w-2xl h-16 border-4 border-black bg-orange-200 relative mt-10">
        <div 
          className="h-full bg-red-500 border-r-4 border-black transition-all duration-75 ease-linear relative"
          style={{ width: `${distance}%` }}
        >
            {/* Character */}
            <div className="absolute right-[-20px] top-[-40px] text-4xl animate-bounce flex items-center">
                🏃
                {/* Trophy Logic */}
                {finished && !showError && (
                    <Trophy className="text-yellow-400 ml-2 drop-shadow-[2px_2px_0_black] animate-pulse" size={32} />
                )}
                {showError && (
                    <div className="absolute right-[-10px] -top-4">
                        <X className="text-red-600 w-12 h-12 animate-ping" strokeWidth={4} />
                    </div>
                )}
            </div>
        </div>
        
        {/* Finish Line */}
        <div className="absolute right-0 top-0 h-full w-8 flex flex-col justify-between border-l-4 border-dashed border-black/50 opacity-50">
             <div className="h-1/2 bg-black/10"></div>
             <div className="h-1/2 bg-black/20"></div>
        </div>
        <Flag className="absolute right-[-20px] top-[-50px] text-red-600" size={48} />
      </div>
      
      <div className="mt-12 md:hidden z-20">
        <PixelButton onClick={() => handleSprint('Tap')}>TAP RAPIDLY</PixelButton>
      </div>
    </div>
  );
};

export default Level1Childhood;