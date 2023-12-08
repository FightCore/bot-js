import moves from '../assets/moves.json';
import { MoveAlias } from './moves/move-alias';
import { Normalizer } from './normalizer';

export class MovesParser {
  private static readonly moveAliases: MoveAlias[] = moves as MoveAlias[];

  public static search(query: string): string {
    // Filter out any non-alphanumeric characters from the query.
    // The moves.json is built based on the old FightCore Bot and uses
    // the normalized format.
    const filteredQuery = Normalizer.normalize(query);

    for (const move of this.moveAliases) {
      for (const alias of move.alias) {
        if (alias === filteredQuery) {
          return move.move;
        }
      }
    }

    return query;
  }
}
