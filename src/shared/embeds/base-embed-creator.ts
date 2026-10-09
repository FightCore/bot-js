import { EmbedBuilder } from 'discord.js';
import { versionNumber } from '../version-number.js';

export abstract class BaseEmbedCreator {
  protected baseEmbed(): EmbedBuilder {
    return BaseEmbedCreator.baseEmbed();
  }

  public static baseEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setFooter({
        text: `FightCore Bot Version ${versionNumber}`,
        iconURL: 'https://i.fightcore.gg/clients/fightcore.png',
      })
      .setTimestamp();
  }
}
