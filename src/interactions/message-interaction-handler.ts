import { Client, Message, StageChannel } from 'discord.js';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { FailureStore } from '../data/failure-store';
import { Search } from '../data/search';
import { CharacterEmbedCreator } from '../embeds/character-embed-creator';
import { HelpEmbedCreator } from '../embeds/help-embed-creator';
import { MoveEmbedCreator } from '../embeds/move-embed-creator';
import { MoveListEmbedCreator } from '../embeds/move-list-embed-creator';
import { NotFoundEmbedCreator } from '../embeds/not-found-embed-creator';
import { SearchResult } from '../models/search/search-result';
import { SearchResultType } from '../models/search/search-result-type';
import { Indexer } from '../utils/indexer';
import { MessageCleaner } from '../utils/message-cleaner';
import { BaseInteractionHandler } from './base-interaction-handler';
import { RoleEmbedCreator } from '../embeds/role-embed-creator';

@injectable()
export class MessageInteractionHandler extends BaseInteractionHandler {
  constructor(
    search: Search,
    @inject(Symbols.Logger) logger: Logger,
    failureStore: FailureStore,
    @inject(Symbols.Client) private client: Client
  ) {
    super(search, logger, failureStore);
  }

  async handleMessage(message: Message, isUpdate = false): Promise<void> {
    try {
      if (!message.channel.isTextBased() || message.channel instanceof StageChannel) {
        return;
      }
      // Lock the conversation to a single channel if wanted.
      if (process.env.CHANNEL_LOCK) {
        if (message.channelId !== process.env.CHANNEL_LOCK) {
          return;
        }
      }

      const messageSearchResult = MessageCleaner.containMention(message, this.client);
      if (!messageSearchResult.shouldRespond) {
        return;
      }
      await message.channel.sendTyping();

      if (messageSearchResult.isRoleMessage) {
        await message.reply({ embeds: RoleEmbedCreator.createErrorEmbed() });
        return;
      }

      // Replace the content of the message with just the search query and no user tag.
      const modifiedMessage = MessageCleaner.removeMention(message, messageSearchResult);
      const searchResult = this.search.search(modifiedMessage);

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
        case SearchResultType.MoveList: {
          const movesEmbed = new MoveListEmbedCreator(searchResult.character);
          await message.reply({ embeds: movesEmbed.create() });
        }
      }
    } catch (error) {
      await this.handleError(error, message);
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
    if (!message.channel.isTextBased() || message.channel instanceof StageChannel) {
      return;
    }

    // Check if the move and the searchResult are not null.
    // This should be already checked in the previous process so throw an error
    // if this is the case.
    if (!searchResult.move) {
      throw new Error('Move was not found with existing message');
    }

    this.logger.info(`Updating existing to ${searchResult.character.name} and ${searchResult.move.name}`);

    const botMessageId = this.failureStore.get(message.id);
    if (botMessageId) {
      const botMessage = await message.channel.messages.fetch(botMessageId);
      const replyMessage = await botMessage.edit({
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(searchResult.possibleMoves),
      });

      if (replyMessage.components.length > 0) {
        this.failureStore.add(message.id, replyMessage.id);
      } else {
        this.failureStore.remove(message.id);
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

    this.logger.info(`Replying with ${searchResult.character.name} and ${searchResult.move.name}`);
    new Indexer().indexMove(searchResult.character, searchResult.move);
    const replyMessage = await message.reply({
      embeds: embedCreator.createEmbed(),
      components: embedCreator.createButtons(searchResult.possibleMoves),
    });

    // If there are any components, see it as a bad message.
    if (replyMessage.components.length > 0) {
      this.failureStore.add(message.id, replyMessage.id);
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
    if (!message.channel.isTextBased() || message.channel instanceof StageChannel) {
      return;
    }

    if (content.length > 75) {
      content = content.substring(0, 75) + '...';
    }

    content = MessageCleaner.removeIllegalCharacters(content);

    this.logger.warn(`No character or move found for "${content}"`);
    const embeds =
      searchResult.type === SearchResultType.MoveNotFound
        ? NotFoundEmbedCreator.createMoveNotFoundEmbed(searchResult.character, content)
        : NotFoundEmbedCreator.createNotFoundEmbed(content);
    if (isUpdate) {
      const botMessageId = this.failureStore.get(message.id);
      if (botMessageId) {
        const botMessage = await message.channel.messages.fetch(botMessageId);
        await botMessage.edit({ embeds });
      }
    } else {
      const replyMessage = await message.reply({ embeds });
      this.failureStore.add(message.id, replyMessage.id);
    }
  }
}
