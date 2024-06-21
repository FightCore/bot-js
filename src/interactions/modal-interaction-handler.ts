import { ModalSubmitInteraction } from 'discord.js';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { FailureStore } from '../data/failure-store';
import { Search } from '../data/search';
import { BaseInteractionHandler } from './base-interaction-handler';
import { Database } from 'sqlite3';

@injectable()
export class ModalInteractionHandler extends BaseInteractionHandler {
  constructor(search: Search, @inject(Symbols.Logger) logger: Logger, failureStore: FailureStore) {
    super(search, logger, failureStore);
  }

  async handle(modalSubmit: ModalSubmitInteraction): Promise<void> {
    const db = new Database(process.env.REPORT_DATABASE as string);
    const statement = db.prepare('INSERT INTO reports (character_name, move_name, issue) VALUES (?, ?, ?)');
    statement.run(
      modalSubmit.fields.getTextInputValue('report_character_input'),
      modalSubmit.fields.getTextInputValue('report_move_input'),
      modalSubmit.fields.getTextInputValue('report_issue_input')
    );
    statement.finalize();
    db.close();

    modalSubmit.reply({ content: 'Your report has been processed, thank you for the feedback!', ephemeral: true });
  }
}
