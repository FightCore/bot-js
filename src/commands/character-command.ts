import { injectable } from 'inversify';
import { Command } from './command.js';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { Search } from '../data/search.js';
import { CharacterEmbedCreator } from '../embeds/character-embed-creator.js';

@injectable()
export class CharacterCommand implements Command {
  constructor(private search: Search) {}
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
    const embed = CharacterEmbedCreator.createCharacterEmbed(characterSearch.character);
    await interaction.reply({ embeds: embed });
  }
}
