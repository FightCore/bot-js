import { ShieldAdvantageCalculator } from '../../calculation/shield-advantange-calculator.js';
import { Hitbox } from '../../models/hitbox.js';
import { Move } from '../../models/move.js';
import { InfoLine } from '../formatting/info-line.js';

export class ShieldAdvantageFieldCreator {
  /**
   *
   * Calculates the shield advantage for the provided hitboxes and formats it
   * into a single message.
   * @param hitboxes the hitboxes to create the shield advantage field for.
   * @param move the associated move.
   * @returns the created shield advantage field or undefined if no shield advantage can be calculated.
   */
  static createShieldAdvantageField(hitboxes: Hitbox[], move: Move): string | undefined {
    const shieldAdvantages = hitboxes.map((hitbox) => ShieldAdvantageCalculator.calculate(move, hitbox));
    if (shieldAdvantages.every((advantage) => !advantage)) {
      return undefined;
    }

    const property = { title: 'Shield advantage', value: shieldAdvantages.join('/') };

    return InfoLine.createLine(property);
  }
}
