import { Client, Message } from 'discord.js';

export class MessageCleaner {
  public static containMention(message: Message, client: Client): boolean {
    // Never accept a message if it is from another bot.
    if (message.author.bot) {
      return false;
    }

    // Check if the message is from a DM or within a guild.
    // If its from a DM, the message doesn't need to be checked.
    if (!message.inGuild()) {
      return true;
    }

    // Check if the first mention the bot.
    return message.mentions?.users?.firstKey() === client.user?.id;
  }

  public static removeMention(message: Message, client: Client): string {
    const idFormats = [`<@!${client.user?.id}> `, `<@${client.user?.id}> `, `<!${client.user?.id}>`, `<@${client.user?.id}>`];

    let modifiedMessage = message.content;
    const startLength = modifiedMessage.length;
    for (const format of idFormats) {
      modifiedMessage = modifiedMessage.replace(format, '');

      // If the message length has been changed, it means the mention has been removed.
      // We can return early to avoid further message processing.
      if (startLength !== modifiedMessage.length) {
        return modifiedMessage;
      }
    }

    return modifiedMessage;
  }
}
