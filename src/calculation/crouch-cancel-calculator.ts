import { Character } from '../models/character';
import { Hitbox } from '../models/hitbox';

export class CrouchCancelCalculator {
  static calculateCrouchCancel(hitbox: Hitbox, character: Character): number {
    return this.calculate(hitbox, character, 120);
  }
  static calculateASDIDown(hitbox: Hitbox, character: Character): number {
    return this.calculate(hitbox, character, 80);
  }

  static calculate(hitbox: Hitbox, character: Character, knockbackTarget: number): number {
    return (
      ((100 + character.characterStatistics.weight) / 14) *
        (((100 / hitbox.knockbackGrowth) * (knockbackTarget - hitbox.baseKnockback) - 18) / (hitbox.damage + 2)) -
      hitbox.damage
    );
  }

  static meetsKnockbackTarget(hitbox: Hitbox, character: Character, knockbackTarget: number): boolean {
    // Weight dependant set knockback formula as found on the following sources:
    // - IKneeData: https://github.com/schmooblidon/schmooblidon.github.io/blob/09c8d4303ce6d98d62918073b474099b5ed9a026/calculatormaths.js#L101
    // - standardtoaster/magus on Smashboards: https://smashboards.com/threads/melee-knockback-values.334245/post-15368915
    const knockback =
      (((hitbox.setKnockback * 10) / 20 + 1) * 1.4 * (200 / (character.characterStatistics.weight + 100)) + 18) *
        (hitbox.knockbackGrowth / 100) +
      hitbox.baseKnockback;

    // The move can be CCed/ASDIed by the given character if the knockback target is NOT met.
    return knockback >= knockbackTarget;
  }
}
