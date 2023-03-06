import { CommandInteraction, Message } from 'discord.js';
import { inject } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { FailureStore } from '../data/failure-store';
import { Search } from '../data/search';
import { ErrorEmbedCreator } from '../embeds/error-embed-creator';

export class BaseInteractionHandler {
  constructor(
    protected search: Search,
    @inject(Symbols.Logger) protected logger: Logger,
    @inject(FailureStore) protected failureStore: FailureStore
  ) {}

  /**
   * Handles any error thrown by the operating client.
   * @param error the error thrown while processing the message.
   * @param message the message to reply to.
   */
  public async handleError(error: unknown, message: Message | CommandInteraction): Promise<void> {
    try {
      this.logger.error(error);
      await message.reply({
        embeds: ErrorEmbedCreator.createErrorEmbed(),
      });
    } catch {
      this.logger.error(`An internal error occurred when trying to respond with an error.`);
    }
  }
}
