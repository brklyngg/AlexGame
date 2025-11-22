import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LevelProps } from '../types';
import PixelButton from '../components/PixelButton';
import { BookOpen, Beer, ChevronLeft, ChevronRight } from 'lucide-react';
import tigerWinkImg from '../assets/female_tiger_wink.png';

const Level3Twenties: React.FC<LevelProps> = ({ onComplete, onFail }) => {
    const [focus, setFocus] = useState(50);
    const [timeLeft, setTimeLeft] = useState(30); // 30 Seconds Duration
    const [activeDistraction, setActiveDistraction] = useState<'NONE' | 'BEER' | 'TIGER'>('NONE');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<string>("");

    const lastDistractionRef = useRef<'BEER' | 'TIGER' | null>(null);
    const gameLoopRef = useRef<ReturnType<typeof setInterval>>(undefined);
    const eventLoopRef = useRef<ReturnType<typeof setInterval>>(undefined);

    useEffect(() => {
        gameLoopRef.current = setInterval(() => {
            setFocus(prev => {
                let change = 0;
                if (activeDistraction === 'TIGER') {
                    change -= 0.8;
                } else if (activeDistraction === 'BEER') {
                    change += 0.8;
                } else {
                    change = Math.sin(Date.now() / 500) * 0.1;
                }
                const newVal = prev + change;
                if (newVal <= 0 || newVal >= 100) {
                    onFail();
                    return newVal;
                }
                return newVal;
            });
        }, 30);
        return () => clearInterval(gameLoopRef.current);
    }, [activeDistraction, onFail]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timer);
                    onComplete(1000 + (score * 100));
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [score, onComplete]);

    // Distraction Spawner
    useEffect(() => {
        const spawnEvent = () => {
            if (activeDistraction !== 'NONE') return;

            // High chance to spawn to keep it engaging over 30s
            if (Math.random() > 0.3) {
                let type: 'BEER' | 'TIGER';
                if (lastDistractionRef.current === 'BEER') {
                    type = 'TIGER';
                } else if (lastDistractionRef.current === 'TIGER') {
                    type = 'BEER';
                } else {
                    type = Math.random() > 0.5 ? 'BEER' : 'TIGER';
                }
                lastDistractionRef.current = type;
                setActiveDistraction(type);
            }
        };

        eventLoopRef.current = setInterval(spawnEvent, 2000);
        return () => clearInterval(eventLoopRef.current);
    }, [activeDistraction]);

    const handleNudge = useCallback((direction: 'left' | 'right') => {
        setFocus(prev => {
            const amount = direction === 'left' ? -10 : 10;
            return Math.min(98, Math.max(2, prev + amount));
        });
    }, []);

    const handleDistractionClick = () => {
        setScore(s => s + 1);
        setFeedback("NICE!");
        setActiveDistraction('NONE');
        setTimeout(() => setFeedback(""), 500);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handleNudge('left');
            if (e.key === 'ArrowRight') handleNudge('right');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNudge]);

    const isBlurry = focus < 20 || focus > 80;

    return (
        <div className="flex flex-col h-full w-full bg-stone-800 text-white p-4 border-4 border-black relative overflow-hidden select-none">
            <div className="flex justify-between items-center mb-2 border-b-2 border-stone-600 pb-2 z-20">
                <div>
                    <h2 className="text-xl font-bold text-amber-500">THE TWENTIES</h2>
                    <p className="text-[10px] md:text-xs text-stone-400">TAP ITEMS TO STOP THE PULL • CENTER THE BOOK</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl">{timeLeft}s</div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative w-full">

                {/* TIGER */}
                <div className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-center z-30 pointer-events-none">
                    {activeDistraction === 'TIGER' && (
                        <div
                            className="pointer-events-auto cursor-pointer animate-bounce"
                            onClick={handleDistractionClick}
                        >
                            <div className="bg-orange-500 text-black p-1 rounded-full border-4 border-black shadow-[0_0_20px_orange] relative overflow-hidden w-32 h-32 flex items-center justify-center">
                                <img
                                    src={tigerWinkImg}
                                    alt="Winking Tiger"
                                    className="w-full h-full object-cover"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </div>
                            <div className="text-orange-400 font-bold text-center mt-2 animate-pulse">&lt;&lt;&lt; PULLING</div>
                        </div>
                    )}
                </div>

                {/* BEER */}
                <div className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-center z-30 pointer-events-none">
                    {activeDistraction === 'BEER' && (
                        <div
                            className="pointer-events-auto cursor-pointer animate-bounce"
                            onClick={handleDistractionClick}
                        >
                            <div className="bg-amber-500 text-white p-4 rounded-full border-4 border-white shadow-[0_0_20px_orange]">
                                <Beer size={48} />
                                <span className="block text-[10px] font-bold text-center mt-1">TASTY!</span>
                            </div>
                            <div className="text-amber-400 font-bold text-center mt-2 animate-pulse">PULLING &gt;&gt;&gt;</div>
                        </div>
                    )}
                </div>

                {/* Book */}
                <div className="relative w-full h-full overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-stone-700/50 -translate-x-1/2 z-0"></div>
                    <div
                        className={`absolute top-1/2 left-0 bg-white text-black p-6 w-48 h-64 -mt-32 flex flex-col items-center justify-center text-center border-4 border-stone-900 transition-transform duration-75 z-10
                    ${isBlurry ? 'blur-[2px] opacity-70 border-red-500' : 'shadow-[10px_10px_0_rgba(0,0,0,0.5)]'}
                `}
                        style={{
                            left: `${focus}%`,
                            transform: `translateX(-50%) rotate(${(focus - 50) * 0.2}deg)`
                        }}
                    >
                        <BookOpen size={48} className="mx-auto mb-4 text-stone-800" />
                        <h3 className="font-bold text-lg underline decoration-2 mb-2">STUDYING...</h3>

                        <div className="mt-4 w-full h-4 bg-gray-200 rounded-full overflow-hidden border border-black">
                            <div className={`h-full ${isBlurry ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: '100%' }}></div>
                        </div>
                        <p className="text-[10px] mt-2 font-bold uppercase">
                            {activeDistraction === 'TIGER' ? "LADY TIGER!" : activeDistraction === 'BEER' ? "BEER TIME!" : "FOCUSED"}
                        </p>
                    </div>
                </div>

                {feedback && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 text-4xl font-bold text-green-400 drop-shadow-[2px_2px_0_#000] animate-ping z-40">
                        {feedback}
                    </div>
                )}
            </div>

            <div className="mt-2 flex justify-between gap-4 z-40">
                <PixelButton
                    className="flex-1 flex items-center justify-center gap-2 h-20 touch-manipulation active:scale-95 transition-transform"
                    variant="primary"
                    onClick={() => handleNudge('left')}
                >
                    <ChevronLeft size={32} /> PUSH LEFT
                </PixelButton>

                <PixelButton
                    className="flex-1 flex items-center justify-center gap-2 h-20 touch-manipulation active:scale-95 transition-transform"
                    variant="primary"
                    onClick={() => handleNudge('right')}
                >
                    PUSH RIGHT <ChevronRight size={32} />
                </PixelButton>
            </div>
        </div>
    );
};

export default Level3Twenties;