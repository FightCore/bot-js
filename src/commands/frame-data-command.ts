import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { inject, injectable } from 'inversify';
import { Loader } from '../data/loader.js';
import { Search } from '../data/search.js';
import { MoveEmbedCreator } from '../embeds/move-embed-creator.js';
import { LogSingleton } from '../utils/logs-singleton.js';
import { SearchableCommand } from './searchable-command.js';

@injectable()
export class FrameDataCommand extends SearchableCommand {
  constructor(search: Search, @inject(Loader) private loader: Loader) {
    super(search);
  }
  get commandNames(): string[] {
    return ['framedata'];
  }
  get builders(): SlashCommandBuilder[] {
    const builder = new SlashCommandBuilder();
    builder
      .setName('framedata')
      .setDescription('Get the frame data from the specified character and move')
      .addStringOption((option) =>
        option.setName('character').setDescription('The character to get the move for').setRequired(true).setAutocomplete(true)
      )
      .addStringOption((option) =>
        option.setName('move').setDescription('The move to look for').setRequired(true).setAutocomplete(true)
      );
    return [builder];
  }
  async handleCommand(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    const logger = LogSingleton.createContextLogger(interaction);
    const searchResult = await this.getSearchResultOrNull(interaction);

    if (!searchResult) {
      return;
    }

    const embedCreator = new MoveEmbedCreator(searchResult.move, searchResult.character);
    logger.info(`Replying with {character} and {move}`, {
      character: searchResult.character.name,
      move: searchResult.move.name,
    });
    await interaction.reply({
      embeds: embedCreator.createEmbed(),
      components: embedCreator.createButtons(),
    });
  }
}
