import { Hitbox } from './hitbox';

export class Hitlag {
  name: string;
  hitlagDefender: number;
  hitlagAttacker: number;
  hitlagDefenderCrouch: number;
  hitlagAttackerCrouch: number;

  constructor(
    name: string,
    hitlagDefender: number,
    hitlagAttacker: number,
    hitlagDefenderCrouch: number,
    hitlagAttackerCrouch: number
  ) {
    this.name = name;
    this.hitlagDefender = hitlagDefender;
    this.hitlagAttacker = hitlagAttacker;
    this.hitlagDefenderCrouch = hitlagDefenderCrouch;
    this.hitlagAttackerCrouch = hitlagAttackerCrouch;
  }

  static createFromHitbox(hitbox: Hitbox): Hitlag {
    return new Hitlag(
      hitbox.name,
      Hitlag.calculateHitlag(hitbox.damage, hitbox.effect, true, false),
      Hitlag.calculateHitlag(hitbox.damage, hitbox.effect, false, false),
      Hitlag.calculateHitlag(hitbox.damage, hitbox.effect, true, true),
      Hitlag.calculateHitlag(hitbox.damage, hitbox.effect, false, true)
    );
  }

  private static calculateHitlag(damage: number, effect: string, isVictim: boolean, crouchCancel: boolean): number {
    if (damage === 0) {
      return 0;
    }

    // Calculate base hitlag based on damage.
    let hitlag = Math.round(damage / 3 + 3);

    if (effect === 'Electric' && isVictim) {
      hitlag = Math.round(hitlag * 1.5);
    }

    if (crouchCancel) {
      hitlag = Math.round(hitlag * 0.666667);
    }

    return hitlag >= 20 ? 20 : hitlag;
  }
}
