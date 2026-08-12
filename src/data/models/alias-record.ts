import { Character } from '../../models/character.js';

export class AliasRecord {
  name!: string;
  names!: string[];
  moves?: Map<string, string>;
  fightCoreId!: number;
  character?: Character;
}
