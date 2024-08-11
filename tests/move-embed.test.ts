import { expect, test } from '@jest/globals';
import { MoveEmbedCreator } from '../src/embeds/move-embed-creator';
import { createCharacter, createMove } from './create-test-data';
import { versionNumber } from '../src/meta-data';
import { getEmbedJson, getMarth, getMarthFTilt } from './move-embed-test-data';

test('Ensure correct gif is added to embed', async () => {
  const baseUrl = 'https://i.fightcore.gg/moves/1.gif';
  const expectedUrl = baseUrl + '?version=' + versionNumber;

  const character = createCharacter();
  const move = createMove();
  move.gifUrl = baseUrl;

  const embedCreator = new MoveEmbedCreator(move, character);
  const embeds = embedCreator.createEmbed();
  const embed = embeds[0];

  expect(embed.data.image).toBeDefined();
  expect(embed.data.image?.url).toBe(expectedUrl);
});

test('Ensure link is correct', async () => {
  const characterName = 'testchar';
  const characterId = 1;
  const moveName = 'testmove';
  const moveId = 2;
  const expectedUrl = `https://fightcore.gg/characters/${characterId}/${characterName}/moves/${moveId}/${moveName}?referer=fightcore_bot`;

  const character = createCharacter();
  character.fightCoreId = characterId;
  character.normalizedName = characterName;
  const move = createMove();
  move.id = moveId;
  move.normalizedName = moveName;
  const embedCreator = new MoveEmbedCreator(move, character);
  const embeds = embedCreator.createEmbed();
  const embed = embeds[0];

  expect(embed.data.url).toBeDefined();
  expect(embed.data.url).toBe(expectedUrl);
});

test('Ensure embeds are generated correctly', async () => {
  const marth = getMarth();
  const ftilt = getMarthFTilt();

  const embedCreator = new MoveEmbedCreator(ftilt, marth);
  const embeds = embedCreator.createEmbed();
  const embed = embeds[0];
  const embedJson = embed.toJSON();

  const expectedEmbedJson = getEmbedJson();

  // Remove the timestamp to make sure it can not be different.
  expectedEmbedJson.timestamp = embedJson.timestamp;

  expect(embedJson).toStrictEqual(expectedEmbedJson);
});
