import { Message, Client, Interaction, PartialMessage, Partials, GatewayIntentBits } from 'discord.js';
import { RegisterCommands } from './commands/register-commands';
import { FailureStore } from './data/failure-store';
import { Loader } from './data/loader';
import { CommandInteractionHandler } from './interactions/command-interaction-handler';
import { ComponentInteractionHandler } from './interactions/component-interaction-handler';
import { MessageInteractionHandler } from './interactions/message-interaction-handler';
import { LogSingleton } from './utils/logs-singleton';

export class DiscordClient {
  private client: Client;
  private dataLoader = new Loader();

  constructor() {
    const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages];

    if (process.env.PREFIX) {
      LogSingleton.get().info('Prefix is used, enabling Message Content');
      intents.push(GatewayIntentBits.MessageContent);
    }

    this.dataLoader.load();
    this.client = new Client({
      intents: intents,
      partials: [Partials.Channel],
    });

    this.client.on('messageCreate', this.handleMessage.bind(this));
    this.client.on('interactionCreate', this.handleInteraction.bind(this));
    this.client.on('messageUpdate', this.handleMessageUpdate.bind(this));

    // When the client is ready, run this code (only once)
    this.client.once('ready', () => {
      LogSingleton.get().info('Client ready!');
      RegisterCommands.register(this.client).then(() => LogSingleton.get().info('Registered slash commands'));
    });
  }

  public login(): void {
    this.client.login(process.env.TOKEN);
  }

  private async handleInteraction(interaction: Interaction) {
    const commandInteractionHandler = new CommandInteractionHandler(this.dataLoader);
    const componentInteractionHandler = new ComponentInteractionHandler(this.dataLoader);
    try {
      if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isCommand()) {
        LogSingleton.get().warn('Interaction not supported');
        return;
      }

      if (interaction.isCommand()) {
        await commandInteractionHandler.handle(interaction);
        return;
      }

      if (interaction.isButton() || interaction.isStringSelectMenu()) {
        componentInteractionHandler.handle(interaction);
      }
    } catch (error) {
      if (interaction.isButton() || interaction.isStringSelectMenu()) {
        await componentInteractionHandler.handleError(error, interaction.message);
      } else if (interaction.isCommand()) {
        await commandInteractionHandler.handleError(error, interaction);
      }
    }
  }

  private async handleMessage(message: Message<boolean> | PartialMessage): Promise<void> {
    const handler = new MessageInteractionHandler(this.dataLoader, this.client);
    await handler.handleMessage(message as Message<boolean>, false);
  }

  private async handleMessageUpdate(
    _oldMessage: Message<boolean> | PartialMessage,
    newMessage: Message<boolean> | PartialMessage
  ): Promise<void> {
    const failureStore = FailureStore.get();
    if (!failureStore.contains(newMessage.id)) {
      return;
    }
    const handler = new MessageInteractionHandler(this.dataLoader, this.client);
    await handler.handleMessage(newMessage as Message<boolean>, true);
  }
}
