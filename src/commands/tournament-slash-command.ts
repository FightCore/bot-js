import { SlashCommandBuilder } from 'discord.js';

export class TournamentSlashCommand {
  static create(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder();
    builder
      .setName('tournament')
      .setDescription('Get a Startgg tournament by name.')
      .addStringOption((option) => option.setName('name').setDescription('The move to look for').setRequired(true));
    return builder;
  }
}
