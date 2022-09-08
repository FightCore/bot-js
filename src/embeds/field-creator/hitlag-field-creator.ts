import { Hitbox } from '../../models/hitbox';
import { Hitlag } from '../../models/hitlag';

export class HitlagFieldCreator {
  static createHitlagFields(hitboxes: Hitbox[]): string | undefined {
    // A hitbox that doesn't damage, doesn't have hitlag
    if (hitboxes.every((hitbox) => hitbox.damage === 0)) {
      return undefined;
    }

    const properties = [
      {
        title: 'Name',
        value: hitboxes.map((hitbox) => hitbox.name).join('/'),
      },
    ];

    const hitlagValues = hitboxes.map((hitbox) => {
      return Hitlag.createFromHitbox(hitbox);
    });

    const complicatedValues = hitlagValues.some(
      (hitlag) => hitlag.hitlagDefender !== hitlag.hitlagAttacker || hitlag.hitlagDefenderCrouch !== hitlag.hitlagAttackerCrouch
    );

    if (complicatedValues) {
      properties.push({
        title: 'Hitlag for attacker',
        value: hitlagValues.map((hitlag) => hitlag.hitlagAttacker).join('/'),
      });
      properties.push({
        title: 'Hitlag for victim',
        value: hitlagValues.map((hitlag) => hitlag.hitlagDefender).join('/'),
      });
      properties.push({
        title: 'Hitlag for attacker (crouch canceled)',
        value: hitlagValues.map((hitlag) => hitlag.hitlagAttackerCrouch).join('/'),
      });
      properties.push({
        title: 'Hitlag for victim (crouch canceled)',
        value: hitlagValues.map((hitlag) => hitlag.hitlagDefenderCrouch).join('/'),
      });
    } else {
      properties.push({
        title: 'Hitlag',
        value: hitlagValues.map((hitlag) => hitlag.hitlagAttacker).join('/'),
      });
      properties.push({
        title: 'Hitlag (crouch canceled)',
        value: hitlagValues.map((hitlag) => hitlag.hitlagAttackerCrouch).join('/'),
      });
      properties.push({
        title: 'Note',
        value: 'Hitlag is the same for attacker and defender',
      });
    }
    let result = '';
    for (const property of properties) {
      const textValue = this.createLine(property.title, property.value);
      if (textValue) {
        result += textValue + '\n';
      }
    }

    return result;
  }

  private static createLine(title: string, value?: string | number): string | undefined {
    if (!value) {
      return undefined;
    }

    return `**${title}**: ${value}`;
  }
}
