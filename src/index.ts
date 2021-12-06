import { Message, Client, Intents, Interaction } from 'discord.js';

import { Loader } from './data/loader';
import { MoveEmbedCreator } from './embeds/move-embed-creator';

const dataLoader = new Loader();
dataLoader.load();

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
  partials: ['CHANNEL'],
});

client.on('messageCreate', async (message: Message) => {
  if (
    message.mentions &&
    message.mentions.users &&
    message.mentions.users.firstKey() === client.user?.id
  ) {
    const keyWords = message.content.split(' ');
    const characters = dataLoader.data;
    const character = characters.find(
      (localCharacter) => localCharacter.normalizedName === keyWords[1]
    );

    if (character) {
      const move = character.moves.find(
        (localMove) => localMove.normalizedName === keyWords[2]
      );
      if (move) {
        await message.reply({
          embeds: new MoveEmbedCreator(move, character).create(),
        });
        return;
      }
    }

    await message.reply('Not found');
  }
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isButton()) {
    await interaction.update({
      components: [],
    });
    await (interaction.message as Message).reply({ content: 'Test!' });
  }
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);
