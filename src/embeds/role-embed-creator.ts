import { Colors, EmbedBuilder } from 'discord.js';
import { BaseEmbedCreator } from './base-embed-creator';

export class RoleEmbedCreator extends BaseEmbedCreator {
  public static createErrorEmbed(): EmbedBuilder[] {
    const moveEmbed = this.baseEmbed()
      .setTitle(`Can not read your message`)
      .setDescription(
        `Due to a bug within Discord, we can not read the content of your message. Please make sure you are pinging the bot itself and not the role.\nFor an easier time, use the \`/framedata\` command to get easier results.`
      )
      .setColor(Colors.DarkOrange);

    // Return the embed inside of an array.
    // Multiple embeds could be created and returned but this is not needed for this use case.
    return [moveEmbed];
  }
}
