import { Character } from '../models/character.js';
import { Move } from '../models/move.js';
import { SearchResultType } from '../models/search/search-result-type.js';

export interface IntermediateSearchResult {
  type: SearchResultType;
  character?: Character;
  move?: Move;
  possibleMoves?: Move[];
  remainder: string;
}
