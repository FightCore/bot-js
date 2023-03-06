import axios from 'axios';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { Character } from '../models/character';

@injectable()
export class Loader {
  constructor(@inject(Symbols.Logger) logger: Logger) {
    this.load().then(() => {
      logger.info('Loaded data');
    });
  }
  private characters: Character[] = [];
  get data(): Character[] {
    return this.characters;
  }

  async load(): Promise<void | Character[]> {
    const result = await axios.get('https://apiv2.fightcore.gg/exports/full');
    this.characters = result.data as Character[];
  }
}
