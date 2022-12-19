import { SlashCommandBuilder } from 'discord.js';

export class MoveSlashCommand {
  static create(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder();
    builder
      .setName('framedata')
      .setDescription('Get the frame data from the specified character and move')
      .addStringOption((option) =>
        option
          .setName('character')
          .setDescription('The character to get the move for')
          .setRequired(true)
          .addChoices(
            { name: 'Bowser', value: 'bowser' },
            { name: 'Captain Falcon', value: 'falcon' },
            { name: 'Dr Mario', value: 'drmario' },
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
            { name: 'Zelda', value: 'zelda' }
          )
      )
      .addStringOption((option) => option.setName('move').setDescription('The move to look for').setRequired(true));
    return builder;
  }
}
