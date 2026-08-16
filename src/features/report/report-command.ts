import { SlashCommandBuilder, CommandInteraction, CacheType } from 'discord.js';
import { Command } from '../../shared/commands/command.js';
import { ReportModal } from './report-embed.js';
import { injectable } from 'inversify';

@injectable()
export class ReportCommand implements Command {
  get commandNames(): string[] {
    return ['report'];
  }

  get builders(): SlashCommandBuilder[] {
    const builder = new SlashCommandBuilder();
    builder.setName('report').setDescription('Reports invalid data for a move');
    return [builder];
  }

  async handleCommand(interaction: CommandInteraction<CacheType>): Promise<void> {
    await interaction.showModal(new ReportModal().create());
  }
}
