import { SlashCommandBuilder, CommandInteraction, CacheType, InteractionResponse } from 'discord.js';
import { Command } from './command';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { FailureStore } from '../data/failure-store';
import { Loader } from '../data/loader';
import { Search } from '../data/search';
import { MoveEmbedCreator } from '../embeds/move-embed-creator';
import { NotFoundEmbedCreator } from '../embeds/not-found-embed-creator';
import { SearchResult } from '../models/search/search-result';
import { SearchResultType } from '../models/search/search-result-type';
import { MessageCleaner } from '../utils/message-cleaner';

@injectable()
export class FrameDataCommand implements Command {
  constructor(
    private search: Search,
    @inject(Symbols.Logger) private logger: Logger,
    private failureStore: FailureStore,
    @inject(Loader) private loader: Loader
  ) {}
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
      .addStringOption((option) => option.setName('move').setDescription('The move to look for').setRequired(true));
    return [builder];
  }
  async handleCommand(interaction: CommandInteraction<CacheType>): Promise<void> {
    const searchResult = await this.getSearchResultOrNull(interaction);

    if (!searchResult) {
      return;
    }

    const embedCreator = new MoveEmbedCreator(searchResult.move, searchResult.character);
    this.logger.info(`Replying with {character} and {move}`, {
      character: searchResult.character.name,
      move: searchResult.move.name,
    });
    await interaction.reply({
      embeds: embedCreator.createEmbed(),
      components: embedCreator.createButtons(),
    });
  }

  private sendNoMoveFoundErrorToInteraction(
    interaction: CommandInteraction,
    content: string,
    searchResult: SearchResult
  ): Promise<InteractionResponse> {
    if (content.length > 75) {
      content = content.substring(0, 75) + '...';
    }

    content = MessageCleaner.removeIllegalCharacters(content);

    this.logger.warn(`No character or move found for "{content}"`, { content });
    const embeds =
      searchResult.type === SearchResultType.MoveNotFound
        ? NotFoundEmbedCreator.createMoveNotFoundEmbed(searchResult.character, content)
        : NotFoundEmbedCreator.createNotFoundEmbed(content);

    return interaction.reply({ embeds });
  }

  private async getSearchResultOrNull(interaction: CommandInteraction): Promise<SearchResult | null> {
    const character = interaction.options.get('character', true).value;
    const move = interaction.options.get('move', true).value;

    const characterMove = this.search.search(`${character} ${move}`);

    if (
      !characterMove ||
      characterMove.type == SearchResultType.MoveNotFound ||
      characterMove.type == SearchResultType.NotFound
    ) {
      await this.sendNoMoveFoundErrorToInteraction(interaction, `${character} ${move}`, characterMove);
      return null;
    }

    return characterMove;
  }
}
