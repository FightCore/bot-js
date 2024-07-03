import { jaroWinkler } from 'jaro-winkler-typescript';
import { SearchResult } from '../models/search/search-result';
import { Character } from '../models/character';
import { Move } from '../models/move';
import { DistanceResult } from './models/distance-result';
import { MoveType } from '../models/move-type';
import { AliasRecord } from './models/alias-record';
import { AliasParser } from './alias-parser';
import { SearchResultType } from '../models/search/search-result-type';
import { MovesParser } from './moves-parser';
import { inject, injectable } from 'inversify';
import { Normalizer } from './normalizer';

@injectable()
export class Search {
  private readonly threshold = 0.8;
  private readonly aliases: AliasRecord[] = [];
  private readonly distanceConfiguration = {
    caseSensitive: false,
  };

  constructor(@inject(AliasParser) aliasParser: AliasParser) {
    this.aliases = aliasParser.aliases;
  }

  public search(query: string): SearchResult {
    // Split the query string into words to separate the character from the move.
    // For example, "marth fsmash" will be split into ["marth", "fsmash"].
    const keyWords = query.split(' ');

    if (keyWords.length === 0) {
      return new SearchResult(SearchResultType.NotFound);
    }

    const firstKeyWord = keyWords[0];
    if (jaroWinkler('help', firstKeyWord, this.distanceConfiguration) > this.threshold) {
      return new SearchResult(SearchResultType.Help);
    }

    const foundAlias = this.searchAlias(keyWords);

    // No character was found.
    // Going to look for the exact match in terms of name of the move.
    // Like Rest or Counter.
    if (!foundAlias || !foundAlias.record.character) {
      return this.searchForSingleMove(query) ?? new SearchResult(SearchResultType.NotFound);
    }

    if (foundAlias.remainder.length === 0) {
      return new SearchResult(SearchResultType.Character, foundAlias.record.character);
    }

    // Edge case:
    // The algorithm correctly assumes Young to be young link but doesn't remove the Link part.
    // Remove the link part manually ourselves to ensure searches work.
    if (foundAlias.record.character.normalizedName === 'younglink' && foundAlias.remainder.includes('link')) {
      foundAlias.remainder = foundAlias.remainder.replace('link', '');
    }

    // Character was found and the first word in the query was the name of the character.
    // We can shift out the first word and continue with just the move name.
    // For example, "marth fsmash" would be reduced to "fsmash".
    let foundMoves: DistanceResult[] = [];
    let moveQuery = foundAlias.remainder;
    const aliasQuery = MovesParser.search(moveQuery);

    if (aliasQuery) {
      moveQuery = aliasQuery;
    }

    if (jaroWinkler('moves', moveQuery, this.distanceConfiguration) > this.threshold) {
      return new SearchResult(SearchResultType.MoveList, foundAlias.record.character);
    }

    // If there are any moves within the alias, we should loop over them to check
    // for a match.
    // Alias for moves unofficial names like "shine" for Fox and Falco or "knee" for falcon.
    if (foundAlias.record.moves) {
      // Loop over the move aliases, these are structured as a Map<string, string>
      // The key being the alias, the value being the actual normalized name of the move.
      for (const [key, value] of foundAlias.record.moves) {
        // Check the distance between the key and the query
        const distance = jaroWinkler(key, moveQuery, this.distanceConfiguration);

        // If the distance is above the threshold, change the query to the normalized name.
        if (distance > this.threshold) {
          moveQuery = value;
        }
      }
    }

    for (const move of foundAlias.record.character.moves) {
      const distance = this.compareToMove(move, moveQuery);

      // If the distance is null, it is bellow the threshold.
      // That means it does not need to be considered any more.
      if (distance == null) {
        continue;
      }

      // The distance between the move and the query is perfect and we can return
      // it with full confidence.
      if (distance === 1) {
        return new SearchResult(SearchResultType.Move, foundAlias.record.character, move);
      }

      // Distance isn't perfect but above the threshold, so we can add it to the list.
      foundMoves.push({ move: move, distance: distance });
    }

    foundMoves.sort(this.sortDistanceResults);

    if (foundMoves.length === 0) {
      return new SearchResult(SearchResultType.MoveNotFound, foundAlias.record.character);
    }

    if (foundMoves.length == 2 && foundMoves[0].move.normalizedName === 'upb') {
      foundMoves = [foundMoves[0]];
    }

    return new SearchResult(
      SearchResultType.Move,
      // Sort the moves by distance and take the first item.
      // This is the item that is the closest to the query.
      foundAlias.record.character,
      foundMoves[0].move,
      // The possible moves are the moves that are close in distance to the query.
      // We show these to the user so they can choose the best one.
      // If there is only a single move found within the threshold.
      // We can simply put the array to undefined, a dropdown with 1 option isn't useful.
      foundMoves.length === 1 ? undefined : foundMoves.map((move) => move.move)
    );
  }

