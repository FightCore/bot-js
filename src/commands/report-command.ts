import { SlashCommandBuilder, CommandInteraction, CacheType } from 'discord.js';
import { Command } from './command';
import { ReportModal } from '../modals/report-embed';
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
