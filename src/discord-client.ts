import { Message, Client, Intents, Interaction, PartialMessage, MessageMentions } from 'discord.js';
import { FailureStore } from './data/failure-store';
import { Loader } from './data/loader';
import { Search } from './data/search';
import { CharacterEmbedCreator } from './embeds/character-embed-creator';
import { ErrorEmbedCreator } from './embeds/error-embed-creator';
import { HelpEmbedCreator } from './embeds/help-embed-creator';
import { MoveEmbedCreator } from './embeds/move-embed-creator';
import { NotFoundEmbedCreator } from './embeds/not-found-embed-creator';
import { SearchResult } from './models/search/search-result';
import { SearchResultType } from './models/search/search-result-type';
import { LogSingleton } from './utils/logs-singleton';
import { MessageCleaner } from './utils/message-cleaner';

export class DiscordClient {
  private client: Client;
  private dataLoader = new Loader();

  constructor() {
    this.dataLoader.load();
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
      partials: ['CHANNEL'],
    });

    this.client.on('messageCreate', this.handleMessage.bind(this));
    this.client.on('interactionCreate', this.handleInteraction.bind(this));
    this.client.on('messageUpdate', this.handleMessageUpdate.bind(this));

    // When the client is ready, run this code (only once)
    this.client.once('ready', () => {
      LogSingleton.get().info('Client ready!');
    });
  }

  public login(): void {
    // Login to Discord with your client's token
    this.client.login(process.env.TOKEN);
  }

  private async handleInteraction(interaction: Interaction) {
    try {
      if (!interaction.isButton() && !interaction.isSelectMenu()) {
        return;
      }

      let isFromOriginalUser = false;
      const messageMentions = interaction.message.mentions as MessageMentions;
      if (messageMentions === null || messageMentions.repliedUser?.id === interaction.user.id) {
        isFromOriginalUser = true;
      }

      if (isFromOriginalUser) {
        await interaction.update({
          components: [],
        });
        FailureStore.get().remove(interaction.message.id);
      } else {
        await interaction.deferUpdate();
      }

      const search = new Search(this.dataLoader);
      const characterMove = search.search(interaction.isSelectMenu() ? interaction.values[0] : interaction.customId);
      if (!characterMove || !characterMove.move) {
        LogSingleton.get().error('Move not found for interaction');
        return;
      }

      const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);

      await interaction.followUp({
        ephemeral: !isFromOriginalUser,
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(),
      });
    } catch (error) {
      if (!interaction.isButton() && !interaction.isSelectMenu()) {
        return;
      }

      await this.handleError(error, interaction.message as Message);
    }
  }

  private async handleMessageUpdate(
    _oldMessage: Message<boolean> | PartialMessage,
    newMessage: Message<boolean> | PartialMessage
  ): Promise<void> {
    const failureStore = FailureStore.get();
    if (!failureStore.contains(newMessage.id)) {
      return;
    }

    await this.handleMessage(newMessage as Message<boolean>, true);
  }

  private async handleMessage(message: Message, isUpdate = false): Promise<void> {
    try {
      const messageSearchResult = MessageCleaner.containMention(message, this.client);
      if (!messageSearchResult.shouldRespond) {
        return;
      }
      await message.channel.sendTyping();

      // Replace the content of the message with just the search query and no user tag.
      const modifiedMessage = MessageCleaner.removeMention(message, messageSearchResult);

      const search = new Search(this.dataLoader);
      const searchResult = search.search(modifiedMessage);

      switch (searchResult.type) {
        case SearchResultType.MoveNotFound:
        case SearchResultType.NotFound:
          await this.sendNoMoveFoundError(message, modifiedMessage, isUpdate, searchResult);
          break;
        case SearchResultType.Character:
          await message.reply({ embeds: CharacterEmbedCreator.createCharacterEmbed(searchResult.character) });
          break;
        case SearchResultType.Move: {
          // Create the move embed.
          const embedCreator = new MoveEmbedCreator(searchResult.move, searchResult.character);
          if (isUpdate) {
            await this.updateExistingMessage(message, embedCreator, searchResult);
          } else {
            await this.sendNewReply(message, embedCreator, searchResult);
          }
          break;
        }
        case SearchResultType.Help:
          await message.reply({
            embeds: new HelpEmbedCreator().create(),
          });
          break;
      }
    } catch (error) {
      await this.handleError(error, message);
    }
  }

  /**
   * Handles any error thrown by the operating client.
   * @param error the error thrown while processing the message.
   * @param message the message to reply to.
   */
  private async handleError(error: unknown, message: Message): Promise<void> {
    try {
      LogSingleton.get().error(error);
      await message.reply({
        embeds: ErrorEmbedCreator.createErrorEmbed(),
      });
    } catch {
      LogSingleton.get().error(`An internal error occurred when trying to respond with an error.`);
    }
  }

  /**
   * Updates a reply to an existing message which the original user has updated.
   * @param message the message to update the reply for.
   * @param embedCreator the embed creator containing the new move embed.
   * @param searchResult the search result to update the reply with.
   */
  private async updateExistingMessage(
    message: Message,
    embedCreator: MoveEmbedCreator,
    searchResult: SearchResult
  ): Promise<void> {
    // Check if the move and the searchResult are not null.
    // This should be already checked in the previous process so throw an error
    // if this is the case.
    if (!searchResult.move) {
      throw new Error('Move was not found with existing message');
    }

    const failureStore = FailureStore.get();
    LogSingleton.get().info(`Updating existing to ${searchResult.character.name} and ${searchResult.move.name}`);

    const botMessageId = failureStore.get(message.id);
    if (botMessageId) {
      const botMessage = await message.channel.messages.fetch(botMessageId);
      const replyMessage = await botMessage.edit({
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(searchResult.possibleMoves),
      });

      if (replyMessage.components.length > 0) {
        failureStore.add(message.id, replyMessage.id);
      } else {
        failureStore.remove(message.id);
      }
    }
  }

  /**
   * Replies to the provided message with the frame data from the requested move.
   * @param message the message to reply to.
   * @param embedCreator the embed creator to use to create the reply.
   * @param searchResult the search result to use for the reply.
   */
  private async sendNewReply(message: Message, embedCreator: MoveEmbedCreator, searchResult: SearchResult) {
    // Check if the move and the searchResult are not null.
    // This should be already checked in the previous process so throw an error
    // if this is the case.
    if (!searchResult.move) {
      throw new Error('Move was not found with existing message');
    }

    const failureStore = FailureStore.get();
    LogSingleton.get().info(`Replying with ${searchResult.character.name} and ${searchResult.move.name}`);
    const replyMessage = await message.reply({
      embeds: embedCreator.createEmbed(),
      components: embedCreator.createButtons(searchResult.possibleMoves),
    });

    // If there are any components, see it as a bad message.
    if (replyMessage.components.length > 0) {
      failureStore.add(message.id, replyMessage.id);
    }
  }

  /**
   * Replies to a message that the search query has not lead to a result.
   * Updates the previous reply if a message has been updated.
   * @param message the message to reply to.
   * @param content the content of the original message that was not found.
   * @param isUpdate if the message is an update or not.
   * @param searchResult the search result of the new message.
   */
  private async sendNoMoveFoundError(
    message: Message,
    content: string,
    isUpdate: boolean,
    searchResult: SearchResult
  ): Promise<void> {
    const failureStore = FailureStore.get();
    if (content.length > 75) {
      content = content.substring(0, 75) + '...';
    }

    content = MessageCleaner.removeIllegalCharacters(content);

    LogSingleton.get().warn(`No character or move found for "${content}"`);
    const embeds =
      searchResult.type === SearchResultType.MoveNotFound
        ? NotFoundEmbedCreator.createMoveNotFoundEmbed(searchResult.character, content)
        : NotFoundEmbedCreator.createNotFoundEmbed(content);
    if (isUpdate) {
      const botMessageId = failureStore.get(message.id);
      if (botMessageId) {
        const botMessage = await message.channel.messages.fetch(botMessageId);
        await botMessage.edit({ embeds });
      }
    } else {
      const replyMessage = await message.reply({ embeds });
      failureStore.add(message.id, replyMessage.id);
    }
  }
}
