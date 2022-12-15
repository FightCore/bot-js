import { ColorResolvable, EmbedFieldData, MessageEmbed } from 'discord.js';
import { Character } from '../models/character';
import { CharacterStatistics } from '../models/character-statistics';
import { BaseEmbedCreator } from './base-embed-creator';
import { BodyFormatter } from './formatting/body-formatter';
W;

export class CharacterEmbedCreator extends BaseEmbedCreator {
  public static createCharacterEmbed(character: Character): MessageEmbed[] {
    const color = (process.env.EMBED_COLOR as ColorResolvable) ?? '#a9e5fd';
    const embed = this.baseEmbed()
      .setTitle(`${character.name}`)
      .setColor(color)
      .addFields([this.groundMovement(character.characterStatistics), this.frameData(character.characterStatistics)]);
    // Return the embed inside of an array.
    // Multiple embeds could be created and returned but this is not needed for this use case.
    return [embed];
  }

  private static groundMovement(characterStatistics: CharacterStatistics): EmbedFieldData {
    const properties = [
      { title: 'Walk speed', value: characterStatistics.walkSpeed },
      { title: 'Initial dash speed', value: characterStatistics.initialDash },
      { title: 'Initial dash frames', value: characterStatistics.dashFrames },
      { title: 'Run speed', value: characterStatistics.runSpeed },
      { title: 'Wave dash length (rank)', value: characterStatistics.waveDashLengthRank },
      { title: 'Perfect wave dash length', value: characterStatistics.waveDashLength },
      { title: 'PLA intangibility frames', value: characterStatistics.plaIntangibilityFrames },
      {
        title: 'Source',
        value: '[Smashboards](https://smashboards.com/threads/ultimate-ground-movement-analysis-turbo-edition.392367)',
      },
    ];
    return {
      name: 'Ground movement',
      value: BodyFormatter.create(properties) as string,
      inline: true,
    };
  }

  private static frameData(characterStatistics: CharacterStatistics): EmbedFieldData {
    const properties = [
      { title: 'Weight', value: characterStatistics.weight },
      { title: 'Gravity', value: characterStatistics.gravity },
      { title: 'Can wall jump', value: characterStatistics.canWallJump },
      { title: 'Jump squad frames', value: characterStatistics.jumpSquat },
    ];
    return {
      name: 'Frame data',
      value: BodyFormatter.create(properties) as string,
      inline: true,
    };
  }
}
