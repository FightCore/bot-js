import 'reflect-metadata';
import { Container } from 'inversify';
import { DiscordClient } from './discord-client.js';
import { Loader } from './shared/data/loader.js';
import { Search } from './shared/data/search.js';
import { AliasParser } from './shared/data/alias-parser.js';
import { FailureStore } from './shared/data/failure-store.js';
import { Logger } from 'winston';
import { LogSingleton } from './shared/utils/logs-singleton.js';
import { Symbols } from './shared/config/symbols.js';
import { CommandInteractionHandler } from './shared/interactions/command-interaction-handler.js';
import { MessageInteractionHandler } from './shared/interactions/message-interaction-handler.js';
import { ComponentInteractionHandler } from './shared/interactions/component-interaction-handler.js';
import { RegisterCommands } from './shared/commands/register-commands.js';
import { ModalInteractionHandler } from './shared/interactions/modal-interaction-handler.js';
import { Command } from './shared/commands/command.js';
import { FrameDataCommand } from './features/frame-data/frame-data-command.js';
import { CrouchCancelCommand } from './features/knockback/crouch-cancel-command.js';
import { ReportCommand } from './features/report/report-command.js';
import { ASDIDownCommand } from './features/knockback/asdi-down-command.js';
import { CharacterCommand } from './features/character/character-command.js';
import { AutoCompleteInteractionHandler } from './shared/interactions/auto-complete-interaction-handler.js';
import { SearchStep } from './shared/search/search-step.js';
import { UniqueMoveSearch } from './shared/search/steps/unique-move-search.js';
import { FullSearch } from './shared/search/full-search.js';

const container = new Container();
container.bind<FailureStore>(FailureStore).toSelf().inSingletonScope();
container.bind<Logger>(Symbols.Logger).toConstantValue(LogSingleton.getLogger());
container.bind<Loader>(Loader).toSelf().inSingletonScope();
container.bind<AliasParser>(AliasParser).toSelf().inSingletonScope();
container.bind<Search>(Search).toSelf().inSingletonScope();
container.bind<Container>(Container).toConstantValue(container);
container.bind<DiscordClient>(DiscordClient).toSelf();

container.bind<SearchStep>('SearchSteps').to(UniqueMoveSearch);
container.bind<FullSearch>(FullSearch).toSelf().inSingletonScope();

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
