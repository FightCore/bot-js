import { EmbedBuilder } from 'discord.js';
import { CrouchCancelCalculator } from '../calculation/crouch-cancel-calculator';
import { Character } from '../models/character';
import { Move } from '../models/move';
import { BaseEmbedCreator } from './base-embed-creator';
import { InfoLine } from './formatting/info-line';

export class CrouchCancelEmbedCreator extends BaseEmbedCreator {
  public static create(character: Character, move: Move, target: Character | undefined): EmbedBuilder[] {
    const embedCreator = this.baseEmbed();

    const hitboxMap = new Map<string, string>();
    if (target) {
      embedCreator.setTitle(`${character.name} - ${move.name} vs ${target.name}`);
    } else {
      embedCreator.setTitle(`${character.name} - ${move.name}`);
    }
    for (const hitbox of move.hitboxes) {
      const crouchCancelPercentage = CrouchCancelCalculator.calculateCrouchCancel(hitbox, target!).toFixed(2);
      hitboxMap.set(hitbox.name, crouchCancelPercentage);
    }
    let result = 'Crouch cancel breaks at the following percentages for each hitbox.\n';
    for (const keyValuePair of hitboxMap) {
      result += InfoLine.createLineWithTitle(keyValuePair[0], keyValuePair[1]) + '\n';
    }
    embedCreator.setDescription(result);

    return [embedCreator];
  }
}
