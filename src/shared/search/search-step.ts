import { IntermediateSearchResult } from './intermediate-search-result.js';

export interface SearchStep {
  get order(): number;

  search(query: string): IntermediateSearchResult | null;
}
