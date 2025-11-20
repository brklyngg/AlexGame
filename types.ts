export enum GameState {
  MENU = 'MENU',
  LEVEL_1 = 'LEVEL_1', // Childhood
  LEVEL_2 = 'LEVEL_2', // Teens
  LEVEL_3 = 'LEVEL_3', // Twenties
  LEVEL_4 = 'LEVEL_4', // Thirties
  LEVEL_5 = 'LEVEL_5', // Finale
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export type AudioMood = 'DEFAULT' | 'FANFARE' | 'ERROR' | 'PARTY' | 'SILENT';

export interface LevelProps {
  onComplete: (score: number) => void;
  onFail: () => void;
  setAudioMood: (mood: AudioMood) => void;
}

export type NoteKey = 'D' | 'I' | 'Y' | 'M';

export interface RhythmNote {
  id: number;
  key: NoteKey;
  position: number; // 0 to 100%
  hit: boolean;
}