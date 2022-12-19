import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { LogSingleton } from '../utils/logs-singleton';
import { MoveSlashCommand } from './move-slash-command';

export class RegisterCommands {
  public static register(client: Client): Promise<unknown> {
    const logger = LogSingleton.get();
    if (process.env.COMMAND_GUILD_ID) {
      logger.info(`Registering commands to Guild ${process.env.COMMAND_GUILD_ID}`);
      return this.registerToGuild(client);
    } else {
      logger.info('No COMMAND_GUILD_ID specified, registering commands globally');
      return this.registerGlobally(client);
    }
  }

  private static registerGlobally(client: Client): Promise<unknown> {
    return this.registerCommand(Routes.applicationCommands(client.user?.id ?? 'INVALID'));
  }

  private static registerToGuild(client: Client): Promise<unknown> {
    return this.registerCommand(
      Routes.applicationGuildCommands(client.user?.id ?? 'INVALID', process.env.COMMAND_GUILD_ID ?? 'INVALID')
    );
  }

  private static registerCommand(fullRoute: `/${string}`): Promise<unknown> {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN ?? 'INVALID');
    const commands = this.getCommandsToRegister();

    LogSingleton.get().info('Registering commands: ' + commands.map((command) => command.name));

    return rest.put(fullRoute, {
      body: commands,
    });
  }

  private static getCommandsToRegister(): SlashCommandBuilder[] {
    return [MoveSlashCommand.create()];
  }
}
