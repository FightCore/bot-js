import 'reflect-metadata';
import { Container } from 'inversify';
import { DiscordClient } from './discord-client';
import { Loader } from './data/loader';
import { Search } from './data/search';
import { AliasParser } from './data/alias-parser';
import { FailureStore } from './data/failure-store';
import { Logger } from 'winston';
import { LogSingleton } from './utils/logs-singleton';
import { Symbols } from './config/symbols';
import { CommandInteractionHandler } from './interactions/command-interaction-handler';
import { MessageInteractionHandler } from './interactions/message-interaction-handler';
import { ComponentInteractionHandler } from './interactions/component-interaction-handler';
import { RegisterCommands } from './commands/register-commands';
import { ModalInteractionHandler } from './interactions/modal-interaction-handler';
import { Command } from './commands/command';
import { FrameDataCommand } from './commands/frame-data-command';
import { CrouchCancelCommand } from './commands/crouch-cancel-command';
import { ReportCommand } from './commands/report-command';

// Skip base classes doesn't check for the @injectable() annotation.
// Needed to load third party libraries like winston's logger.
const container = new Container({ skipBaseClassChecks: true });
container.bind<FailureStore>(FailureStore).toSelf().inSingletonScope();
container.bind<Logger>(Symbols.Logger).toConstantValue(LogSingleton.create());
container.bind<Loader>(Loader).toSelf().inSingletonScope();
container.bind<AliasParser>(AliasParser).toSelf().inSingletonScope();
container.bind<Search>(Search).toSelf().inSingletonScope();
container.bind<Container>(Container).toConstantValue(container);
container.bind<DiscordClient>(DiscordClient).toSelf();
container.bind<Command>('Command').to(FrameDataCommand);
container.bind<Command>('Command').to(CrouchCancelCommand);
container.bind<Command>('Command').to(ReportCommand);
container.bind<RegisterCommands>(RegisterCommands).toSelf();
container.bind<CommandInteractionHandler>(CommandInteractionHandler).toSelf().inTransientScope();
container.bind<MessageInteractionHandler>(MessageInteractionHandler).toSelf().inTransientScope();
container.bind<ComponentInteractionHandler>(ComponentInteractionHandler).toSelf().inTransientScope();
container.bind<ModalInteractionHandler>(ModalInteractionHandler).toSelf().inTransientScope();

try {
  const client = container.resolve<DiscordClient>(DiscordClient);
  client.login();
} catch {
  // Don't do anything and continue.
}
