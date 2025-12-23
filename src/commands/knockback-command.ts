import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { inject, injectable } from 'inversify';
import { Loader } from '../data/loader';
import { Search } from '../data/search';
import { SearchResult } from '../models/search/search-result';
import { SearchResultType } from '../models/search/search-result-type';
import { KnockbackEmbedCreator } from '../embeds/knockback-embed-creator';
import { LogSingleton } from '../utils/logs-singleton';
import { SearchableCommand } from './searchable-command';

@injectable()
export abstract class KnockbackCommand extends SearchableCommand {
  constructor(search: Search, @inject(Loader) protected loader: Loader) {
    super(search);
  }

  abstract embedCreator: KnockbackEmbedCreator;
  abstract get commandNames(): string[];

  get builders(): SlashCommandBuilder[] {
    return this.commandNames.map<SlashCommandBuilder>((name) => {
      const builder = new SlashCommandBuilder();
      builder
        .setName(name)
        .setDescription('Get the crouch cancel info for a move')
        .addStringOption((option) =>
          option.setName('character').setDescription('The character executing the move').setRequired(true).setAutocomplete(true)
        )
        .addStringOption((option) =>
          option.setName('move').setDescription('The move to look for').setRequired(true).setAutocomplete(true)
        )
        .addStringOption((option) =>
          option.setName('target').setDescription('The character being attacked').setAutocomplete(true)
        );
      return builder;
    });
  }

  async handleCommand(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    const logger = LogSingleton.createContextLogger(interaction);
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

    logger.info(`Replying with knockback information for {character} and {move}`, {
      character: searchResult.character.name,
      move: searchResult.move.name,
      ...(targetCharacter && { target: targetCharacter.name }),
    });

    const embeds = this.embedCreator.create(searchResult.character, searchResult.move, targetCharacter, this.loader);
    await interaction.reply({
      embeds: embeds,
    });
  }
}
