import { IntermediateSearchResult } from './intermediate-search-result.js';

export interface SearchStep {
  get order(): number;

  search(searchResult: IntermediateSearchResult): IntermediateSearchResult | null;
}
