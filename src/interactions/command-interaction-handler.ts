import { CommandInteraction, InteractionResponse } from 'discord.js';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { FailureStore } from '../data/failure-store';
import { Search } from '../data/search';
import { MoveEmbedCreator } from '../embeds/move-embed-creator';
import { NotFoundEmbedCreator } from '../embeds/not-found-embed-creator';
import { SearchResult } from '../models/search/search-result';
import { SearchResultType } from '../models/search/search-result-type';
import { MessageCleaner } from '../utils/message-cleaner';
import { BaseInteractionHandler } from './base-interaction-handler';
import { CrouchCancelEmbedCreator } from '../embeds/crouch-cancel-embed-creator';

@injectable()
export class CommandInteractionHandler extends BaseInteractionHandler {
  constructor(search: Search, @inject(Symbols.Logger) logger: Logger, failureStore: FailureStore) {
    super(search, logger, failureStore);
  }
  async handle(interaction: CommandInteraction): Promise<void> {
    if (interaction.commandName == 'framedata') {
      const searchResult = await this.getSearchResultOrNull(interaction);

      if (!searchResult) {
        return;
      }

      const embedCreator = new MoveEmbedCreator(searchResult.move, searchResult.character);
      await interaction.reply({
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(),
      });
    } else if (interaction.commandName === 'crouchcancel') {
      const searchResult = await this.getSearchResultOrNull(interaction);

      if (!searchResult) {
        return;
      }

      const target = interaction.options.get('target', true).value;
      const targetCharacter = this.search.searchCharacter([target as string]);

      if (target && !targetCharacter) {
        await this.sendNoMoveFoundErrorToInteraction(interaction, `${target} `, new SearchResult(SearchResultType.NotFound));
        return;
      }

      const embeds = CrouchCancelEmbedCreator.create(searchResult.character, searchResult.move, targetCharacter);
      await interaction.reply({
        embeds: embeds,
      });
    } else {
      this.logger.warn(`Command not recognized {commandName}`, { commandName: interaction.commandName });
    }
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
