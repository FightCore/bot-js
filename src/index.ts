import { Message, Client, Intents, Interaction } from 'discord.js';
import { Loader } from './data/loader';
import { Search } from './data/search';
import { MoveEmbedCreator } from './embeds/move-embed-creator';

const dataLoader = new Loader();
dataLoader.load();

// Create a new client instance
// Add the GUILD, DIRECT_MESSAGES and GUILD_MESSAGES to allow both DMs and
// @ messages from within the servers.
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
  partials: ['CHANNEL'],
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  if (!message.mentions || !message.mentions.users || message.mentions.users.firstKey() !== client.user?.id) {
    return;
  }

  // Replace the content of the message with just the search query and no user tag.
  const modifiedMessage = message.content.replace(`<@!${client.user?.id}> `, '');

  const search = new Search(dataLoader);
  await message.channel.sendTyping();

  const characterMove = search.search(modifiedMessage);
  if (!characterMove) {
    console.log(`No character or move found for ${modifiedMessage}`);
    await message.reply('Not found');
    return;
  }

  // Create the move embed.
  const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);

  console.log(`Replying with ${characterMove.character.name} and ${characterMove.move.name}`);

  await message.reply({
    embeds: embedCreator.createEmbed(),
    components: embedCreator.createButtons(characterMove.possibleMoves),
  });
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isButton() || interaction.isSelectMenu()) {
    await interaction.update({
      components: [],
    });

    const search = new Search(dataLoader);
    const characterMove = search.search(interaction.isSelectMenu() ? interaction.values[0] : interaction.customId);

    if (!characterMove) {
      console.log('Move not found for interaction');
      return;
    }

    const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);

    await (interaction.message as Message).edit({
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
