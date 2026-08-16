import { CharacterInfo } from './character-info.js';
import { CharacterStatistics } from './character-statistics.js';
import { Move } from './move.js';

export interface Character {
  id: number;
  name: string;
  fightCoreId: number;
  normalizedName: string;
  moves: Move[];
  characterStatistics: CharacterStatistics;
  characterInfo: CharacterInfo;
}
