import { Message, Client, Intents, Interaction, PartialMessage, MessageMentions } from 'discord.js';
import { FailureStore } from './data/failure-store';
import { Loader } from './data/loader';
import { Search } from './data/search';
import { CharacterEmbedCreator } from './embeds/character-embed-creator';
import { ErrorEmbedCreator } from './embeds/error-embed-creator';
import { MoveEmbedCreator } from './embeds/move-embed-creator';
import { NotFoundEmbedCreator } from './embeds/not-found-embed-creator';
import { LogSingleton } from './utils/logs-singleton';
import { MessageCleaner } from './utils/message-cleaner';

export class DiscordClient {
  private client: Client;
  private dataLoader = new Loader();

  constructor() {
    this.dataLoader.load();
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
      partials: ['CHANNEL'],
    });

    this.client.on('messageCreate', this.handleMessage.bind(this));
    this.client.on('interactionCreate', this.handleInteraction.bind(this));
    this.client.on('messageUpdate', this.handleMessageUpdate.bind(this));

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

      let isFromOriginalUser = false;
      const messageMentions = interaction.message.mentions as MessageMentions;
      if (messageMentions === null || messageMentions.repliedUser?.id === interaction.user.id) {
        isFromOriginalUser = true;
      }

      if (isFromOriginalUser) {
        await interaction.update({
          components: [],
        });
        FailureStore.get().remove(interaction.message.id);
      } else {
        await interaction.deferUpdate();
      }

      const search = new Search(this.dataLoader);
      const characterMove = search.search(interaction.isSelectMenu() ? interaction.values[0] : interaction.customId);
      if (!characterMove || !characterMove.move) {
        LogSingleton.get().error('Move not found for interaction');
        return;
      }

      const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);

      await interaction.followUp({
        ephemeral: !isFromOriginalUser,
        embeds: embedCreator.createEmbed(),
        components: embedCreator.createButtons(),
      });
    } catch (error) {
      if (!interaction.isButton() && !interaction.isSelectMenu()) {
        return;
      }

      await this.handleError(error, interaction.message as Message);
    }
  }

  private async handleMessageUpdate(
    _oldMessage: Message<boolean> | PartialMessage,
    newMessage: Message<boolean> | PartialMessage
  ): Promise<void> {
    const failureStore = FailureStore.get();
    if (!failureStore.contains(newMessage.id)) {
      return;
    }

    await this.handleMessage(newMessage as Message<boolean>, true);
  }

  private async handleMessage(message: Message, isUpdate = false): Promise<void> {
    const failureStore = FailureStore.get();
    try {
      const messageSearchResult = MessageCleaner.containMention(message, this.client);
      if (!messageSearchResult.shouldRespond) {
        return;
      }
      await message.channel.sendTyping();

      // Replace the content of the message with just the search query and no user tag.
      let modifiedMessage = MessageCleaner.removeMention(message, messageSearchResult);

      const search = new Search(this.dataLoader);

      const characterMove = search.search(modifiedMessage);
      if (!characterMove || characterMove.noMovesFound) {
        if (modifiedMessage.length > 75) {
          modifiedMessage = modifiedMessage.substring(0, 75) + '...';
        }

        modifiedMessage = MessageCleaner.removeIllegalCharacters(modifiedMessage);

        LogSingleton.get().warn(`No character or move found for "${modifiedMessage}"`);
        const embeds = characterMove?.character
          ? NotFoundEmbedCreator.createMoveNotFoundEmbed(characterMove.character, modifiedMessage)
          : NotFoundEmbedCreator.createNotFoundEmbed(modifiedMessage);
        if (isUpdate) {
          const botMessageId = failureStore.get(message.id);
          if (botMessageId) {
            const botMessage = await message.channel.messages.fetch(botMessageId);
            await botMessage.edit({ embeds });
          }
        } else {
          const replyMessage = await message.reply({ embeds });
          failureStore.add(message.id, replyMessage.id);
        }

        return;
      }

      if (!characterMove.move) {
        await message.reply({ embeds: CharacterEmbedCreator.createCharacterEmbed(characterMove.character) });
        return;
      }

      // Create the move embed.
      const embedCreator = new MoveEmbedCreator(characterMove.move, characterMove.character);

      if (isUpdate) {
        LogSingleton.get().info(`Updating existing to ${characterMove.character.name} and ${characterMove.move.name}`);

        const botMessageId = failureStore.get(message.id);
        if (botMessageId) {
          const botMessage = await message.channel.messages.fetch(botMessageId);
          const replyMessage = await botMessage.edit({
            embeds: embedCreator.createEmbed(),
            components: embedCreator.createButtons(characterMove.possibleMoves),
          });

          if (replyMessage.components.length > 0) {
            failureStore.add(message.id, replyMessage.id);
          } else {
            failureStore.remove(message.id);
          }
        }
      } else {
        LogSingleton.get().info(`Replying with ${characterMove.character.name} and ${characterMove.move.name}`);
        const replyMessage = await message.reply({
          embeds: embedCreator.createEmbed(),
          components: embedCreator.createButtons(characterMove.possibleMoves),
        });

        // If there are any components, see it as a bad message.
        if (replyMessage.components.length > 0) {
          failureStore.add(message.id, replyMessage.id);
        }
      }
    } catch (error) {
      await this.handleError(error, message);
    }
  }

  private async handleError(error: unknown, message: Message): Promise<void> {
    try {
      LogSingleton.get().error(error);
      await message.reply({
        embeds: ErrorEmbedCreator.createErrorEmbed(),
      });
    } catch {
      LogSingleton.get().error(`An internal error occurred when trying to respond with an error.`);
    }
  }
}
