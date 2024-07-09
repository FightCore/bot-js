import { Colors, EmbedBuilder } from 'discord.js';
import { CrouchCancelCalculator } from '../calculation/crouch-cancel-calculator';
import { Character } from '../models/character';
import { Move } from '../models/move';
import { BaseEmbedCreator } from './base-embed-creator';
import { InfoLine } from './formatting/info-line';
import { CharacterEmoji } from '../utils/character-emoji';
import { Loader } from '../data/loader';
import { Hitbox } from '../models/hitbox';
import { versionNumber } from '../meta-data';
import { getMoveLink } from '../utils/fightcore-link';

export abstract class KnockbackEmbedCreator extends BaseEmbedCreator {
  constructor(private knockbackTarget: number, private longTerm: string, private shortTerm: string) {
    super();
  }

  public create(character: Character, move: Move, target: Character | undefined, dataLoader: Loader): EmbedBuilder[] {
    const embedCreator = this.baseEmbed();

    if (move.gifUrl) {
      embedCreator.setImage(move.gifUrl + `?version=${versionNumber}`);
    } else {
      embedCreator.addFields({
        name: 'No GIF available',
        value: 'There is no GIF available for this move.',
      });
    }
    embedCreator.setURL(getMoveLink(character, move));

    if (target) {
      return this.createForTarget(character, move, target, embedCreator);
    }

    return this.createForAll(character, move, embedCreator, dataLoader);
  }

  private createForTarget(character: Character, move: Move, target: Character, embedBuilder: EmbedBuilder): EmbedBuilder[] {
    const hitboxMap = new Map<string, string>();
    const characterEmote = CharacterEmoji.getEmoteId(character.normalizedName);
    const targetEmote = CharacterEmoji.getEmoteId(target.normalizedName);
    embedBuilder.setTitle(`${characterEmote} ${character.name} - ${move.name} vs ${target.name} ${targetEmote} `);
    for (const hitbox of move.hitboxes.sort(this.orderHitboxes)) {
      if (hitbox.angle > 179 && hitbox.angle != 361) {
        hitboxMap.set(hitbox.name, `Can not be ${this.shortTerm} due to angle being higher than 179 (${hitbox.angle})`);
      } else if (hitbox.angle === 0) {
        hitboxMap.set(hitbox.name, `Can not be ${this.shortTerm} due to angle being 0`);
      } else if (hitbox.setKnockback) {
        const canBeCanceled = !CrouchCancelCalculator.meetsKnockbackTarget(hitbox, target, this.knockbackTarget);
        hitboxMap.set(hitbox.name, `Can ${canBeCanceled ? 'always' : 'not'} be ${this.shortTerm}`);
      } else {
        const crouchCancelPercentage = this.getCrouchCancelPercentageOrImpossible(hitbox, target);
        hitboxMap.set(hitbox.name, crouchCancelPercentage);
      }
    }
    let result = `${this.longTerm} breaks at the following percentages for each hitbox.\n`;
    for (const keyValuePair of hitboxMap) {
      result += InfoLine.createLineWithTitle(keyValuePair[0], keyValuePair[1]) + '\n';
    }
    embedBuilder.addFields({ name: `${this.longTerm} percentage`, value: result });
    return [embedBuilder];
  }

