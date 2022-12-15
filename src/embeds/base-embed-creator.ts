import { MessageEmbed } from 'discord.js';

export abstract class BaseEmbedCreator {
  protected baseEmbed(): MessageEmbed {
    return BaseEmbedCreator.baseEmbed();
  }

  public static baseEmbed(): MessageEmbed {
    return new MessageEmbed()
      .setFooter({
        text: 'FightCore Bot Version 2.1.1',
        iconURL: 'https://i.fightcore.gg/clients/fightcore.png',
      })
      .setTimestamp();
  }
}
