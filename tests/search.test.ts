import 'reflect-metadata';
import winston from 'winston';
import { Loader } from '../src/shared/data/loader.js';
import { Search } from '../src/shared/data/search.js';
import { AliasParser } from '../src/shared/data/alias-parser.js';
import { describe, expect, test } from 'vitest';
import { SearchResultType } from '../src/shared/models/search/search-result-type.js';

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

describe('Ensure character aliases resolve to the correct character', () => {
  const cases: [string, string][] = [
    ['koopa', 'Bowser'],
    ['cptfalcon', 'Captain Falcon'],
    ['dk', 'Donkey Kong'],
    ['doc', 'Dr. Mario'],
    ['ganon', 'Ganondorf'],
    ['icies', 'Ice Climbers'],
    ['shiek', 'Sheik'],
    ['ylink', 'Young Link'],
    ['mew2', 'Mewtwo'],
    ['gnw', 'Mr. Game & Watch'],
  ];

  test.each(cases)('Ensure alias "%s" resolves to %s', async (alias, expectedName) => {
    const search = await setupSearch();
    const character = search.searchCharacter([alias]);
    expect(character).toBeDefined();
    expect(character!.name).toBe(expectedName);
  });
});

describe('Ensure character-specific move aliases resolve to the correct move', () => {
  const cases = [
    ['falcon knee', 'Captain Falcon', 'Forward Air'],
    ['falcon stomp', 'Captain Falcon', 'Down Air'],
    ['falcon punch', 'Captain Falcon', 'Falcon Punch'],
    ['donkeykong punch', 'Donkey Kong', 'Giant Punch'],
    ['donkeykong superpunch', 'Donkey Kong', 'Giant Punch'],
    ['donkeykong megapunch', 'Donkey Kong', 'Giant Punch'],
    ['donkeykong ultrapunch', 'Donkey Kong', 'Giant Punch'],
    ['drmario pill', 'Dr. Mario', 'Megavitamins'],
    ['drmario cape', 'Dr. Mario', 'Super Sheet'],
    ['falco laser', 'Falco', 'Blaster'],
    ['falco shine', 'Falco', 'Reflector'],
    ['falco aerialblaster', 'Falco', 'Blaster (Air)'],
    ['falco aeriallaser', 'Falco', 'Blaster (Air)'],
    ['falco drill', 'Falco', 'Down Air'],
    ['falco illusion', 'Falco', 'Falco Phantasm'],
    ['fox shine', 'Fox', 'Reflector'],
    ['fox laser', 'Fox', 'Blaster'],
    ['fox aerialblaster', 'Fox', 'Blaster (Air)'],
    ['fox aeriallaser', 'Fox', 'Blaster (Air)'],
    ['fox drill', 'Fox', 'Down Air'],
    ['fox phantasm', 'Fox', 'Fox Illusion'],
    ['ganondorf stomp', 'Ganondorf', 'Down Air'],
    ['jigglypuff drill', 'Jigglypuff', 'Down Air'],
    ['kirby suck', 'Kirby', 'Swallow'],
    ['kirby succ', 'Kirby', 'Swallow'],
    ['kirby inhale', 'Kirby', 'Swallow'],
    ['kirby swallow', 'Kirby', 'Swallow'],
    ['kirby copy', 'Kirby', 'Swallow'],
    ['kirby absorb', 'Kirby', 'Swallow'],
    ['kirby ingest', 'Kirby', 'Swallow'],
    ['link tether', 'Link', 'Hookshot'],
    ['link arrow', 'Link', 'Bow'],
    ['link boomerang', 'Link', 'Boomerang'],
    ['link bomb', 'Link', 'Bomb'],
    ['mrgame&watch hammer', 'Mr. Game & Watch', 'Judgement'],
    ['pichu jolt', 'Pichu', 'Thunder Jolt'],
    ['pichu lightning', 'Pichu', 'Thunder'],
    ['pikachu jolt', 'Pikachu', 'Thunder Jolt'],
    ['pikachu lightning', 'Pikachu', 'Thunder'],
    ['princesspeach turnip', 'Peach', 'Vegetable'],
    ['roy parry', 'Roy', 'Counter'],
    ['samus rocket', 'Samus', 'Homing Missle'],
    ['samus tether', 'Samus', 'Air Grapple'],
    ['sheik boostgrab', 'Sheik', 'Dashgrab'],
    ['younglink hookshot', 'Young Link', 'Tether'],
    ['younglink arrow', 'Young Link', 'Fire Bow'],
    ['younglink boomerang', 'Young Link', 'Boomerang'],
    ['younglink bomb', 'Young Link', 'Bomb'],
  ];

  test.each(cases)('Ensure "%s" resolves to %s / %s', async (query, expectedCharacter, expectedMove) => {
    const search = await setupSearch();
    const move = search.search(query);
    expect(move).toBeDefined();
    expect(move.type).toBe(SearchResultType.Move);
    expect(move.character.name).toBe(expectedCharacter);
    expect(move.move.name).toBe(expectedMove);
  });
});

