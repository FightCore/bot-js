import { Character } from '../character';
import { Move } from '../move';
import { SearchResultType } from './search-result-type';

export class SearchResult {
  public type: SearchResultType;

  public get character(): Character {
    if (this.type === SearchResultType.NotFound || !this._character) {
      throw new Error('Character not found');
    }

    return this._character;
  }

  public get move(): Move {
    if (!SearchResultType.Move || !this._move) {
      throw new Error('Move not found');
    }

    return this._move;
  }

  public get possibleMoves(): Move[] {
    if (!SearchResultType.Move) {
      throw new Error('Move not found');
    }

    return this._possibleMoves ?? [];
  }

  private _character?: Character;
  private _move?: Move;
  private _possibleMoves?: Move[];

  constructor(type: SearchResultType, character?: Character, move?: Move, possibleMoves?: Move[]) {
    this.type = type;
    this._character = character;
    this._move = move;
    this._possibleMoves = possibleMoves;
  }
}
