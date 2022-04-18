import { MessageEmbed } from 'discord.js';
import { BaseEmbedCreator } from './base-embed-creator';

export class ErrorEmbedCreator extends BaseEmbedCreator {
  public static createErrorEmbed(): MessageEmbed[] {
    const moveEmbed = this.baseEmbed()
      .setTitle(`An internal error occurred`)
      .setDescription(
        `An internal error has occurred. Please try again later.\nIf this continues to occur, please contact @FightCoregg on Twitter.`
      )
      .setColor('RED');

    // Return the embed inside of an array.
    // Multiple embeds could be created and returned but this is not needed for this use case.
    return [moveEmbed];
  }
}
