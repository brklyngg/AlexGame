import React, { useState, useEffect } from 'react';
import { GameState } from './types';
import MainMenu from './levels/MainMenu';
import Level1Childhood from './levels/Level1Childhood';
import Level2Teens from './levels/Level2Teens';
import Level3Twenties from './levels/Level3Twenties';
import Level4Thirties from './levels/Level4Thirties';
import Level5Future from './levels/Level5Future';
import PixelButton from './components/PixelButton';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [totalScore, setTotalScore] = useState(0);
  const [unlockedSecret, setUnlockedSecret] = useState(false);

  const handleStartGame = () => {
    setTotalScore(0);
    setGameState(GameState.LEVEL_1);
  };

  const handleLevelComplete = (levelScore: number) => {
    setTotalScore(prev => prev + levelScore);

    // Level Progression Logic
    switch (gameState) {
      case GameState.LEVEL_1:
        setGameState(GameState.LEVEL_2);
        break;
      case GameState.LEVEL_2:
        setGameState(GameState.LEVEL_3);
        break;
      case GameState.LEVEL_3:
        setGameState(GameState.LEVEL_4);
        break;
      case GameState.LEVEL_4:
        setUnlockedSecret(true);
        setGameState(GameState.LEVEL_5);
        break;
      case GameState.LEVEL_5:
        setGameState(GameState.VICTORY);
        break;
      default:
        setGameState(GameState.MENU);
    }
  };

  const handleFail = () => {
    setGameState(GameState.GAME_OVER);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.MENU:
        return <MainMenu onStart={handleStartGame} highScore={0} />; // High score persistence could be added here
      case GameState.LEVEL_1:
        return <Level1Childhood onComplete={handleLevelComplete} onFail={handleFail} />;
      case GameState.LEVEL_2:
        return <Level2Teens onComplete={handleLevelComplete} onFail={handleFail} />;
      case GameState.LEVEL_3:
        return <Level3Twenties onComplete={handleLevelComplete} onFail={handleFail} />;
      case GameState.LEVEL_4:
        return <Level4Thirties onComplete={handleLevelComplete} onFail={handleFail} />;
      case GameState.LEVEL_5:
        return <Level5Future onComplete={handleLevelComplete} onFail={handleFail} />;
      case GameState.GAME_OVER:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full bg-red-900 text-white">
            <h1 className="text-6xl font-bold mb-4">GAME OVER</h1>
            <p className="text-2xl mb-8">TRY AGAIN?</p>
            <PixelButton onClick={() => setGameState(GameState.MENU)}>RETURN TO MENU</PixelButton>
          </div>
        );
      case GameState.VICTORY:
        return (
           <div className="flex flex-col items-center justify-center h-full w-full bg-white text-black text-center p-8">
              <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  LEGEND
              </h1>
              <p className="text-xl mb-4">You have lived a full life.</p>
              <div className="bg-black text-white p-4 rounded border-4 border-gray-500 mb-8">
                  FINAL SCORE: {totalScore}
              </div>
              <PixelButton onClick={() => setGameState(GameState.MENU)}>PLAY AGAIN</PixelButton>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-zinc-800 flex items-center justify-center p-4 md:p-8">
      {/* Arcade Cabinet Frame */}
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl border-8 border-zinc-700 overflow-hidden">
        {/* Screen Glare / Reflection (Subtle) */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-50 rounded-lg"></div>
        
        {/* Game Content */}
        <div className="w-full h-full">
          {renderContent()}
        </div>

        {/* Overlay Scanlines */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none z-40"></div>
      </div>
    </div>
  );
};

export default App;