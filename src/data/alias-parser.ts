import { Loader } from './loader';
import { AliasRecord } from './models/alias-record';
import moveData from '../assets/names.json';
import { inject, injectable } from 'inversify';

@injectable()
export class AliasParser {
  private readonly _aliases: AliasRecord[] = moveData as AliasRecord[];

  constructor(@inject(Loader) loader: Loader) {
    for (const alias of this._aliases) {
      const localCharacter = loader.data.find((character) => character.name === alias.name);
      if (localCharacter) {
        alias.character = localCharacter;
      }

      alias.names.push(alias.name);
      alias.moves = new Map<string, string>(Object.entries(alias.moves ?? {}));
    }
  }

  get aliases(): AliasRecord[] {
    return this._aliases;
  }
}
