import { injectable } from 'inversify';
import { IntermediateSearchResult } from '../intermediate-search-result.js';
import { SearchResultType } from '../../models/search/search-result-type.js';
import { SearchStep } from '../search-step.js';
import { SearchStepOrder } from '../search-step-order.js';

@injectable()
export class HelpSearchStep implements SearchStep {
  public get order(): number {
    return SearchStepOrder.Help;
  }

  search(searchResult: IntermediateSearchResult): IntermediateSearchResult | null {
    const query = searchResult.remainder.toLowerCase().trim();
    if (query === 'help') {
      return {
        type: SearchResultType.Help,
        remainder: '',
        isFinal: true,
      };
    }

    return null;
  }
}
