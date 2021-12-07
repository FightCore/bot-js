import { Message, Client, Intents, Interaction } from 'discord.js';

import { Loader } from './data/loader';
import { Search } from './data/search';
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
  if (message.author.bot) return;

  if (
    message.mentions &&
    message.mentions.users &&
    message.mentions.users.firstKey() === client.user?.id
  ) {
    const keyWords = message.content.split(' ');
    keyWords.shift();
    const search = new Search(dataLoader);
    await message.channel.sendTyping();

    const characterMove = search.search(keyWords.join(' '));
    if (!characterMove) {
      await message.reply('Not found');
      return;
    }

    const embedCreator = new MoveEmbedCreator(
      characterMove.move,
      characterMove.character
    );

    await message.reply({
      embeds: embedCreator.createEmbed(),
      components: embedCreator.createButtons(),
    });
  }
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isButton()) {
    await interaction.update({
      components: [],
    });

    const search = new Search(dataLoader);

    const characterMove = search.search(interaction.customId);

    if (!characterMove) {
      console.log('Move not found for interaction');
      return;
    }

    const embedCreator = new MoveEmbedCreator(
      characterMove.move,
      characterMove.character
    );

    await (interaction.message as Message).reply({
      embeds: embedCreator.createEmbed(),
      components: embedCreator.createButtons(),
    });
  }
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);
