import { CommandInteraction, Message } from 'discord.js';
import { Logger } from 'winston';
import { FailureStore } from '../data/failure-store';
import { Loader } from '../data/loader';
import { Search } from '../data/search';
import { ErrorEmbedCreator } from '../embeds/error-embed-creator';
import { LogSingleton } from '../utils/logs-singleton';

export class BaseInteractionHandler {
  protected search: Search;
  protected logger: Logger;
  protected failureStore: FailureStore;

  constructor(dataloader: Loader) {
    this.search = new Search(dataloader);
    this.logger = LogSingleton.get();
    this.failureStore = FailureStore.get();
  }

  /**
   * Handles any error thrown by the operating client.
   * @param error the error thrown while processing the message.
   * @param message the message to reply to.
   */
  public async handleError(error: unknown, message: Message | CommandInteraction): Promise<void> {
    try {
      LogSingleton.get().error(error);
      await message.reply({
        embeds: ErrorEmbedCreator.createErrorEmbed(),
      });
    } catch {
      this.logger.error(`An internal error occurred when trying to respond with an error.`);
    }
  }
}
