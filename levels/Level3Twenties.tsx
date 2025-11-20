import React, { useState, useEffect, useRef } from 'react';
import { LevelProps } from '../types';
import PixelButton from '../components/PixelButton';
import { BookOpen, Beer, Eye } from 'lucide-react';

const Level3Twenties: React.FC<LevelProps> = ({ onComplete, onFail }) => {
  // Focus Mechanics
  const [focus, setFocus] = useState(50); // 0 to 100. Keep between 30 and 70.
  const [driftDirection, setDriftDirection] = useState(1); // -1 left, 1 right
  
  // Counting Mechanics
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentTask, setCurrentTask] = useState<'NONE' | 'BEER' | 'EYE'>('NONE');
  const [correctCounts, setCorrectCounts] = useState(0);
  const [feedback, setFeedback] = useState<string>("");

  const gameLoopRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const eventLoopRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Game Loop for Focus Decay & Drift
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setFocus(prev => {
        // Random drift variance
        const noise = Math.random() * 2 - 1;
        const change = (driftDirection * 0.8) + noise;
        const newVal = prev + change;

        if (newVal <= 0 || newVal >= 100) {
            onFail();
            return prev;
        }
        return newVal;
      });

      // Occasionally switch drift direction
      if (Math.random() > 0.95) {
          setDriftDirection(prev => prev * -1);
      }

    }, 50);

    return () => clearInterval(gameLoopRef.current);
  }, [driftDirection, onFail]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(t => {
            if (t <= 1) {
                clearInterval(timer);
                if (correctCounts >= 5) {
                     onComplete(correctCounts * 200);
                } else {
                     onFail();
                }
                return 0;
            }
            return t - 1;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [correctCounts, onComplete, onFail]);

  // Spawn Random Counting Events
  useEffect(() => {
    const spawnEvent = () => {
        if (Math.random() > 0.5) {
            const type = Math.random() > 0.5 ? 'BEER' : 'EYE';
            setCurrentTask(type);
            // Auto clear event if not clicked fast enough
            setTimeout(() => setCurrentTask('NONE'), 2000);
        }
    };

    eventLoopRef.current = setInterval(spawnEvent, 3000); // Every 3 seconds
    return () => clearInterval(eventLoopRef.current);
  }, []);

  const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFocus(Number(e.target.value));
  };

  const handleCount = (type: 'BEER' | 'EYE') => {
      if (currentTask === type) {
          setCorrectCounts(p => p + 1);
          setFeedback("NICE!");
          setCurrentTask('NONE');
      } else {
          setFocus(p => {
              const penalty = type === 'BEER' ? -15 : 15; // Big jolt on wrong click
              return Math.min(99, Math.max(1, p + penalty));
          });
          setFeedback("FOCUS!!");
      }
      setTimeout(() => setFeedback(""), 500);
  };

  const isBlurry = focus < 30 || focus > 70;

  return (
    <div className="flex flex-col h-full w-full bg-stone-800 text-white p-4 border-4 border-black relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-stone-600 pb-2">
        <div>
            <h2 className="text-2xl font-bold text-amber-500">THE TWENTIES</h2>
            <p className="text-xs text-stone-400">KEEP THE BOOK IN FOCUS + COUNT DISTRACTIONS</p>
        </div>
        <div className="text-right">
            <div className="text-2xl">{timeLeft}s</div>
            <div className="text-xs">SCORE: {correctCounts}</div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Focus Object (The Textbook) */}
        <div 
            className={`bg-white text-black p-8 w-64 h-80 flex items-center justify-center text-center border-4 border-stone-900 transition-all duration-75
                ${isBlurry ? 'blur-sm opacity-50' : 'shadow-[10px_10px_0_rgba(0,0,0,0.5)]'}
            `}
            style={{
                transform: `translateX(${(focus - 50) * 2}px) rotate(${(focus - 50) * 0.1}deg)`
            }}
        >
            <div>
                <BookOpen size={48} className="mx-auto mb-4" />
                <h3 className="font-bold text-xl underline decoration-2">STUDY HARD</h3>
                <p className="text-xs mt-4 font-mono leading-tight">
                    The mitochondria is the powerhouse of the cell.
                    Do not look at the beer. Do not look at the girl.
                </p>
            </div>
        </div>

        {/* Focus Slider Control */}
        <div className="w-full max-w-md mt-8 bg-stone-900 p-4 border-2 border-stone-600 rounded">
            <label className="block text-center text-xs mb-2 font-mono uppercase">Focus Tuning Dial</label>
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={focus} 
                onChange={handleFocusChange}
                className="w-full h-8 bg-stone-700 rounded appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-stone-500 mt-1">
                <span>DRIFTING...</span>
                <span>KEEP CENTER</span>
                <span>DRIFTING...</span>
            </div>
        </div>

        {/* Distraction Popups */}
        {currentTask !== 'NONE' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className={`animate-bounce p-4 rounded border-4 border-black bg-white text-black shadow-xl`}>
                     {currentTask === 'BEER' ? <Beer size={64} className="text-amber-600" /> : <Eye size={64} className="text-blue-600" />}
                </div>
            </div>
        )}

        {/* Feedback Text */}
        {feedback && (
            <div className="absolute top-10 text-4xl font-bold text-red-500 drop-shadow-[2px_2px_0_#000] animate-ping">
                {feedback}
            </div>
        )}

      </div>

      {/* Side Controls for Counting */}
      <div className="absolute bottom-4 left-4">
        <PixelButton variant="primary" onClick={() => handleCount('EYE')}>
             COUNT EYES (LEFT)
        </PixelButton>
      </div>
      <div className="absolute bottom-4 right-4">
        <PixelButton variant="danger" onClick={() => handleCount('BEER')}>
             COUNT BEERS (RIGHT)
        </PixelButton>
      </div>
    </div>
  );
};

export default Level3Twenties;