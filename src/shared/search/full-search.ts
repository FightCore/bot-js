import { injectable, multiInject } from 'inversify';
import { SearchStep } from './search-step.js';
import { Search } from '../data/search.js';
import { SearchResult } from './search-result.js';
import { Character } from '../models/character.js';
import { CleanMessage } from '../cleaning/clean-message.js';
import { IntermediateSearchResult } from './intermediate-search-result.js';
import { SearchResultType } from '../models/search/search-result-type.js';

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
    query = CleanMessage.execute(query);

    let intermediateResult: IntermediateSearchResult = {
      type: SearchResultType.None,
      remainder: query,
      isFinal: false,
    };

    for (const step of this.searchSteps) {
      const result = step.search(intermediateResult);
      if (result === null) {
        continue;
      }

      intermediateResult = result;

      if (result.isFinal) {
        // return {
        //   type: result.type,
        //   character: result.character!,
        //   move: result.move!,
        //   possibleMoves: result.possibleMoves!,
        // };

        switch (result.type) {
          case SearchResultType.Character:
            return {
              type: SearchResultType.Character,
              character: result.character!,
            };
          case SearchResultType.Move:
            return {
              type: SearchResultType.Move,
              character: result.character!,
              move: result.move!,
              possibleMoves: result.possibleMoves!,
            };
          case SearchResultType.MoveList:
            return {
              type: SearchResultType.MoveList,
              character: result.character!,
              possibleMoves: result.possibleMoves!,
            };
          case SearchResultType.MoveNotFound:
            return {
              type: SearchResultType.MoveNotFound,
              character: result.character!,
            };
          case SearchResultType.None:
          case SearchResultType.NotFound:
            return {
              type: SearchResultType.NotFound,
            };
          case SearchResultType.Help:
            return {
              type: SearchResultType.Help,
            };
          default:
            throw new Error(`Unknown search result type: ${result.type}`);
        }
      }
    }

    return {
      type: SearchResultType.NotFound,
    };
  }

  public searchCharacter(keyWords: string[]): Character | undefined {
    return this.oldSearch.searchCharacter(keyWords);
  }

  public searchForCharacter(keyWords: string[]): Character[] {
    return this.oldSearch.searchForCharacter(keyWords);
  }
}
