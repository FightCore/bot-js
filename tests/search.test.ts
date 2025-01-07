import 'reflect-metadata';
import winston from 'winston';
import { Loader } from '../src/data/loader';
import { Search } from '../src/data/search';
import { AliasParser } from '../src/data/alias-parser';
import { expect, test } from '@jest/globals';
import { SearchResultType } from '../src/models/search/search-result-type';
import { describe } from 'node:test';

test('Ensure search works with characters', async () => {
  const search = await setupSearch();
  const marth = search.searchCharacter(['Marth']);
  expect(marth).toBeDefined();
  expect(marth!.name).toBe('Marth');
  expect(marth!.normalizedName).toBe('marth');
});

test('Ensure search works with an alias', async () => {
  const search = await setupSearch();
  const marth = search.searchCharacter(['Puff']);
  expect(marth).toBeDefined();
  expect(marth!.name).toBe('Jigglypuff');
  expect(marth!.normalizedName).toBe('jigglypuff');
});

test('Ensure move search works for a basic move', async () => {
  const search = await setupSearch();
  const move = search.search('marth fsmash');
  expect(move).toBeDefined();
  expect(move.type).toBe(SearchResultType.Move);
  expect(move.move.name).toBe('Forward Smash');
  expect(move.character.name).toBe('Marth');
});

describe('Ensure move search works with different cases', () => {
  const cases = [
    ['Marth usmash', 'Marth', 'Up Smash'],
    ['fox shine', 'Fox', 'Reflector'],
    ['shine', 'Fox', 'Reflector'],
    ['falcon knee', 'Captain Falcon', 'Forward Air'],
    ['gnw hammer', 'Mr. Game & Watch', 'Judgement'],
    ['rest', 'Jigglypuff', 'Rest'],
  ];

  test.each(cases)('Ensure move search works for %s', async (query: string, expectedCharacter: string, expectedMove: string) => {
    const search = await setupSearch();
    const move = search.search(query);
    expect(move).toBeDefined();
    expect(move.type).toBe(SearchResultType.Move);
    expect(move.move.name).toBe(expectedMove);
    expect(move.character.name).toBe(expectedCharacter);
  });
});

async function setupSearch(): Promise<Search> {
  // Create a silent unit test logger.
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        // Set the level to silent to prevent any output
        level: 'silent',
      }),
    ],
  });

  const loader = new Loader(logger);
  await loader.ensureLoaded();
  const aliasParser = new AliasParser(loader);
  return new Search(aliasParser);
}
