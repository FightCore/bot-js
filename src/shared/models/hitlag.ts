import { Hitbox } from './hitbox.js';

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
      hitbox.hitlagDefender,
      hitbox.hitlagAttacker,
      hitbox.hitlagDefenderCrouched,
      hitbox.hitlagAttackerCrouched
    );
  }
}
