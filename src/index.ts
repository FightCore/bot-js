import { Message, Client, Intents } from 'discord.js';

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
    if (message.content.includes('ping')) {
      message.reply('pong');
    }
  }
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);
