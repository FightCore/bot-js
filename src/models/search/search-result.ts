import { Character } from '../character';
import { Move } from '../move';

export class SearchResult {
  public character: Character;
  public move: Move;
  public possibleMoves?: Move[];

  constructor(character: Character, move: Move, possibleMoves?: Move[]) {
    this.character = character;
    this.move = move;
    this.possibleMoves = possibleMoves;
  }
}
