import { EmbedBuilder, APIEmbedField } from 'discord.js';
import { BaseEmbedCreator } from './base-embed-creator.js';

export class MentionEmbedCreator extends BaseEmbedCreator {
  private readonly botName: string;
  constructor() {
    super();
    this.botName = process.env.BOT_NAME ?? 'FightCore';
  }

  public create(): EmbedBuilder[] {
    const moveEmbedFields: APIEmbedField[] = [
      {
        name: 'Prefixes will no longer work in the future!',
        value: `Due to changes within Discord's privacy policy and the size of this server, ?c will no longer be supported.

        To use the bot please mention it like \`@${this.botName} fox nair\` or use the /framedata command.
        For example: \`@${this.botName} fox nair\``,
        inline: true,
      },
    ];

    return [this.baseEmbed().setTitle('?c will no longer work in the future').addFields(moveEmbedFields).setColor('Red')];
  }
}
