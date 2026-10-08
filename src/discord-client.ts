import { Message, Client, Interaction, PartialMessage, Partials, GatewayIntentBits, Events } from 'discord.js';
import { Container, inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { RegisterCommands } from './shared/commands/register-commands.js';
import { Symbols } from './shared/config/symbols.js';
import { FailureStore } from './shared/data/failure-store.js';
import { Loader } from './shared/data/loader.js';
import { CommandInteractionHandler } from './shared/interactions/command-interaction-handler.js';
import { ComponentInteractionHandler } from './shared/interactions/component-interaction-handler.js';
import { MessageInteractionHandler } from './shared/interactions/message-interaction-handler.js';
import { AutoCompleteInteractionHandler } from './shared/interactions/auto-complete-interaction-handler.js';

@injectable()
export class DiscordClient {
  private client: Client;

  constructor(
    @inject(Loader) private dataLoader: Loader,
    @inject(Symbols.Logger) private logger: Logger,
    private failureStore: FailureStore,
    private container: Container
  ) {
    const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages];

    if (process.env.PREFIX) {
      this.logger.info('Prefix is used, enabling Message Content intent');
      intents.push(GatewayIntentBits.MessageContent);
    }

    this.dataLoader.ensureLoaded();
    this.client = new Client({
      intents: intents,
      partials: [Partials.Channel],
    });

    this.client.on(Events.MessageCreate, this.handleMessage.bind(this));
    this.client.on(Events.InteractionCreate, this.handleInteraction.bind(this));
    this.client.on(Events.MessageUpdate, this.handleMessageUpdate.bind(this));

    this.client.once('clientReady', async () => {
      this.logger.info('Client ready!');
      this.container.bind<Client>(Symbols.Client).toConstantValue(this.client);
      this.container.get<RegisterCommands>(RegisterCommands).register();
    });
  }

  public login(): void {
    this.client.login(process.env.TOKEN);
  }

  private async handleInteraction(interaction: Interaction): Promise<void> {
    const commandInteractionHandler = this.container.get<CommandInteractionHandler>(CommandInteractionHandler);
    const componentInteractionHandler = this.container.get<ComponentInteractionHandler>(ComponentInteractionHandler);
    const autoCompleteInteractionHandler = this.container.get<AutoCompleteInteractionHandler>(AutoCompleteInteractionHandler);
    try {
      if (
        !interaction.isButton() &&
        !interaction.isStringSelectMenu() &&
        !interaction.isCommand() &&
        !interaction.isModalSubmit() &&
        !interaction.isAutocomplete()
      ) {
        this.logger.warn('Interaction not supported');
        return;
      }

      if (interaction.isChatInputCommand()) {
        await commandInteractionHandler.handle(interaction);
        return;
      }

      if (interaction.isButton() || interaction.isStringSelectMenu()) {
        await componentInteractionHandler.handle(interaction);
      }

      if (interaction.isAutocomplete()) {
        await autoCompleteInteractionHandler.handle(interaction);
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
    const handler = this.container.get<MessageInteractionHandler>(MessageInteractionHandler);
    await handler.handleMessage(message as Message<boolean>, false);
  }

  private async handleMessageUpdate(
    _oldMessage: Message<boolean> | PartialMessage,
    newMessage: Message<boolean> | PartialMessage
  ): Promise<void> {
    if (!this.failureStore.contains(newMessage.id)) {
      return;
    }
    const handler = this.container.get<MessageInteractionHandler>(MessageInteractionHandler);
    await handler.handleMessage(newMessage as Message<boolean>, true);
  }
}
