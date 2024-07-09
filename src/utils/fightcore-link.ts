import { Character } from '../models/character';
import { Move } from '../models/move';

export function getMoveLink(character: Character, move: Move): string {
  return `https://fightcore.gg/characters/${character.fightCoreId}/${character.normalizedName}/moves/${move.id}/${move.normalizedName}?referer=fightcore_bot`;
}
