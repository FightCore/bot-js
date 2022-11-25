import { ShieldAdvantageCalculator } from '../../calculation/shield-advantange-calculator';
import { Hitbox } from '../../models/hitbox';
import { Move } from '../../models/move';

export class ShieldAdvantageFieldCreator {
  static createShieldAdvantageField(hitboxes: Hitbox[], move: Move): string | null {
    const shieldAdvantages = hitboxes.map((hitbox) => ShieldAdvantageCalculator.calculate(move, hitbox));
    if (shieldAdvantages.every((advantage) => advantage === null)) {
      return null;
    }

    const names = '**Names: **' + hitboxes.map((hitbox) => hitbox.name).join('/');

    const shieldAdvantagesString = '**Shield advantage:** ' + shieldAdvantages.join('/');

    const explanation = `Please note that the shield advantage calculation is done assuming the best case, Melee is complex and we recommended testing stuff out yourself.
    Check out this [RadarSSBM Video on Shield Advantage](https://www.youtube.com/watch?v=obxZu6lADi4)`;

    return names + '\n' + shieldAdvantagesString + '\n' + explanation;
  }
}
