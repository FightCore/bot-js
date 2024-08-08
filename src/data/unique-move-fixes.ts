import { Character } from '../models/character';
import { Move } from '../models/move';

/**
 * Fixes unique moves by modifying the provided move object.
 *
 * @param {Move} move - The move object to be fixed.
 * @return {Move} The modified move object.
 */
export function fixUniqueMoves(move: Move, character: Character): Move {
  if ((move.normalizedName === 'neutralb' || move.normalizedName === 'aneutralb') && character.normalizedName === 'ness') {
    return fixNessNeutralB(move);
  }
  if (move.normalizedName == 'nessspecial' && character.normalizedName === 'kirby') {
    return fixNessNeutralB(move);
  }

  return move;
}

function fixNessNeutralB(move: Move): Move {
  move.hits = move.hits.slice(move.hits.length - 1);

  // Add notes if they don't exist previously and ensure they start on a new line.
  if (!move.notes) {
    move.notes = '';
  } else {
    move.notes += '\n';
  }
  move.notes +=
    'Damage starts as 11 but increases every frame by 1. Only the last hitbox is shown. Please check the website for more info.';
  return move;
}
