import { Character } from '../character';
import { Move } from '../move';

export class SearchResult {
  public character: Character;
  public move?: Move;
  public possibleMoves?: Move[];
  public noMovesFound: boolean;

  constructor(character: Character, move?: Move, possibleMoves?: Move[], noMovesFound?: boolean) {
    this.character = character;
    this.move = move;
    this.possibleMoves = possibleMoves;
    this.noMovesFound = noMovesFound ?? move == null;
  }
}
