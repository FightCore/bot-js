import { injectable } from 'inversify';
import { Command } from './command';
import { SlashCommandBuilder, CommandInteraction, CacheType } from 'discord.js';
import { charactersChoices } from './utils/character-options';
import { Search } from '../data/search';
import { CharacterEmbedCreator } from '../embeds/character-embed-creator';

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
        option
          .setName('character')
          .setDescription('The character to look for')
          .setRequired(true)
          .addChoices(...charactersChoices)
      );
    return [builder];
  }
  async handleCommand(interaction: CommandInteraction<CacheType>): Promise<void> {
    const character = interaction.options.get('character', true).value as string;

    const characterSearch = this.search.search(character);
    const embed = CharacterEmbedCreator.createCharacterEmbed(characterSearch.character);
    await interaction.reply({ embeds: embed });
  }
}