describe('Ensure global move aliases resolve consistently across characters', () => {
  const cases = [
    ['fox b', 'Fox', 'Blaster'],
    ['marth b', 'Marth', 'Shield Breaker'],
    ['fox tech', 'Fox', 'Tech-Neutral'],
    ['marth tech', 'Marth', 'Tech-Neutral'],
    ['fox techin', 'Fox', 'Tech-Roll Forward'],
    ['marth techin', 'Marth', 'Tech-Roll Forward'],
    ['fox techout', 'Fox', 'Tech-Roll Backward'],
    ['marth techout', 'Marth', 'Tech-Roll Backward'],
    ['fox sidesmash', 'Fox', 'Forward Smash'],
    ['marth sidesmash', 'Marth', 'Forward Smash'],
    ['fox sidespecial', 'Fox', 'Fox Illusion'],
    ['marth sidespecial', 'Marth', 'Sword Dance (1, Side)'],
    ['fox downspecial', 'Fox', 'Reflector'],
    ['marth downspecial', 'Marth', 'Counter'],
    ['fox upspecial', 'Fox', 'Fire Fox'],
    ['marth upspecial', 'Marth', 'Dolphin Slash'],
    ['fox aerialneutralspecial', 'Fox', 'Blaster (Air)'],
    ['marth aerialneutralspecial', 'Marth', 'Shield Breaker'],
    ['fox aerialsidespecial', 'Fox', 'Fox Illusion (Air)'],
    ['marth aerialsidespecial', 'Marth', 'Sword Dance (1, Side) (Air)'],
    ['fox aerialupspecial', 'Fox', 'Fire Fox (Air)'],
    ['marth aerialupspecial', 'Marth', 'Dolphin Slash (Air)'],
    ['fox shieldgrab', 'Fox', 'Grab'],
    ['marth shieldgrab', 'Marth', 'Grab'],
    ['fox froll', 'Fox', 'Roll forwards'],
    ['marth froll', 'Marth', 'Roll forwards'],
    ['fox broll', 'Fox', 'Roll backwards'],
    ['marth broll', 'Marth', 'Roll backwards'],
    ['fox stomp', 'Fox', 'Down Air'],
    ['marth stomp', 'Marth', 'Down Air'],
    ['fox runninggrab', 'Fox', 'Dashgrab'],
    ['marth runninggrab', 'Marth', 'Dashgrab'],
    ['fox getupback', 'Fox', 'Getup-Attack (Back)'],
    ['marth getupback', 'Marth', 'Getup-Attack (Back)'],
    ['fox getupattack', 'Fox', 'Getup-Attack (Stomach)'],
    ['marth getupattack', 'Marth', 'Getup-Attack (Stomach)'],
    ['fox jabs', 'Fox', 'Rapid Jabs'],
    ['marth jabs', 'Marth', 'Jab 1'],
  ];

  test.each(cases)('Ensure "%s" resolves to %s / %s', async (query, expectedCharacter, expectedMove) => {
    const search = await setupSearch();
    const move = search.search(query);
    expect(move).toBeDefined();
    expect(move.type).toBe(SearchResultType.Move);
    expect(move.character.name).toBe(expectedCharacter);
    expect(move.move.name).toBe(expectedMove);
  });
});

describe('Ensure common misspellings and shorthand still resolve', () => {
  const cases = [
    ['marfh fsmash', 'Marth', 'Forward Smash'],
    ['figglypuf rest', 'Jigglypuff', 'Rest'],
    ['phalcon knee', 'Captain Falcon', 'Forward Air'],
    ['shiek ftilt', 'Sheik', 'Forward Tilt'],
    ['gameandwatch bair', 'Mr. Game & Watch', 'Back Air'],
    ['g&w bair', 'Mr. Game & Watch', 'Back Air'],
    ['gnw judgement', 'Mr. Game & Watch', 'Judgement'],
    ['iceclimber upb', 'Ice Climbers', 'Belay'],
    ['ics upb', 'Ice Climbers', 'Belay'],
    ['mewtoo shadowball', 'Mewtwo', 'Shadow Ball'],
    ['ganon fsmash', 'Ganondorf', 'Forward Smash'],
    ['jiggs rest', 'Jigglypuff', 'Rest'],
    ['puff bair', 'Jigglypuff', 'Back Air'],
    ['foxx shine', 'Fox', 'Reflector'],
    ['falko laser', 'Falco', 'Blaster'],
    ['drmairo pill', 'Dr. Mario', 'Megavitamins'],
    ['doc pills', 'Dr. Mario', 'Megavitamins'],
    ['kirbi fair', 'Kirby', 'Forward Air'],
    ['pika thunder', 'Pikachu', 'Thunder'],
    ['pikachu thunderjolt', 'Pikachu', 'Thunder Jolt'],
    ['samus charge shot', 'Samus', 'Charge Shot'],
    ['zelda dsmash', 'Zelda', 'Down Smash'],
    ['roi fsmash', 'Roy', 'Forward Smash'],
    ['ness pk fire', 'Ness', 'PK Fire'],
  ];

  test.each(cases)('Ensure "%s" resolves to %s / %s', async (query, expectedCharacter, expectedMove) => {
    const search = await setupSearch();
    const move = search.search(query);
    expect(move).toBeDefined();
    expect(move.type).toBe(SearchResultType.Move);
    expect(move.character.name).toBe(expectedCharacter);
    expect(move.move.name).toBe(expectedMove);
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
