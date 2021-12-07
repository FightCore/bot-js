import { Character } from '../models/character';
import { Move } from '../models/move';
import { Loader } from './loader';

export class Search {
  private readonly loader: Loader;

  constructor(loader: Loader) {
    this.loader = loader;
  }

  public search(
    query: string
  ): { character: Character; move: Move } | undefined {
    const characters = this.loader.data;

    const keyWords = query.split(' ');
    const foundCharacter = characters.find(
      (character) => character.normalizedName == keyWords[0]
    );

    if (!foundCharacter) {
      return undefined;
    }

    const foundMove = foundCharacter.moves.find(
      (move) => move.normalizedName == keyWords[1]
    );

    if (!foundMove) {
      return undefined;
    }

    return { move: foundMove, character: foundCharacter };
  }
}
