import { injectable } from 'inversify';
import { SearchStep } from '../search-step.js';
import { IntermediateSearchResult } from '../intermediate-search-result.js';
import { SearchResultType } from '../../models/search/search-result-type.js';
import { SearchStepOrder } from '../search-step-order.js';

@injectable()
export class MoveListSearchStep implements SearchStep {
  get order(): number {
    return SearchStepOrder.MoveList;
  }
  search(searchResult: IntermediateSearchResult): IntermediateSearchResult | null {
    if (!searchResult.character || searchResult.remainder.trim().length == 0) {
      return null;
    }

    if (searchResult.remainder === 'moves') {
      return {
        type: SearchResultType.MoveList,
        character: searchResult.character,
        possibleMoves: [],
        remainder: '',
        isFinal: true,
      };
    }

    return null;
  }
}
