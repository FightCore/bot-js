import { CharacterInfo } from './character-info';
import { CharacterStatistics } from './character-statistics';
import { Move } from './move';

export interface Character {
  id: number;
  name: string;
  fightCoreId: number;
  normalizedName: string;
  moves: Move[];
  characterStatistics: CharacterStatistics;
  characterInfo: CharacterInfo;
}
