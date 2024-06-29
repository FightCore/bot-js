import { Colors, EmbedBuilder } from 'discord.js';
import { CrouchCancelCalculator } from '../calculation/crouch-cancel-calculator';
import { Character } from '../models/character';
import { Move } from '../models/move';
import { BaseEmbedCreator } from './base-embed-creator';
import { InfoLine } from './formatting/info-line';
import { CharacterEmoji } from '../utils/character-emoji';
import { Loader } from '../data/loader';
import { Hitbox } from '../models/hitbox';

export class CrouchCancelEmbedCreator extends BaseEmbedCreator {
  public static create(character: Character, move: Move, target: Character | undefined, dataLoader: Loader): EmbedBuilder[] {
    const embedCreator = this.baseEmbed();

    if (move.gifUrl) {
      embedCreator.setImage(move.gifUrl);
    } else {
      embedCreator.addFields({
        name: 'No GIF available',
        value: 'There is no GIF available for this move. Visit https://www.fightcore.gg to help us out.',
      });
    }
    embedCreator.setURL(
      `https://fightcore.gg/characters/${character.fightCoreId}/${character.normalizedName}/moves/${move.id}/${move.normalizedName}/?utm_source=fightcore_bot`
    );

    if (target) {
      return this.createForTarget(character, move, target, embedCreator);
    }

    return this.createForAll(character, move, embedCreator, dataLoader);
  }

  private static createForTarget(
    character: Character,
    move: Move,
    target: Character,
    embedBuilder: EmbedBuilder
  ): EmbedBuilder[] {
    const hitboxMap = new Map<string, string>();
    const characterEmote = CharacterEmoji.getEmoteId(character.normalizedName);
    const targetEmote = CharacterEmoji.getEmoteId(target.normalizedName);
    embedBuilder.setTitle(`${characterEmote} ${character.name} - ${move.name} vs ${target.name} ${targetEmote} `);
    for (const hitbox of move.hitboxes) {
      if (hitbox.angle > 179 && hitbox.angle != 361) {
        hitboxMap.set(hitbox.name, `Can not be CCed due to angle being higher than 179 (${hitbox.angle})`);
      } else if (hitbox.angle === 0) {
        hitboxMap.set(hitbox.name, `Can not be CCed due to angle being 0`);
      } else {
        const crouchCancelPercentage = this.getCrouchCancelPercentageOrImpossible(hitbox, target);
        hitboxMap.set(hitbox.name, crouchCancelPercentage);
      }
    }
    let result = 'Crouch cancel breaks at the following percentages for each hitbox.\n';
    for (const keyValuePair of hitboxMap) {
      result += InfoLine.createLineWithTitle(keyValuePair[0], keyValuePair[1]) + '\n';
    }
    embedBuilder.addFields({ name: 'Crouch Cancel Percentage', value: result });
    return [embedBuilder];
  }

  private static createForAll(character: Character, move: Move, embedBuilder: EmbedBuilder, dataLoader: Loader): EmbedBuilder[] {
    const characterEmote = CharacterEmoji.getEmoteId(character.normalizedName);
    embedBuilder.setTitle(`${characterEmote} ${character.name} - ${move.name}`);

    for (const hitbox of move.hitboxes) {
      if (hitbox.angle > 179 && hitbox.angle != 361) {
        embedBuilder.addFields({
          name: hitbox.name,
          value: `Can not be CCed due to angle being higher than 179 (${hitbox.angle})`,
        });
        continue;
      } else if (hitbox.angle === 0) {
        embedBuilder.addFields({ name: hitbox.name, value: `Can not be CCed due to angle being 0` });
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

  private static getCrouchCancelPercentageOrImpossible(hitbox: Hitbox, target: Character): string {
    const crouchCancelPercentage = CrouchCancelCalculator.calculateCrouchCancel(hitbox, target);
    if (crouchCancelPercentage > 0) {
      return crouchCancelPercentage.toFixed(2) + '%';
    }

    return '0%';
  }

  private static orderCharacters(characterOne: Character, characterTwo: Character): number {
    return characterOne.name.localeCompare(characterTwo.name);
  }
}
