import { Loader } from './loader';
import { jaroWinkler } from 'jaro-winkler-typescript';
import { SearchResult } from '../models/search/search-result';
import { Character } from '../models/character';
import { Move } from '../models/move';
import { DistanceResult } from './models/distance-result';
import { MoveType } from '../models/move-type';

export class Search {
  private readonly characters: Character[];
  private readonly threshold = 0.8;

  constructor(loader: Loader) {
    this.characters = loader.data;
  }

  public search(query: string): SearchResult | undefined {
    // Split the query string into words to separate the character from the move.
    // For example, "marth fsmash" will be split into ["marth", "fsmash"].
    const keyWords = query.split(' ');
    const foundCharacter = this.searchCharacter(keyWords);

    // No character was found.
    // Going to look for the exact match in terms of name of the move.
    // Like Rest or Counter.
    if (!foundCharacter) {
      return this.searchForSingleMove(query);
    }

    // Character was found and the first word in the query was the name of the character.
    // We can shift out the first word and continue with just the move name.
    // For example, "marth fsmash" would be reduced to "fsmash".
    keyWords.shift();

    const foundMoves: DistanceResult[] = [];
    for (const move of foundCharacter.moves) {
      const distance = this.compareToMove(move, keyWords.join(' '));

      // If the distance is null, it is bellow the threshold.
      // That means it does not need to be considered any more.
      if (distance == null) {
        continue;
      }

      // The distance between the move and the query is perfect and we can return
      // it with full confidence.
      if (distance === 1) {
        return { move: move, character: foundCharacter };
      }

      // Distance isn't perfect but above the threshold, so we can add it to the list.
      foundMoves.push({ move: move, distance: distance });
    }

    foundMoves.sort(this.sortDistanceResults);

    if (foundMoves.length === 0) {
      return undefined;
    }

    return {
      // Sort the moves by distance and take the first item.
      // This is the item that is the closest to the query.
      move: foundMoves[0].move,
      character: foundCharacter,
      // The possible moves are the moves that are close in distance to the query.
      // We show these to the user so they can choose the best one.
      possibleMoves:
        // If there is only a single move found within the threshold.
        // We can simply put the array to undefined, a dropdown with 1 option isn't useful.
        foundMoves.length === 1
          ? undefined
          : foundMoves.map((move) => move.move),
    };
  }

  public searchCharacter(keyWords: string[]): Character | undefined {
    let characterName = '';
    let foundCharacter: Character | undefined = undefined;
    let topDistance = 0;
    for (const word of keyWords) {
      characterName += word;
      for (const character of this.characters) {
        const distance = this.compareToCharacter(character, characterName);

        if (distance == undefined) {
          continue;
        } else if (distance > topDistance) {
          foundCharacter = character;
          topDistance = distance;
        }
      }

      // Character has been found and can be returned.
      if (foundCharacter != null) {
        return foundCharacter;
      }

      characterName += ' ';
    }

    return foundCharacter;
  }

  private compareToMove(
    move: Move,
    query: string,
    doNormalizedName = true
  ): number | undefined {
    let distance = 0;
    if (doNormalizedName) {
      distance = jaroWinkler(move.normalizedName, query, {
        caseSensitive: false,
      });
    }

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

  /**
   * Compares the provided query against the provided character.
   * Gives back the distance if it is above the threshold, otherwise undefined.
   * @param character the character to compare to.
   * @param query the query string to use to compare.
   * @returns either the distance or undefined.
   */
  private compareToCharacter(
    character: Character,
    query: string
  ): number | undefined {
    const normalizedNameDistance = jaroWinkler(
      character.normalizedName,
      query,
      {
        caseSensitive: false,
      }
    );
    const nameDistance = jaroWinkler(character.name, query, {
      caseSensitive: false,
    });

    if (
      normalizedNameDistance > nameDistance &&
      this.threshold < normalizedNameDistance
    ) {
      return normalizedNameDistance;
    } else if (this.threshold < nameDistance) {
      return nameDistance;
    }

    return undefined;
  }

  /**
   * Sorts the provided search results by distance.
   * @param resultA the first result to compare.
   * @param resultB the second result to compare.
   * @returns either -1, 0 or 1 depending on the sorting.
   */
  private sortDistanceResults(
    resultA: DistanceResult,
    resultB: DistanceResult
  ): number {
    return resultB.distance - resultA.distance;
  }

  /**
   * Searches for a single move based on the provided query.
   * The name match has to be exact with the name of a special move.
   * @param query the query to search for.
   * @returns either a search result or undefined.
   */
  private searchForSingleMove(query: string): SearchResult | undefined {
    return (
      this.characters
        // FlatMap all characters and moves to be within the same entry.
        .flatMap((character) =>
          character.moves
            // Apply the filter that only special moves will be searched for.
            // These are the only moves that contain special names.
            .filter((move) => move.type === MoveType.special)
            .map((move) => {
              return {
                move: move,
                character: character,
              };
            })
        )
        // Find the first move that has a distance of 1 (direct reference).
        .find((move) => this.compareToMove(move.move, query, false) === 1)
    );
  }
}
