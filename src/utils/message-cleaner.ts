import { Client, Message } from 'discord.js';

export class MessageSearchResult {
  public shouldRespond?: boolean;
  public id?: string;
}

export class MessageCleaner {
  private static illegalCharacters = ['@', '`'];

  public static containMention(message: Message, client: Client): MessageSearchResult {
    // Never accept a message if it is from another bot.
    if (message.author.bot) {
      return { shouldRespond: false };
    }

    // Check if the message is from a DM or within a guild.
    // If its from a DM, the message doesn't need to be checked.
    if (!message.inGuild()) {
      return { shouldRespond: true, id: client.user?.id };
    }

    if (message.mentions?.users?.firstKey() === client.user?.id) {
      return { shouldRespond: true, id: client.user?.id };
    }

    if (client.user) {
      const botRole = message.guild.roles.botRoleFor(client.user);

      // Check if the first mention the bot.
      if (
        message.mentions.roles.size > 0 &&
        message.mentions.roles?.first()?.id != null &&
        botRole != null &&
        message.mentions.roles?.first()?.id === botRole.id
      ) {
        return { shouldRespond: true, id: message.mentions.roles?.first()?.id };
      }
    }

    return { shouldRespond: false };
  }

  public static removeMention(message: Message, messageResult: MessageSearchResult): string {
    // If there is no mention, there is nothing to remove.
    if (messageResult.id == null) {
      return message.content;
    }

    const idFormats = [
      `<@!${messageResult.id}> `,
      `<@${messageResult.id}> `,
      `<!${messageResult.id}>`,
      `<@${messageResult.id}>`,
      `<${messageResult.id}> `,
      `<${messageResult.id}>`,
      // Role mention
      `<&${messageResult.id}> `,
      `<&${messageResult.id}>`,
      `<@&${messageResult.id}> `,
      `<@&${messageResult.id}>`,
    ];

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

  public static removeIllegalCharacters(message: string): string {
    let modifiedMessage = message;
    for (const illegalCharacter of MessageCleaner.illegalCharacters) {
      modifiedMessage = modifiedMessage.replace(new RegExp(illegalCharacter, 'g'), '');
    }

    return modifiedMessage;
  }
}
