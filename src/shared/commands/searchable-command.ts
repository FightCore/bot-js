import { ChatInputCommandInteraction, InteractionResponse, SlashCommandBuilder } from 'discord.js';
import { injectable } from 'inversify';
import { Command } from './command.js';
import { SearchResultType } from '../models/search/search-result-type.js';
import { NotFoundEmbedCreator } from '../embeds/not-found-embed-creator.js';
import { MessageCleaner } from '../utils/message-cleaner.js';
import { LogSingleton } from '../utils/logs-singleton.js';
import { FullSearch } from '../search/full-search.js';
import { SearchResult } from '../search/search-result.js';

const MAX_CONTENT_LENGTH = 75;

@injectable()
export abstract class SearchableCommand implements Command {
  constructor(protected search: FullSearch) {}

  abstract get commandNames(): string[];
  abstract get builders(): SlashCommandBuilder[];
  abstract handleCommand(interaction: ChatInputCommandInteraction): Promise<void>;

  protected async getSearchResultOrNull(interaction: ChatInputCommandInteraction): Promise<SearchResult | null> {
    const character = interaction.options.get('character', true).value;
    const move = interaction.options.get('move', true).value;

    const characterMove = this.search.search(`${character} ${move}`);

    if (
      !characterMove ||
      characterMove.type === SearchResultType.MoveNotFound ||
      characterMove.type === SearchResultType.NotFound
    ) {
      await this.sendNoMoveFoundErrorToInteraction(interaction, `${character} ${move}`, characterMove);
      return null;
    }

    return characterMove;
  }

  protected sendNoMoveFoundErrorToInteraction(
    interaction: ChatInputCommandInteraction,
    content: string,
    searchResult: SearchResult
  ): Promise<InteractionResponse> {
    const logger = LogSingleton.createContextLogger(interaction);

    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.substring(0, MAX_CONTENT_LENGTH) + '...';
    }

    content = MessageCleaner.removeIllegalCharacters(content);

    logger.warn(`No character or move found for "{content}"`, { content });

    const embeds =
      searchResult.type === SearchResultType.MoveNotFound
        ? NotFoundEmbedCreator.createMoveNotFoundEmbed(searchResult.character!, content)
        : NotFoundEmbedCreator.createNotFoundEmbed(content);

    return interaction.reply({ embeds });
  }
}
