import { inject, injectable } from 'inversify';
import { BaseInteractionHandler } from './base-interaction-handler';
import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, Client } from 'discord.js';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { FailureStore } from '../data/failure-store';
import { Search } from '../data/search';
import { Loader } from '../data/loader';
import { SearchResultType } from '../models/search/search-result-type';
import { Move } from '../models/move';

@injectable()
export class AutoCompleteInteractionHandler extends BaseInteractionHandler {
  constructor(
    search: Search,
    @inject(Symbols.Logger) logger: Logger,
    failureStore: FailureStore,
    @inject(Symbols.Client) private client: Client,
    private loader: Loader
  ) {
    super(search, logger, failureStore);
  }

  async handle(autoCompleteInteraction: AutocompleteInteraction): Promise<void> {
    const focusedValue = autoCompleteInteraction.options.getFocused(true);
    if (focusedValue.name === 'move') {
      await this.handleMoveInteraction(autoCompleteInteraction);
      return;
    }

    await this.handleCharacterInteraction(autoCompleteInteraction);
  }

  private async handleMoveInteraction(autoCompleteInteraction: AutocompleteInteraction): Promise<void> {
    const focusedValue = autoCompleteInteraction.options.getFocused(true);
    const characterText = autoCompleteInteraction.options.getString('character', true);
    const result = this.search.search(characterText + ' ' + focusedValue.value);

    if (result.type === SearchResultType.Move) {
      let moves: Move[];
      if (result.possibleMoves && result.possibleMoves.length > 0) {
        moves = result.possibleMoves;
      } else {
        moves = [result.move];
      }
      await this.respond(
        autoCompleteInteraction,
        moves.map((move) => ({
          name: move.name,
          value: move.normalizedName,
        }))
      );

      return;
    }

    await this.respond(autoCompleteInteraction, []);
  }

  private async handleCharacterInteraction(autoCompleteInteraction: AutocompleteInteraction): Promise<void> {
    const focusedValue = autoCompleteInteraction.options.getFocused(true);
    const characters = this.search.searchForCharacter(focusedValue.value.split(' '));
    await this.respond(
      autoCompleteInteraction,
      characters.map((character) => ({ name: character.name, value: character.normalizedName }))
    );
  }

  private async respond(
    autoCompleteInteraction: AutocompleteInteraction,
    options: ApplicationCommandOptionChoiceData<string>[]
  ): Promise<void> {
    if (options.length > 25) {
      options = options.slice(0, 25);
    }

    await autoCompleteInteraction.respond(options);
  }
}
