import { Loader } from './loader';
import { AliasRecord } from './models/alias-record';
import moveData from '../assets/names.json';

export class AliasParser {
  private static readonly aliases: AliasRecord[] = moveData as AliasRecord[];
  private static parsedAliases: boolean;

  static load(loader: Loader): AliasRecord[] {
    if (this.parsedAliases) {
      return this.aliases;
    }

    for (const alias of AliasParser.aliases) {
      const localCharacter = loader.data.find((character) => character.name === alias.name);
      if (localCharacter) {
        alias.character = localCharacter;
      }

      alias.names.push(alias.name);
      alias.moves = new Map<string, string>(Object.entries(alias.moves ?? {}));
    }

    this.parsedAliases = true;
    return this.aliases;
  }
}
