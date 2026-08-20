import { inject, injectable } from 'inversify';
import { SearchStep } from '../search-step.js';
import { IntermediateSearchResult } from '../intermediate-search-result.js';
import { AliasParser } from '../../data/alias-parser.js';
import { AliasRecord } from '../../data/models/alias-record.js';
import { jaroWinkler } from 'jaro-winkler-typescript';
import { SearchResultType } from '../../models/search/search-result-type.js';
import { SearchStepOrder } from '../search-step-order.js';

@injectable()
export class CharacterSearchStep implements SearchStep {
  private readonly aliases: AliasRecord[];

  private readonly threshold = 0.8;
  private readonly distanceConfiguration = {
    caseSensitive: false,
  };

  constructor(@inject(AliasParser) aliasParser: AliasParser) {
    this.aliases = aliasParser.aliases;
  }

  public get order(): number {
    return SearchStepOrder.Character;
  }

  search(searchResult: IntermediateSearchResult): IntermediateSearchResult | null {
    const keyWords = searchResult.remainder.split(' ').filter((word) => word.trim() !== '');
    const aliasSearchResult = this.searchAlias(keyWords);

    if (aliasSearchResult?.record.character) {
      // Edge case:
      // The algorithm correctly assumes Young to be young link but doesn't remove the Link part.
      // Remove the link part manually ourselves to ensure searches work.
      if (aliasSearchResult.record.character.normalizedName === 'younglink' && aliasSearchResult.remainder.includes('link')) {
        aliasSearchResult.remainder = aliasSearchResult.remainder.replace('link', '');
      }

      return {
        type: SearchResultType.Character,
        character: aliasSearchResult.record.character,
        remainder: aliasSearchResult.remainder,
        isFinal: aliasSearchResult.remainder.trim() === '',
      };
    }

    return null;
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
}
