import { inject, injectable } from 'inversify';
import { SearchStep } from '../search-step.js';
import { IntermediateSearchResult } from '../intermediate-search-result.js';
import { AliasParser } from '../../data/alias-parser.js';
import { AliasRecord } from '../../data/models/alias-record.js';
import { MovesParser } from '../../data/moves-parser.js';
import { jaroWinkler } from 'jaro-winkler-typescript';
import { SearchResultType } from '../../models/search/search-result-type.js';
import { Character } from '../../models/character.js';
import { MoveType } from '../../models/move-type.js';
import { Move } from '../../models/move.js';
import { Normalizer } from '../../data/normalizer.js';
import { SearchStepOrder } from '../search-step-order.js';

@injectable()
export class SingleMoveSearchStep implements SearchStep {
  private readonly aliases: AliasRecord[];

  private readonly threshold = 0.8;
  private readonly distanceConfiguration = {
    caseSensitive: false,
  };

  constructor(@inject(AliasParser) aliasParser: AliasParser) {
    this.aliases = aliasParser.aliases;
  }

  get order(): number {
    return SearchStepOrder.SingleMove;
  }

  search(searchResult: IntermediateSearchResult): IntermediateSearchResult | null {
    // If the character is defined within the context, this step is not applicable.
    if (!searchResult.character) {
      return null;
    }

    const query = searchResult.remainder.trim().toLowerCase();
    const aliasQuery = MovesParser.search(query);

    for (const alias of this.aliases) {
      // If the alias is not a character, skip it.
      if (!alias.character) {
        continue;
      }

      // Override alias names with the correct move name if there is only one.
      for (const keyValuePair of alias.moves ?? []) {
        // Only go for exact matches.
        if (jaroWinkler(keyValuePair[0], aliasQuery, this.distanceConfiguration) == 1) {
          // If the alias is a move, we need to find the move and character.
          const move = alias.character.moves.find((move) => move.normalizedName === keyValuePair[1]);
          if (move) {
            return {
              type: SearchResultType.Move,
              character: alias.character,
              move: move,
              possibleMoves: [],
              remainder: '',
              isFinal: true,
            };
          }
        }
      }
    }

    const matchingMoves = this.aliases
      // Filter out the null values and cast to a proper character.
      .filter((alias) => alias.character != null)
      .map((alias) => alias.character as Character)
      // FlatMap all characters and moves to be within the same entry.
      .flatMap((character) =>
        character.moves
          // Apply the filter that only special moves will be searched for.
          // These are the only moves that contain special names.
          .map((move) => {
            return {
              type: SearchResultType.Move,
              character: character,
              move: move,
              possibleMoves: [],
              remainder: '',
              isFinal: true,
            };
          })
      )
      // Find the first move that has a distance of 1 (direct reference).
      .filter((move) => this.compareToMove(move.move, aliasQuery, false) === 1);

    if (matchingMoves.length === 1) {
      return matchingMoves[0];
    }

    // If there are two moves, we need to check if one of them is a special move
    // and the other one is a move that starts with 'a'. This indicates that the first move is the move and the other is the aerial version of it.
    if (matchingMoves.length == 2) {
      if (matchingMoves[0].move.type === MoveType.special && matchingMoves[1].move.normalizedName.startsWith('a')) {
        return matchingMoves[0];
      }
    }

    return null;
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
}
