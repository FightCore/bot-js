import { injectable } from 'inversify';
import { Command } from '../../shared/commands/command.js';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { Search } from '../../shared/data/search.js';
import { CharacterEmbedCreator } from './character-embed-creator.js';
import { SearchResultType } from '../../shared/models/search/search-result-type.js';

@injectable()
export class CharacterCommand implements Command {
  constructor(private readonly search: Search) {}
  get commandNames(): string[] {
    return ['character'];
  }
  get builders(): SlashCommandBuilder[] {
    const builder = new SlashCommandBuilder();
    builder
      .setName('character')
      .setDescription('Get the information about a specific character.')
      .addStringOption((option) =>
        option.setName('character').setDescription('The character to look for').setRequired(true).setAutocomplete(true)
      );
    return [builder];
  }
  async handleCommand(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    const character = interaction.options.get('character', true).value as string;

    const characterSearch = this.search.search(character);
    if (characterSearch.type === SearchResultType.Character) {
      const embed = CharacterEmbedCreator.createCharacterEmbed(characterSearch.character);
      await interaction.reply({ embeds: embed });
    }
  }
}
