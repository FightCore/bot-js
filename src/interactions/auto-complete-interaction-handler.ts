import { inject, injectable } from 'inversify';
import { BaseInteractionHandler } from './base-interaction-handler';
import { AutocompleteInteraction, Client } from 'discord.js';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { FailureStore } from '../data/failure-store';
import { Search } from '../data/search';

@injectable()
export class AutoCompleteInteractionHandler extends BaseInteractionHandler {
  constructor(
    search: Search,
    @inject(Symbols.Logger) logger: Logger,
    failureStore: FailureStore,
    @inject(Symbols.Client) private client: Client
  ) {
    super(search, logger, failureStore);
  }

  async handle(autoCompleteInteraction: AutocompleteInteraction): Promise<void> {
    const focusedValue = autoCompleteInteraction.options.getFocused();
    const characters = this.search.searchForCharacter(focusedValue.split(' '));
    await autoCompleteInteraction.respond(
      characters.map((character) => ({ name: character.name, value: character.normalizedName }))
    );
  }
}
