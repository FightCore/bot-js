import { inject, injectable } from 'inversify';
import { KnockbackCommand } from './knockback-command';
import { KnockbackEmbedCreator } from '../embeds/knockback-embed-creator';
import { CrouchCancelEmbedCreator } from '../embeds/crouch-cancel-embed-creator';
import { Loader } from '../data/loader';
import { Search } from '../data/search';

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