  private createForAll(character: Character, move: Move, embedBuilder: EmbedBuilder, dataLoader: Loader): EmbedBuilder[] {
    const characterEmote = CharacterEmoji.getEmoteId(character.normalizedName);
    embedBuilder.setTitle(`${characterEmote} ${character.name} - ${move.name}`);
    for (const hitbox of move.hitboxes.sort(this.orderHitboxes)) {
      if (hitbox.angle > 179 && hitbox.angle != 361) {
        embedBuilder.addFields({
          name: hitbox.name,
          value: `Can not be ${this.shortTerm} due to angle being higher than 179 (${hitbox.angle})`,
        });
        continue;
      } else if (hitbox.angle === 0) {
        embedBuilder.addFields({ name: hitbox.name, value: `Can not be ${this.shortTerm} due to angle being 0` });
        continue;
      } else if (hitbox.setKnockback) {
        this.addSetKnockbackField(embedBuilder, hitbox, dataLoader);
        continue;
      }

      const hitboxMap = new Map<Character, string>();
      for (const target of dataLoader.data
        .filter((character) => character.characterStatistics.weight > 0)
        .sort(this.orderCharacters)) {
        const crouchCancelPercentage = this.getCrouchCancelPercentageOrImpossible(hitbox, target);
        hitboxMap.set(target, crouchCancelPercentage);
      }

      let fieldText = '';
      let iterator = 0;
      for (const keyValuePair of hitboxMap) {
        const emote = CharacterEmoji.getEmoteId(keyValuePair[0].normalizedName);
        fieldText += `${emote} ${keyValuePair[1]} `;
        iterator++;
        if (iterator === 4) {
          iterator = 0;
          fieldText += '\n';
        }
      }

      embedBuilder.addFields({ name: hitbox.name, value: fieldText });
    }
    // Discord has a max length size to the embed.
    // With a large amount of hitboxes (like G&W)
    if (embedBuilder.length >= 6000) {
      const errorEmbed = this.baseEmbed();
      errorEmbed.setColor(Colors.DarkRed);
      errorEmbed.setTitle(embedBuilder.data.title!);
      errorEmbed.addFields({
        name: 'Too many hitboxes',
        value: `This move has too many hitboxes to be displayed on Discord, either supply a target character or visit our [website](${embedBuilder
          .data.url!})`,
      });

      return [errorEmbed];
    }
    return [embedBuilder];
  }

  private getCrouchCancelPercentageOrImpossible(hitbox: Hitbox, target: Character): string {
    const crouchCancelPercentage = CrouchCancelCalculator.calculate(hitbox, target, this.knockbackTarget);
    if (crouchCancelPercentage > 0) {
      return crouchCancelPercentage.toFixed(2) + '%';
    }

    return '0%';
  }

  private orderCharacters(characterOne: Character, characterTwo: Character): number {
    return characterOne.name.localeCompare(characterTwo.name);
  }

  private orderHitboxes(hitboxOne: Hitbox, hitboxTwo: Hitbox): number {
    return hitboxOne.name.localeCompare(hitboxTwo.name, undefined, { numeric: true, sensitivity: 'base' });
  }

  private addSetKnockbackField(embedBuilder: EmbedBuilder, hitbox: Hitbox, dataLoader: Loader): void {
    const succeedsArray: Character[][] = [[], []];
    for (const character of dataLoader.data
      .filter((character) => character.characterStatistics.weight > 0)
      .sort(this.orderCharacters)) {
      if (!CrouchCancelCalculator.meetsKnockbackTarget(hitbox, character, this.knockbackTarget)) {
        succeedsArray[0].push(character);
      } else {
        succeedsArray[1].push(character);
      }
    }

    if (succeedsArray[0].length == 0) {
      embedBuilder.addFields({
        name: hitbox.name,
        value: `Can never be ${this.shortTerm} by all characters.`,
      });
      return;
    } else if (succeedsArray[1].length == 0) {
      embedBuilder.addFields({
        name: hitbox.name,
        value: `Can always be ${this.shortTerm} by all characters.`,
      });
      return;
    }

    const canText =
      `**Can always be ${this.shortTerm} by:**\n` +
      succeedsArray[0].map((character) => CharacterEmoji.getEmoteId(character.normalizedName)).join(' ');
    const canNotText =
      `**Can never be ${this.shortTerm} by:**\n` +
      succeedsArray[1].map((character) => CharacterEmoji.getEmoteId(character.normalizedName)).join(' ');

    embedBuilder.addFields({
      name: hitbox.name,
      value: canText + '\n' + canNotText,
    });
  }
}
