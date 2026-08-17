import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { inject, injectable } from 'inversify';
import { Loader } from '../../shared/data/loader.js';
import { SearchResultType } from '../../shared/models/search/search-result-type.js';
import { KnockbackEmbedCreator } from './knockback-embed-creator.js';
import { LogSingleton } from '../../shared/utils/logs-singleton.js';
import { SearchableCommand } from '../../shared/commands/searchable-command.js';
import { FullSearch } from '../../shared/search/full-search.js';

@injectable()
export abstract class KnockbackCommand extends SearchableCommand {
  constructor(
    search: FullSearch,
    @inject(Loader) protected loader: Loader
  ) {
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
      await this.sendNoMoveFoundErrorToInteraction(interaction, `${target} `, {
        type: SearchResultType.NotFound,
        character: null!,
        move: null!,
        possibleMoves: [],
      });
      return;
    }

    logger.info(`Replying with knockback information for {character} and {move}`, {
      character: searchResult.character!.name,
      move: searchResult.move!.name,
      ...(targetCharacter && { target: targetCharacter.name }),
    });

    const embeds = this.embedCreator.create(searchResult.character!, searchResult.move!, targetCharacter, this.loader);
    await interaction.reply({
      embeds: embeds,
    });
  }
}