  public searchCharacter(keyWords: string[]): Character | undefined {
    const alias = this.searchAlias(keyWords);
    return alias?.record?.character;
  }

  public searchForCharacter(keyWords: string[]): Character[] {
    return this.searchTopAliases(keyWords).map((alias) => alias.character!);
  }

  private searchAlias(keyWords: string[]): { record: AliasRecord; remainder: string } | undefined {
    let characterName = '';
    let foundAlias: AliasRecord | undefined = undefined;
    let topDistance = 0;
    let lastIndex = 0;
    for (let index = 0; index < keyWords.length; index++) {
      const word = keyWords[index];
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
          lastIndex = index;
        }
      }

      // Character has been found and can be returned.

      // Add a space to the character name to prepare to add the next word.
      // For example, "captain falcon" first word is "captain" and the next word is "falcon".
      // We need the space else it would be "captainfalcon" and no result would be found.
      //characterName += ' ';
    }

    if (foundAlias != null) {
      return { record: foundAlias, remainder: keyWords.slice(lastIndex + 1).join(' ') };
    }

    return undefined;
  }

  private searchTopAliases(keyWords: string[]): AliasRecord[] {
    let characterName = '';
    const characters: { alias: AliasRecord; distance: number }[] = [];
    for (const word of keyWords) {
      characterName += word;
      for (const alias of this.aliases) {
        const distance = this.compareToCharacter(alias, characterName);

        // If the distance is undefined, nothing has been found and it can be skipped over.
        if (distance == undefined) {
          continue;
          // If the distance is greater than the top distance
          // save it as the new top distance.
        }

        characters.push({ alias, distance });
      }
    }

    if (characters.length > 0) {
      return characters
        .sort((a, b) => b.distance - a.distance)
        .slice(0, 5)
        .map((result) => result.alias);
    }

    return this.aliases.slice(0, 25);
  }

  private compareToMove(move: Move, query: string, doNormalizedName = true): number | undefined {
    const splitMove = move.name.split(' ');
    let highestDistance = 0;

    if (doNormalizedName) {
      highestDistance = jaroWinkler(move.normalizedName, query, this.distanceConfiguration);

      const normalizedQueryDistance = jaroWinkler(move.normalizedName, Normalizer.normalize(query), this.distanceConfiguration);

      if (normalizedQueryDistance > highestDistance) {
        highestDistance = normalizedQueryDistance;
      }
    }

    const nameDistance = jaroWinkler(move.name, query, this.distanceConfiguration);

    if (nameDistance > highestDistance) {
      highestDistance = nameDistance;
    }

    for (const section of splitMove) {
      const distance = jaroWinkler(section, query, this.distanceConfiguration);
      if (distance > highestDistance) {
        highestDistance = distance;
      }
    }

    let comparison = '';
    for (const section of splitMove) {
      comparison += section;
      const distance = jaroWinkler(comparison, query, this.distanceConfiguration);
      if (distance > highestDistance) {
        highestDistance = distance;
      }
    }

    if (highestDistance > this.threshold) {
      return highestDistance;
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
              return new SearchResult(SearchResultType.Move, character, move);
            })
        )
        // Find the first move that has a distance of 1 (direct reference).
        .find((move) => this.compareToMove(move.move, query, false) === 1)
    );
  }
}
