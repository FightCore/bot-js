import { Message, Client, Intents, Interaction } from 'discord.js';
import { Loader } from './data/loader';
import { Search } from './data/search';
import { ErrorEmbedCreator } from './embeds/error-embed-creator';
import { MoveEmbedCreator } from './embeds/move-embed-creator';
import { NotFoundEmbedCreator } from './embeds/not-found-embed-creator';
import { LogSingleton } from './utils/logs-singleton';
import { MessageCleaner } from './utils/message-cleaner';

export class DiscordClient {
  private client: Client;
  private dataLoader = new Loader();
  /**
   *
   */
  constructor() {
    this.dataLoader.load();
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
      partials: ['CHANNEL'],
    });

    this.client.on('messageCreate', this.handleMessage.bind(this));
    this.client.on('interactionCreate', this.handleInteraction.bind(this));

    // When the client is ready, run this code (only once)
    this.client.once('ready', () => {
      LogSingleton.get().info('Client ready!');
    });
  }

  public login(): void {
    // Login to Discord with your client's token
    this.client.login(process.env.TOKEN);
  }

  private async handleInteraction(interaction: Interaction) {
    try {
      if (!interaction.isButton() && !interaction.isSelectMenu()) {
        return;
      }
      await interaction.update({
        components: [],
      });

      const search = new Search(this.dataLoader);
      const characterMove = search.search(interaction.isSelectMenu() ? interaction.values[0] : interaction.customId);

      if (!characterMove || !characterMove.move) {
        LogSingleton.get().error('Move not found for interaction');
        return;
      }

      const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);

      await (interaction.message as Message).edit({
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(),
      });
    } catch (error) {
      try {
        if (!interaction.isButton() && !interaction.isSelectMenu()) {
          return;
        }

        LogSingleton.get().error(error);
        await (interaction.message as Message).reply({
          embeds: ErrorEmbedCreator.createErrorEmbed(),
        });
      } catch {
        LogSingleton.get().error(`An internal error ocurred when trying to respond with an error.`);
      }
    }
  }

  private async handleMessage(message: Message) {
    try {
      if (!MessageCleaner.containMention(message, this.client)) {
        return;
      }

      // Replace the content of the message with just the search query and no user tag.
      let modifiedMessage = MessageCleaner.removeMention(message, this.client);

      const search = new Search(this.dataLoader);
      await message.channel.sendTyping();

      const characterMove = search.search(modifiedMessage);
      if (!characterMove?.move) {
        if (modifiedMessage.length > 75) {
          modifiedMessage = modifiedMessage.substring(0, 75) + '...';
        }

        modifiedMessage = MessageCleaner.removeIllegalCharacters(modifiedMessage);

        LogSingleton.get().warn(`No character or move found for "${modifiedMessage}"`);
        const embed = characterMove?.character
          ? NotFoundEmbedCreator.createMoveNotFoundEmbed(characterMove.character, modifiedMessage)
          : NotFoundEmbedCreator.createNotFoundEmbed(modifiedMessage);
        await message.reply({ embeds: embed });
        return;
      }

      // Create the move embed.
      const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);

      LogSingleton.get().info(`Replying with ${characterMove.character.name} and ${characterMove.move.name}`);

      await message.reply({
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(characterMove.possibleMoves),
      });
    } catch (error) {
      try {
        LogSingleton.get().error(error);
        await message.reply({
          embeds: ErrorEmbedCreator.createErrorEmbed(),
        });
      } catch {
        LogSingleton.get().error(`An internal error ocurred when trying to respond with an error.`);
      }
    }
  }
}
