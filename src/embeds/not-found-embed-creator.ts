import { Colors, Embed, EmbedBuilder } from 'discord.js';
import { Character } from '../models/character';
import { BaseEmbedCreator } from './base-embed-creator';

export class NotFoundEmbedCreator extends BaseEmbedCreator {
  public static createMoveNotFoundEmbed(character: Character, message: string): EmbedBuilder[] {
    const moveEmbed = this.baseEmbed()
      .setTitle(`Not found for: ${character.name}`)
      .setDescription(`Nothing was found for the following search:\nCharacter: \`${character.name}\`\nMessage: \`${message}\``)
      .setColor(Colors.Red);

    // Return the embed inside of an array.
    // Multiple embeds could be created and returned but this is not needed for this use case.
    return [moveEmbed];
  }

  public static createNotFoundEmbed(message: string): EmbedBuilder[] {
    const moveEmbed = this.baseEmbed()
      .setTitle(`Not found`)
      .setDescription(`Nothing was found for the following search:\nMessage: \`${message}\``)
      .setColor(Colors.Red);

    // Return the embed inside of an array.
    // Multiple embeds could be created and returned but this is not needed for this use case.
    return [moveEmbed];
  }
}
