import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
  get commandNames(): string[];
  get builders(): SlashCommandBuilder[];
  handleCommand(interaction: CommandInteraction): Promise<void>;
}
