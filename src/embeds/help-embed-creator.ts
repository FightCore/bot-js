import { APIEmbedField, EmbedBuilder } from 'discord.js';
import { BaseEmbedCreator } from './base-embed-creator';

export class HelpEmbedCreator extends BaseEmbedCreator {
  private readonly botName: string;

  constructor() {
    super();
    this.botName = process.env.BOT_NAME ?? 'FightCore';
  }

  public create(): EmbedBuilder[] {
    const moveEmbedFields: APIEmbedField[] = [
      {
        name: 'Character statistics',
        value: `\`@${this.botName} {{NAME}}\`
            Use this command to get information about the character.
            Example: \`@${this.botName} Kirby\`
            `,
        inline: true,
      },
      {
        name: 'Move list',
        value: `\`@${this.botName} {{NAME}} moves\`
            Use this command to get a list of moves that are available for the character.
            Example: \`@${this.botName} Falcon moves\`
            `,
        inline: true,
      },
      {
        name: 'Move frame data',
        value: `\`@${this.botName} {{NAME}} {{MOVE}}\`
            Use this command to get the frame data of a particular move.
            Example: \`@${this.botName} falco sideb\`
            `,
        inline: true,
      },
      {
        name: 'Discord',
        value: 'For further information or feedback, please join our [Discord server](https://discord.fightcore.gg)',
      },
    ];

    return [this.baseEmbed().setTitle('Help').addFields(moveEmbedFields)];
  }
}
