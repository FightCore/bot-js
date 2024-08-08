import { Hitbox } from '../../models/hitbox';
import { Hitlag } from '../../models/hitlag';
import { BodyFormatter } from '../formatting/body-formatter';

export class HitlagFieldCreator {
  static createHitlagFields(hitboxes: Hitbox[]): string | undefined {
    // A hitbox that doesn't damage, doesn't have hitlag
    if (hitboxes.every((hitbox) => hitbox.damage === 0)) {
      return undefined;
    }

    const hitlagValues = hitboxes.map((hitbox) => {
      return Hitlag.createFromHitbox(hitbox);
    });

    // check if the hitlag is equal for the defender and attacker, if so we dont need
    // to display all values.
    const complicatedValues = hitlagValues.some(
      (hitlag) => hitlag.hitlagDefender !== hitlag.hitlagAttacker || hitlag.hitlagDefenderCrouch !== hitlag.hitlagAttackerCrouch
    );

    if (complicatedValues) {
      return BodyFormatter.create([
        {
          title: 'Hitlag for attacker',
          value: hitlagValues.map((hitlag) => hitlag.hitlagAttacker).join('/'),
        },
        {
          title: 'Hitlag for defender',
          value: hitlagValues.map((hitlag) => hitlag.hitlagDefender).join('/'),
        },
        {
          title: 'Hitlag for attacker (crouch canceled)',
          value: hitlagValues.map((hitlag) => hitlag.hitlagAttackerCrouch).join('/'),
        },
        {
          title: 'Hitlag for defender (crouch canceled)',
          value: hitlagValues.map((hitlag) => hitlag.hitlagDefenderCrouch).join('/'),
        },
      ]);
    }

    return BodyFormatter.create([
      {
        title: 'Hitlag attacker & defender',
        value: hitlagValues.map((hitlag) => hitlag.hitlagAttacker).join('/'),
      },
      {
        title: 'Hitlag attacker & defender (crouch canceled)',
        value: hitlagValues.map((hitlag) => hitlag.hitlagAttackerCrouch).join('/'),
      },
    ]);
  }
}
