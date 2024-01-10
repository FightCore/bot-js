import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { Character } from '../models/character';
import frameData from '../assets/framedata.json';

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
    //const result = await axios.get('https://apiv2.fightcore.gg/exports/full');
    this.characters = this.removeNulls(frameData) as Character[];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private removeNulls(obj: any): any {
    if (obj === null) {
      return undefined;
    }
    if (typeof obj === 'object') {
      for (const key in obj) {
        obj[key] = this.removeNulls(obj[key]);
      }
    }
    return obj;
  }
}
