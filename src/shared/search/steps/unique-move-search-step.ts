import { inject, injectable } from 'inversify';
import { AliasParser } from '../../data/alias-parser.js';
import { IntermediateSearchResult } from '../intermediate-search-result.js';
import { SearchStep } from '../search-step.js';
import { Symbols } from '../../config/symbols.js';
import { Logger } from 'winston';
import { SearchResultType } from '../../models/search/search-result-type.js';
import assert from 'node:assert';
import { SearchStepOrder } from '../search-step-order.js';

@injectable()
export class UniqueMoveSearchStep implements SearchStep {
  private readonly uniqueMoves = [{ query: 'shine', moveId: 1284 }];

  public get order(): number {
    return SearchStepOrder.UniqueMove;
  }

  constructor(
    @inject(AliasParser) private readonly aliasParser: AliasParser,
    @inject(Symbols.Logger) private readonly logger: Logger
  ) {}

  search(searchResult: IntermediateSearchResult): IntermediateSearchResult | null {
    const query = searchResult.remainder.trim().toLowerCase();
    const uniqueMove = this.uniqueMoves.find((move) => move.query === query);
    if (!uniqueMove) {
      return null;
    }

    const alias = this.aliasParser.aliases.find((alias) => alias.character?.moves?.some((m) => m.id === uniqueMove.moveId));
    if (!alias) {
      return null;
    }

    const move = alias.character!.moves.find((move) => move.id === uniqueMove.moveId);
    if (!move) {
      // Move was found in the alias, but not in the character's moves.
      assert(false, `Move with ID ${uniqueMove.moveId} not found for character ${alias.character!.name}`);
      return null;
    }

    this.logger.debug(
      `UniqueMoveSearch found alias for query "${searchResult.remainder}": ${alias.character?.name} ${move.name}`
    );

    return {
      type: SearchResultType.Move,
      character: alias.character,
      move: move,
      remainder: '',
      isFinal: true,
    };
  }
}
