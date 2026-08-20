import { inject, injectable } from 'inversify';
import { SearchStep } from '../search-step.js';
import { IntermediateSearchResult } from '../intermediate-search-result.js';
import { AliasParser } from '../../data/alias-parser.js';
import { AliasRecord } from '../../data/models/alias-record.js';
import assert from 'node:assert';
import { jaroWinkler } from 'jaro-winkler-typescript';
import { SearchResultType } from '../../models/search/search-result-type.js';
import { DistanceResult } from '../../data/models/distance-result.js';
import { Move } from '../../models/move.js';
import { Normalizer } from '../../data/normalizer.js';
import { Character } from '../../models/character.js';
import { MovesParser } from '../../data/moves-parser.js';

@injectable()
export class FindMoveSearchStep implements SearchStep {
  private readonly aliases: AliasRecord[];

  private readonly threshold = 0.8;
  private readonly distanceConfiguration = {
    caseSensitive: false,
  };

  constructor(@inject(AliasParser) aliasParser: AliasParser) {
    this.aliases = aliasParser.aliases;
  }

  get order(): number {
    return 7;
  }

  search(searchResult: IntermediateSearchResult): IntermediateSearchResult | null {
    if (!searchResult.character || searchResult.remainder.trim().length == 0) {
      return null;
    }

    const alias = this.aliases.find((alias) => alias.character?.normalizedName === searchResult.character?.normalizedName);
    if (!alias) {
      assert(false, `Alias not found for character ${searchResult.character?.normalizedName}`);
    }

    let query = searchResult.remainder.trim().toLowerCase();
    query = this.findMoveInAlias(alias, query);

    return this.findMoveInCharacter(searchResult.character, query);
  }

  private findMoveInAlias(alias: AliasRecord, query: string): string {
    query = MovesParser.search(query);
    for (const [key, value] of alias.moves ?? []) {
      // Check the distance between the key and the query
      const distance = jaroWinkler(key, query, this.distanceConfiguration);

      // If the distance is above the threshold, change the query to the normalized name.
      if (distance > this.threshold) {
        query = value;
      }
    }

    return query;
  }

  private findMoveInCharacter(character: Character, query: string): IntermediateSearchResult | null {
    let foundMoves: DistanceResult[] = [];
    for (const move of character.moves) {
      const distance = this.compareToMove(move, query);

      // If the distance is null, it is bellow the threshold.
      // That means it does not need to be considered any more.
      if (distance == null) {
        continue;
      }

      // The distance between the move and the query is perfect and we can return
      // it with full confidence.
      if (distance === 1) {
        return { type: SearchResultType.Move, character: character, move: move, possibleMoves: [], remainder: '', isFinal: true };
      }

      // Distance isn't perfect but above the threshold, so we can add it to the list.
      foundMoves.push({ move: move, distance: distance });
    }

    foundMoves.sort(this.sortDistanceResults);

    if (foundMoves.length === 0) {
      return { type: SearchResultType.MoveNotFound, character: character, possibleMoves: [], remainder: '', isFinal: true };
    }

    if (foundMoves.length == 2 && foundMoves[0].move.normalizedName === 'upb') {
      foundMoves = [foundMoves[0]];
    }

    return {
      type: SearchResultType.Move,
      character: character,
      move: foundMoves[0].move,
      possibleMoves: foundMoves.length === 1 ? [] : foundMoves.map((move) => move.move),
      remainder: '',
      isFinal: true,
    };

    // return new SearchResult(
    //   SearchResultType.Move,
    //   // Sort the moves by distance and take the first item.
    //   // This is the item that is the closest to the query.
    //   foundAlias.record.character,
    //   foundMoves[0].move,
    //   // The possible moves are the moves that are close in distance to the query.
    //   // We show these to the user so they can choose the best one.
    //   // If there is only a single move found within the threshold.
    //   // We can simply put the array to undefined, a dropdown with 1 option isn't useful.
    //   foundMoves.length === 1 ? undefined : foundMoves.map((move) => move.move)
    // );
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
   * Sorts the provided search results by distance.
   * @param resultA the first result to compare.
   * @param resultB the second result to compare.
   * @returns either -1, 0 or 1 depending on the sorting.
   */
  private sortDistanceResults(resultA: DistanceResult, resultB: DistanceResult): number {
    return resultB.distance - resultA.distance;
  }
}
