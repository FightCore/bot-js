import { SlashCommandBuilder, CommandInteraction, CacheType, InteractionResponse } from 'discord.js';
import { Command } from './command';
import { charactersChoices } from './utils/character-options';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { Loader } from '../data/loader';
import { Search } from '../data/search';
import { NotFoundEmbedCreator } from '../embeds/not-found-embed-creator';
import { SearchResult } from '../models/search/search-result';
import { SearchResultType } from '../models/search/search-result-type';
import { MessageCleaner } from '../utils/message-cleaner';
import { KnockbackEmbedCreator } from '../embeds/knockback-embed-creator';

@injectable()
export abstract class KnockbackCommand implements Command {
  constructor(private search: Search, @inject(Symbols.Logger) private logger: Logger, @inject(Loader) private loader: Loader) {}

  abstract embedCreator: KnockbackEmbedCreator;
  abstract get commandNames(): string[];

  get builders(): SlashCommandBuilder[] {
    return this.commandNames.map<SlashCommandBuilder>((name) => {
      const builder = new SlashCommandBuilder();
      builder
        .setName(name)
        .setDescription('Get the crouch cancel info for a move')
        .addStringOption((option) =>
          option
            .setName('character')
            .setDescription('The character executing the move')
            .setRequired(true)
            .addChoices(...charactersChoices)
        )
        .addStringOption((option) => option.setName('move').setDescription('The move to look for').setRequired(true))
        .addStringOption((option) =>
          option
            .setName('target')
            .setDescription('The character being attacked')
            .addChoices(...charactersChoices)
        );
      return builder;
    });
  }

  async handleCommand(interaction: CommandInteraction<CacheType>): Promise<void> {
    const searchResult = await this.getSearchResultOrNull(interaction);

    if (!searchResult) {
      return;
    }

    const target = interaction.options.get('target', false)?.value;
    const targetCharacter = this.search.searchCharacter([target as string]);

    if (target && !targetCharacter) {
      await this.sendNoMoveFoundErrorToInteraction(interaction, `${target} `, new SearchResult(SearchResultType.NotFound));
      return;
    }

    if (target && targetCharacter) {
      this.logger.info(`Replying with crouch cancel information for {character} and {move} with target {target}`, {
        character: searchResult.character.name,
        move: searchResult.move.name,
        target: targetCharacter?.name,
      });
    } else {
      this.logger.info(`Replying with crouch cancel information for {character} and {move}`, {
        character: searchResult.character.name,
        move: searchResult.move.name,
      });
    }
    const embeds = this.embedCreator.create(searchResult.character, searchResult.move, targetCharacter, this.loader);
    await interaction.reply({
      embeds: embeds,
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
