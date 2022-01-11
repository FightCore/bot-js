import { Character } from '../../models/character';

export class AliasRecord {
  name!: string;
  names!: string[];
  moves?: Map<string, string>;
  fightCoreId!: number;
  character?: Character;
}
