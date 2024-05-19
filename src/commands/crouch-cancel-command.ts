import { APIApplicationCommandOptionChoice, SlashCommandBuilder } from 'discord.js';

export class CrouchCancelCommand {
  private static charactersChoices: APIApplicationCommandOptionChoice<string>[] = [
    { name: 'Bowser', value: 'bowser' },
    { name: 'Captain Falcon', value: 'falcon' },
    { name: 'Dr Mario', value: 'drmario' },
    { name: 'Donkey Kong', value: 'donkeykong' },
    { name: 'Falco', value: 'falco' },
    { name: 'Fox', value: 'fox' },
    { name: 'Ganondorf', value: 'ganondorf' },
    { name: 'Ice Climbers', value: 'iceclimbers' },
    { name: 'Jigglypuff', value: 'jigglypuff' },
    { name: 'Kirby', value: 'kirby' },
    { name: 'Link', value: 'luigi' },
    { name: 'Mario', value: 'mario' },
    { name: 'Marth', value: 'marth' },
    { name: 'Mewtwo', value: 'mewtwo' },
    { name: 'Mr. Game & Watch', value: 'g&w' },
    { name: 'Ness', value: 'ness' },
    { name: 'Peach', value: 'peach' },
    { name: 'Pichu', value: 'pichu' },
    { name: 'Pikachu', value: 'pikachu' },
    { name: 'Roy', value: 'roy' },
    { name: 'Samus', value: 'samus' },
    { name: 'Sheik', value: 'sheik' },
    { name: 'Yoshi', value: 'yoshi' },
    { name: 'Young Link', value: 'ylink' },
    { name: 'Zelda', value: 'zelda' },
  ];

  static create(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder();
    builder
      .setName('crouchcancel')
      .setDescription('Get the crouch cancel info for a move')
      .addStringOption((option) =>
        option
          .setName('character')
          .setDescription('The character executing the move')
          .setRequired(true)
          .addChoices(...this.charactersChoices)
      )
      .addStringOption((option) => option.setName('move').setDescription('The move to look for').setRequired(true))
      .addStringOption((option) =>
        option
          .setName('target')
          .setDescription('The character being attacked')
          .addChoices(...this.charactersChoices)
      );

    return builder;
  }
}
