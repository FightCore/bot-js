import { SlashCommandBuilder } from 'discord.js';

export class ReportSlashCommand {
  static create(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder();
    builder.setName('report').setDescription('Reports invalid data for a move');
    return builder;
  }
}
