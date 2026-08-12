import { inject, injectable } from 'inversify';
import { KnockbackCommand } from './knockback-command.js';
import { KnockbackEmbedCreator } from '../embeds/knockback-embed-creator.js';
import { CrouchCancelEmbedCreator } from '../embeds/crouch-cancel-embed-creator.js';
import { Loader } from '../data/loader.js';
import { Search } from '../data/search.js';

@injectable()
export class CrouchCancelCommand extends KnockbackCommand {
  constructor(search: Search, @inject(Loader) loader: Loader) {
    super(search, loader);
  }

  embedCreator: KnockbackEmbedCreator = new CrouchCancelEmbedCreator();

  get commandNames(): string[] {
    return ['cc', 'crouchcancel'];
  }
}
