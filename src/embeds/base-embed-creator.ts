import { EmbedBuilder } from 'discord.js';

export abstract class BaseEmbedCreator {
  protected baseEmbed(): EmbedBuilder {
    return BaseEmbedCreator.baseEmbed();
  }

  public static baseEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setFooter({
        text: 'FightCore Bot Version 2.1.1',
        iconURL: 'https://i.fightcore.gg/clients/fightcore.png',
      })
      .setTimestamp();
  }
}
