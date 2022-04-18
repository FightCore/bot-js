import { Loader } from './loader';
import { jaroWinkler } from 'jaro-winkler-typescript';
import { SearchResult } from '../models/search/search-result';
import { Character } from '../models/character';
import { Move } from '../models/move';
import { DistanceResult } from './models/distance-result';
import { MoveType } from '../models/move-type';
import { AliasRecord } from './models/alias-record';
import { AliasParser } from './alias-parser';

export class Search {
  private readonly threshold = 0.8;
  private readonly aliases: AliasRecord[] = [];
  private readonly distanceConfiguration = {
    caseSensitive: false,
  };

  constructor(loader: Loader) {
    this.aliases = AliasParser.load(loader);
  }

  public search(query: string): SearchResult | undefined {
    // Split the query string into words to separate the character from the move.
    // For example, "marth fsmash" will be split into ["marth", "fsmash"].
    const keyWords = query.split(' ');
    const foundAlias = this.searchAlias(keyWords);

    // No character was found.
    // Going to look for the exact match in terms of name of the move.
    // Like Rest or Counter.
    if (!foundAlias || !foundAlias.character) {
      return this.searchForSingleMove(query);
    }

    // Character was found and the first word in the query was the name of the character.
    // We can shift out the first word and continue with just the move name.
    // For example, "marth fsmash" would be reduced to "fsmash".
    keyWords.shift();

    const foundMoves: DistanceResult[] = [];
    let moveQuery = keyWords.join(' ');

    // If there are any moves within the alias, we should loop over them to check
    // for a match.
    // Alias for moves unofficial names like "shine" for Fox and Falco or "knee" for falcon.
    if (foundAlias.moves) {
      // Loop over the move aliases, these are structured as a Map<string, string>
      // The key being the alias, the value being the actual normalized name of the move.
      for (const [key, value] of foundAlias.moves) {
        // Check the distance between the key and the query
        const distance = jaroWinkler(key, moveQuery, this.distanceConfiguration);

        // If the distance is above the threshold, change the query to the normalized name.
        if (distance > this.threshold) {
          moveQuery = value;
        }
      }
    }

    for (const move of foundAlias.character.moves) {
      const distance = this.compareToMove(move, moveQuery);

      // If the distance is null, it is bellow the threshold.
      // That means it does not need to be considered any more.
      if (distance == null) {
        continue;
      }

      // The distance between the move and the query is perfect and we can return
      // it with full confidence.
      if (distance === 1) {
        return { move: move, character: foundAlias.character };
      }

      // Distance isn't perfect but above the threshold, so we can add it to the list.
      foundMoves.push({ move: move, distance: distance });
    }

    foundMoves.sort(this.sortDistanceResults);

    if (foundMoves.length === 0) {
      return new SearchResult(foundAlias.character);
    }

    return {
      // Sort the moves by distance and take the first item.
      // This is the item that is the closest to the query.
      move: foundMoves[0].move,
      character: foundAlias.character,
      // The possible moves are the moves that are close in distance to the query.
      // We show these to the user so they can choose the best one.
      possibleMoves:
        // If there is only a single move found within the threshold.
        // We can simply put the array to undefined, a dropdown with 1 option isn't useful.
        foundMoves.length === 1 ? undefined : foundMoves.map((move) => move.move),
    };
  }

  public searchCharacter(keyWords: string[]): Character | undefined {
    const alias = this.searchAlias(keyWords);
    return alias?.character;
  }

  private searchAlias(keyWords: string[]): AliasRecord | undefined {
    let characterName = '';
    let foundAlias: AliasRecord | undefined = undefined;
    let topDistance = 0;
    for (const word of keyWords) {
      characterName += word;
      for (const alias of this.aliases) {
        const distance = this.compareToCharacter(alias, characterName);

        // If the distance is undefined, nothing has been found and it can be skipped over.
        if (distance == undefined) {
          continue;
          // If the distance is greater than the top distance
          // save it as the new top distance.
        } else if (distance > topDistance) {
          foundAlias = alias;
          topDistance = distance;
        }
      }

      // Character has been found and can be returned.
      if (foundAlias != null) {
        return foundAlias;
      }

      // Add a space to the character name to prepare to add the next word.
      // For example, "captain falcon" first word is "captain" and the next word is "falcon".
      // We need the space else it would be "captainfalcon" and no result would be found.
      characterName += ' ';
    }

    return foundAlias;
  }

  private compareToMove(move: Move, query: string, doNormalizedName = true): number | undefined {
    let distance = 0;
    if (doNormalizedName) {
      distance = jaroWinkler(move.normalizedName, query, this.distanceConfiguration);
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
   * @param alias the character to compare to.
   * @param query the query string to use to compare.
   * @returns either the distance or undefined.
   */
  private compareToCharacter(alias: AliasRecord, query: string): number | undefined {
    let topDistance = 0;

    for (const name of alias.names) {
      const distance = jaroWinkler(name, query, this.distanceConfiguration);

      if (distance > topDistance) {
        topDistance = distance;
      }
    }

    if (topDistance >= this.threshold) {
      return topDistance;
    }

    return undefined;
  }

  /**
   * Sorts the provided search results by distance.
   * @param resultA the first result to compare.
   * @param resultB the second result to compare.
   * @returns either -1, 0 or 1 depending on the sorting.
   */
  private sortDistanceResults(resultA: DistanceResult, resultB: DistanceResult): number {
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
      this.aliases
        // Filter out the null values and cast to a proper character.
        .filter((alias) => alias.character != null)
        .map((alias) => alias.character as Character)
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
