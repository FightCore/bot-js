import { injectable, multiInject } from 'inversify';
import { SearchStep } from './search-step.js';
import { Search } from '../data/search.js';
import { SearchResult } from './search-result.js';
import { Character } from '../models/character.js';

@injectable()
export class FullSearch {
  private readonly searchSteps: SearchStep[];

  constructor(
    @multiInject('SearchSteps') searchSteps: SearchStep[],
    private readonly oldSearch: Search
  ) {
    this.searchSteps = searchSteps.sort((a, b) => a.order - b.order);
  }

  public search(query: string): SearchResult {
    for (const step of this.searchSteps) {
      const result = step.search(query);
      if (result) {
        return {
          type: result.type,
          character: result.character!,
          move: result.move!,
          possibleMoves: result.possibleMoves!,
        };
      }
    }

    return this.oldSearch.search(query);
  }

  public searchCharacter(keyWords: string[]): Character | undefined {
    return this.oldSearch.searchCharacter(keyWords);
  }

  public searchForCharacter(keyWords: string[]): Character[] {
    return this.oldSearch.searchForCharacter(keyWords);
  }
}
