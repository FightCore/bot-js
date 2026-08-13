import 'reflect-metadata';
import { Container } from 'inversify';
import { DiscordClient } from './discord-client.js';
import { Loader } from './data/loader.js';
import { Search } from './data/search.js';
import { AliasParser } from './data/alias-parser.js';
import { FailureStore } from './data/failure-store.js';
import { Logger } from 'winston';
import { LogSingleton } from './utils/logs-singleton.js';
import { Symbols } from './config/symbols.js';
import { CommandInteractionHandler } from './interactions/command-interaction-handler.js';
import { MessageInteractionHandler } from './interactions/message-interaction-handler.js';
import { ComponentInteractionHandler } from './interactions/component-interaction-handler.js';
import { RegisterCommands } from './commands/register-commands.js';
import { ModalInteractionHandler } from './interactions/modal-interaction-handler.js';
import { Command } from './commands/command.js';
import { FrameDataCommand } from './commands/frame-data-command.js';
import { CrouchCancelCommand } from './commands/crouch-cancel-command.js';
import { ReportCommand } from './commands/report-command.js';
import { ASDIDownCommand } from './commands/asdi-down-command.js';
import { CharacterCommand } from './commands/character-command.js';
import { AutoCompleteInteractionHandler } from './interactions/auto-complete-interaction-handler.js';

const container = new Container();
container.bind<FailureStore>(FailureStore).toSelf().inSingletonScope();
container.bind<Logger>(Symbols.Logger).toConstantValue(LogSingleton.getLogger());
container.bind<Loader>(Loader).toSelf().inSingletonScope();
container.bind<AliasParser>(AliasParser).toSelf().inSingletonScope();
container.bind<Search>(Search).toSelf().inSingletonScope();
container.bind<Container>(Container).toConstantValue(container);
container.bind<DiscordClient>(DiscordClient).toSelf();
container.bind<Command>('Command').to(FrameDataCommand);
container.bind<Command>('Command').to(CrouchCancelCommand);
container.bind<Command>('Command').to(ReportCommand);
container.bind<Command>('Command').to(ASDIDownCommand);
container.bind<Command>('Command').to(CharacterCommand);
container.bind<RegisterCommands>(RegisterCommands).toSelf();
container.bind<CommandInteractionHandler>(CommandInteractionHandler).toSelf().inTransientScope();
container.bind<MessageInteractionHandler>(MessageInteractionHandler).toSelf().inTransientScope();
container.bind<AutoCompleteInteractionHandler>(AutoCompleteInteractionHandler).toSelf().inTransientScope();
container.bind<ComponentInteractionHandler>(ComponentInteractionHandler).toSelf().inTransientScope();
container.bind<ModalInteractionHandler>(ModalInteractionHandler).toSelf().inTransientScope();

try {
  const client = container.get<DiscordClient>(DiscordClient);
  client.login();
} catch {
  // Don't do anything and continue.
}
