import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { Character } from '../models/character';
import frameData from '../assets/framedata.json';
import axios from 'axios';

@injectable()
export class Loader {
  constructor(@inject(Symbols.Logger) private logger: Logger) {}
  isOnlineData = false;
  private characters: Character[] | undefined;

  get data(): Character[] {
    return this.characters as Character[];
  }

  async ensureLoaded(): Promise<void> {
    if (this.characters) {
      return;
    }

    await this.load();
  }

  async load(): Promise<void> {
    try {
      // Try getting the characters from the online data.
      const result = await axios.get(process.env.DATA_URL as string);
      if (result.status !== 200) {
        throw new Error('Request has failed, non 200 status code');
      }
      this.characters = result.data;
      if (!Array.isArray(this.characters)) {
        throw new Error('Data is not an array');
      }
      this.logger.info('Using data.fightcore.gg based data.');
      this.isOnlineData = true;
    } catch {
      // If that fails, use the local json file as a backup
      this.logger.warn('Getting data failed, using local data file.');
      this.characters = this.removeNulls(frameData) as Character[];
      this.isOnlineData = false;
    }
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
