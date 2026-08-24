import { Hitbox } from '../../../shared/models/hitbox.js';
import { Hitlag } from '../../../shared/models/hitlag.js';
import { BodyFormatter } from '../../../shared/embeds/formatting/body-formatter.js';

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
    const complicatedValues = hitlagValues.some((hitlag) => hitlag.hitlagDefender !== hitlag.hitlagAttacker);

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
        title: 'Hitlag defender (crouch canceled)',
        value: hitlagValues.map((hitlag) => hitlag.hitlagDefenderCrouch).join('/'),
      },
    ]);
  }
}
