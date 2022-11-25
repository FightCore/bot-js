import { Hitbox } from './hitbox';

export class YoshiArmorBreak {
  static calculate(hitbox: Hitbox): string {
    if (hitbox.damage === 0) {
      return 'N/A';
    }

    return (
      (208 / 14) * (((100 / hitbox.knockbackGrowth) * (120 - hitbox.baseKnockback) - 18) / (hitbox.damage + 2)) -
      hitbox.damage
    ).toFixed(2);
  }
}
