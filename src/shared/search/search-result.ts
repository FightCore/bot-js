import { Character } from '../models/character.js';
import { Move } from '../models/move.js';
import { SearchResultType } from '../models/search/search-result-type.js';

export interface MoveSearchResult {
  type: SearchResultType.Move;
  character: Character;
  move: Move;
  possibleMoves: Move[];
}

export interface CharacterSearchResult {
  type: SearchResultType.Character;
  character: Character;
}

export interface MoveListSearchResult {
  type: SearchResultType.MoveList;
  character: Character;
  possibleMoves: Move[];
}

export interface NotFoundSearchResult {
  type: SearchResultType.NotFound | SearchResultType.None;
}

export interface MoveNotFoundSearchResult {
  type: SearchResultType.MoveNotFound;
  character: Character;
}

export interface HelpSearchResult {
  type: SearchResultType.Help;
}

export type SearchResult =
  | CharacterSearchResult
  | MoveSearchResult
  | MoveListSearchResult
  | MoveNotFoundSearchResult
  | NotFoundSearchResult
  | HelpSearchResult;
