import { CommandInteraction, InteractionResponse } from 'discord.js';
import { MoveEmbedCreator } from '../embeds/move-embed-creator';
import { NotFoundEmbedCreator } from '../embeds/not-found-embed-creator';
import { SearchResult } from '../models/search/search-result';
import { SearchResultType } from '../models/search/search-result-type';
import { LogSingleton } from '../utils/logs-singleton';
import { MessageCleaner } from '../utils/message-cleaner';
import { BaseInteractionHandler } from './base-interaction-handler';

export class CommandInteractionHandler extends BaseInteractionHandler {
  async handle(interaction: CommandInteraction): Promise<void> {
    if (interaction.commandName == 'framedata') {
      const character = interaction.options.get('character', true).value;
      const move = interaction.options.get('move', true).value;

      const characterMove = this.search.search(`${character} ${move}`);

      if (
        !characterMove ||
        characterMove.type == SearchResultType.MoveNotFound ||
        characterMove.type == SearchResultType.NotFound
      ) {
        await this.sendNoMoveFoundErrorToInteraction(interaction, `${character} ${move}`, characterMove);
      }

      const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);
      await interaction.reply({
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(),
      });
    }

    this.logger.warn(`Command not recognized ${interaction.commandName}`);
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

    LogSingleton.get().warn(`No character or move found for "${content}"`);
    const embeds =
      searchResult.type === SearchResultType.MoveNotFound
        ? NotFoundEmbedCreator.createMoveNotFoundEmbed(searchResult.character, content)
        : NotFoundEmbedCreator.createNotFoundEmbed(content);

    return interaction.reply({ embeds });
  }
}
