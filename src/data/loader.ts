import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { Character } from '../models/character';
import frameData from '../assets/framedata.json';

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

  load(): void {
    this.characters = this.removeNulls(frameData) as Character[];
    this.isOnlineData = false;
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
