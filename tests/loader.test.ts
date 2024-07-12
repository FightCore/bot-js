import 'reflect-metadata';
import { expect, test } from '@jest/globals';
import winston from 'winston';
import { Loader } from '../src/data/loader';

test('Ensure data is loaded', async () => {
  // Create a silent unit test logger.
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        // Set the level to silent to prevent any output
        level: 'silent',
      }),
    ],
  });
  process.env.DATA_URL = 'https://data.fightcore.gg/framedata.json';
  const loader = new Loader(logger);
  await loader.ensureLoaded();
  expect(loader.data).toBeDefined();
  expect(loader.isOnlineData).toBe(true);
});

test('Ensure data is locally loaded', async () => {
  // Create a silent unit test logger.
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        // Set the level to silent to prevent any output
        level: 'silent',
      }),
    ],
  });
  process.env.DATA_URL = 'https://data.fightcore.gg/framedata.json2';
  // Load function gets called within constructor.
  const loader = new Loader(logger);
  await loader.ensureLoaded();
  expect(loader.data).toBeDefined();
  expect(loader.isOnlineData).toBe(false);
});
