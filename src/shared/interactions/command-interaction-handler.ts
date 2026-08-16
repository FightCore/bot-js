import { CommandInteraction } from 'discord.js';
import { inject, injectable, multiInject } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols.js';
import { Command } from '../commands/command.js';
import { BaseInteractionHandler } from './base-interaction-handler.js';
import { Search } from '../data/search.js';
import { FailureStore } from '../data/failure-store.js';
import { LogSingleton } from '../utils/logs-singleton.js';

@injectable()
export class CommandInteractionHandler extends BaseInteractionHandler {
  constructor(
    search: Search,
    @inject(Symbols.Logger) logger: Logger,
    failureStore: FailureStore,
    @multiInject('Command') private commands: Command[]
  ) {
    super(search, logger, failureStore);
  }

  async handle(interaction: CommandInteraction): Promise<void> {
    const logger = LogSingleton.createContextLogger(interaction);
    const command = this.commands.find((command) => command.commandNames.includes(interaction.commandName));
    if (!command) {
      logger.warn(`Command not recognized {commandName}`, { commandName: interaction.commandName });
    } else {
      await command.handleCommand(interaction);
    }
  }
}
