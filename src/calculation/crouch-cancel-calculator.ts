import { Character } from '../models/character';
import { Hitbox } from '../models/hitbox';

export class CrouchCancelCalculator {
  static calculateCrouchCancel(hitbox: Hitbox, character: Character): number {
    return this.calculate(hitbox, character, 120);
  }
  static calculateASDIDown(hitbox: Hitbox, character: Character): number {
    return this.calculate(hitbox, character, 80);
  }

  private static calculate(hitbox: Hitbox, character: Character, knockbackTarget: number): number {
    return (
      ((100 + character.characterStatistics.weight) / 14) *
        (((100 / hitbox.knockbackGrowth) * (knockbackTarget - hitbox.baseKnockback) - 18) / (hitbox.damage + 2)) -
      hitbox.damage
    );
  }
}
