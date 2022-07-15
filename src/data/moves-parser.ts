import moves from '../assets/moves.json';
import { MoveAlias } from './moves/move-alias';

export class MovesParser {
  private static readonly moveAliases: MoveAlias[] = moves as MoveAlias[];

  public static search(query: string): string {
    for (const move of this.moveAliases) {
      for (const alias of move.alias) {
        if (alias === query) {
          return move.move;
        }
      }
    }

    return query;
  }
}
