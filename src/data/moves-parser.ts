import moves from '../assets/moves.json';
import { MoveAlias } from './moves/move-alias';

export class MovesParser {
  private static readonly moveAliases: MoveAlias[] = moves as MoveAlias[];

  public static search(query: string): string {
    // Filter out any non-alphanumeric characters from the query.
    // The moves.json is built based on the old FightCore Bot and uses
    // the normalized format.
    const filteredQuery = query.replace(/[^a-z0-9]/gi, '').toLowerCase();

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
