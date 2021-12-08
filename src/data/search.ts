import { Loader } from './loader';
import { jaroWinkler } from 'jaro-winkler-typescript';
import { SearchResult } from '../models/search/search-result';
import { Character } from '../models/character';
import { Move } from '../models/move';

export class Search {
  private readonly loader: Loader;
  private readonly threshold = 0.8;

  constructor(loader: Loader) {
    this.loader = loader;
  }

  public search(query: string): SearchResult | undefined {
    const characters = this.loader.data;

    const keyWords = query.split(' ');
    let characterName = '';
    let foundCharacter: Character | undefined = undefined;
    let topDistance = 0;
    for (const word of keyWords) {
      characterName += word;
      for (const character of characters) {
        let distance = jaroWinkler(character.normalizedName, characterName, {
          caseSensitive: false,
        });

        if (distance >= 0.9 && distance > topDistance) {
          foundCharacter = character;
          topDistance = distance;
        }

        distance = jaroWinkler(character.name, characterName, {
          caseSensitive: false,
        });

        if (distance >= 0.9 && distance > topDistance) {
          foundCharacter = character;
          topDistance = distance;
        }
      }

      if (foundCharacter != null) {
        break;
      }
      characterName += ' ';
    }

    if (!foundCharacter) {
      for (const character of characters) {
        for (const move of character.moves.filter(
          (storedMove) => storedMove.type === 4
        )) {
          const nameDistance = jaroWinkler(move.name, keyWords.join(' '), {
            caseSensitive: false,
          });

          // This is 100% the correct move so we can return.
          if (nameDistance === 1) {
            return { move: move, character: character };
          }
        }
      }

      return undefined;
    }

    const foundMoves = [];
    const threshold = 0.8;
    keyWords.shift();
    for (const move of foundCharacter.moves) {
      const distance = this.compareToMove(move, keyWords.join(' '));

      // If the distance is null, it is bellow the threshold.
      // That means it does not need to be considered anymore
      if (distance == null) {
        continue;
      }
    }

    return {
      move: foundMoves.sort((a, b) => b.distance - a.distance)[0].move,
      character: foundCharacter,
      possibleMoves:
        foundMoves.length === 1
          ? undefined
          : foundMoves.map((move) => move.move),
    };
  }

  private compareToMove(move: Move, query: string): number | undefined {
    const distance = jaroWinkler(move.normalizedName, query, {
      caseSensitive: false,
    });

    const nameDistance = jaroWinkler(move.name, query, {
      caseSensitive: false,
    });

    if (distance > nameDistance && this.threshold < distance) {
      return distance;
    } else if (this.threshold < nameDistance) {
      return nameDistance;
    }

    return undefined;
  }
}
