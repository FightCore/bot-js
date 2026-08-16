import 'reflect-metadata';
import { expect, test } from 'vitest';
import winston from 'winston';
import { Loader } from '../src/shared/data/loader.js';

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
  const loader = new Loader(logger);
  await loader.ensureLoaded();
  expect(loader.data).toBeDefined();
  expect(loader.isOnlineData).toBe(false);
});
