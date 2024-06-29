import { Client, REST, Routes } from 'discord.js';
import { inject, injectable, multiInject } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { Command } from './command';

@injectable()
export class RegisterCommands {
  constructor(
    @inject(Symbols.Logger) private logger: Logger,
    @inject(Symbols.Client) private client: Client,
    @multiInject('Command') private commands: Command[]
  ) {}

  public register(): Promise<unknown> {
    if (process.env.COMMAND_GUILD_ID) {
      this.logger.info(`Registering commands to Guild {guildId}`, { guildId: process.env.COMMAND_GUILD_ID });
      return this.registerToGuild();
    } else {
      this.logger.info('No COMMAND_GUILD_ID specified, registering commands globally');
      return this.registerGlobally();
    }
  }

  private registerGlobally(): Promise<unknown> {
    return this.registerCommand(Routes.applicationCommands(this.client.user?.id ?? 'INVALID'));
  }

  private registerToGuild(): Promise<unknown> {
    return this.registerCommand(
      Routes.applicationGuildCommands(this.client.user?.id ?? 'INVALID', process.env.COMMAND_GUILD_ID ?? 'INVALID')
    );
  }

  private registerCommand(fullRoute: `/${string}`): Promise<unknown> {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN ?? 'INVALID');

    this.logger.info('Registering commands: ' + this.commands.flatMap((command) => command.commandNames));

    return rest.put(fullRoute, {
      body: this.commands.flatMap((command) => command.builders),
    });
  }
}
