import { Message, Client, Interaction, PartialMessage, Partials, GatewayIntentBits } from 'discord.js';
import { Container, inject } from 'inversify';
import { injectable } from 'inversify/lib/annotation/injectable';
import { Logger } from 'winston';
import { RegisterCommands } from './commands/register-commands';
import { Symbols } from './config/symbols';
import { FailureStore } from './data/failure-store';
import { Loader } from './data/loader';
import { CommandInteractionHandler } from './interactions/command-interaction-handler';
import { ComponentInteractionHandler } from './interactions/component-interaction-handler';
import { MessageInteractionHandler } from './interactions/message-interaction-handler';
import { ModalInteractionHandler } from './interactions/modal-interaction-handler';

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

    this.client.on('messageCreate', this.handleMessage.bind(this));
    this.client.on('interactionCreate', this.handleInteraction.bind(this));
    this.client.on('messageUpdate', this.handleMessageUpdate.bind(this));

    this.client.once('ready', async () => {
      this.logger.info('Client ready!');
      this.container.bind<Client>(Symbols.Client).toConstantValue(this.client);
      this.container.get<RegisterCommands>(RegisterCommands).register();
    });
  }

  public login(): void {
    this.client.login(process.env.TOKEN);
  }

  private async handleInteraction(interaction: Interaction): Promise<void> {
    const commandInteractionHandler = this.container.resolve<CommandInteractionHandler>(CommandInteractionHandler);
    const componentInteractionHandler = this.container.resolve<ComponentInteractionHandler>(ComponentInteractionHandler);
    const modalInteractionHandler = this.container.resolve<ModalInteractionHandler>(ModalInteractionHandler);
    try {
      if (
        !interaction.isButton() &&
        !interaction.isStringSelectMenu() &&
        !interaction.isCommand() &&
        !interaction.isModalSubmit()
      ) {
        this.logger.warn('Interaction not supported');
        return;
      }

      if (interaction.isCommand()) {
        await commandInteractionHandler.handle(interaction);
        return;
      }

      if (interaction.isButton() || interaction.isStringSelectMenu()) {
        await componentInteractionHandler.handle(interaction);
      }

      if (interaction.isModalSubmit()) {
        await modalInteractionHandler.handle(interaction);
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
    const handler = this.container.resolve<MessageInteractionHandler>(MessageInteractionHandler);
    await handler.handleMessage(message as Message<boolean>, false);
  }

  private async handleMessageUpdate(
    _oldMessage: Message<boolean> | PartialMessage,
    newMessage: Message<boolean> | PartialMessage
  ): Promise<void> {
    if (!this.failureStore.contains(newMessage.id)) {
      return;
    }
    const handler = this.container.resolve<MessageInteractionHandler>(MessageInteractionHandler);
    await handler.handleMessage(newMessage as Message<boolean>, true);
  }
}
