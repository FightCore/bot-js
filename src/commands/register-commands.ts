import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { MoveSlashCommand } from './move-slash-command';

@injectable()
export class RegisterCommands {
  constructor(@inject(Symbols.Logger) private logger: Logger, @inject(Symbols.Client) private client: Client) {}

  public register(): Promise<unknown> {
    if (process.env.COMMAND_GUILD_ID) {
      this.logger.info(`Registering commands to Guild ${process.env.COMMAND_GUILD_ID}`);
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
    const commands = RegisterCommands.getCommandsToRegister();

    this.logger.info('Registering commands: ' + commands.map((command) => command.name));

    return rest.put(fullRoute, {
      body: commands,
    });
  }

  private static getCommandsToRegister(): SlashCommandBuilder[] {
    return [MoveSlashCommand.create()];
  }
}
