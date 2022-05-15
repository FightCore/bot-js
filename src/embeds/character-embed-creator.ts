import { ColorResolvable, EmbedFieldData, MessageEmbed } from 'discord.js';
import { Character } from '../models/character';
import { CharacterStatistics } from '../models/character-statistics';
import { BaseEmbedCreator } from './base-embed-creator';

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
    const fields = [
      { name: 'Walk speed', value: characterStatistics.walkSpeed },
      { name: 'Initial dash speed', value: characterStatistics.initialDash },
      { name: 'Initial dash frames', value: characterStatistics.dashFrames },
      { name: 'Run speed', value: characterStatistics.runSpeed },
      { name: 'Wave dash length (rank)', value: characterStatistics.waveDashLengthRank },
      { name: 'Perfect wave dash length', value: characterStatistics.waveDashLength },
      { name: 'PLA intangibility frames', value: characterStatistics.plaIntangibilityFrames },
      { name: 'Source', value: 'https://smashboards.com/threads/ultimate-ground-movement-analysis-turbo-edition.392367/' },
    ];
    return {
      name: 'Ground movement',
      value: fields.map((field) => `**${field.name}:** ${field.value}`).join('\n'),
    };
  }

  private static frameData(characterStatistics: CharacterStatistics): EmbedFieldData {
    const fields = [
      { name: 'Weight', value: characterStatistics.weight },
      { name: 'Gravity', value: characterStatistics.gravity },
      { name: 'Can wall jump', value: characterStatistics.canWallJump },
      { name: 'Jump squad frames', value: characterStatistics.jumpSquat },
    ];
    return {
      name: 'Frame data',
      value: fields.map((field) => `**${field.name}:** ${field.value}`).join('\n'),
    };
  }
}
