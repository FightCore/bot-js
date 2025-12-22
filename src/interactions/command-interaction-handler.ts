import { CommandInteraction } from 'discord.js';
import { inject, injectable, multiInject } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { Command } from '../commands/command';
import { BaseInteractionHandler } from './base-interaction-handler';
import { Search } from '../data/search';
import { FailureStore } from '../data/failure-store';
import { LogSingleton } from '../utils/logs-singleton';

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
