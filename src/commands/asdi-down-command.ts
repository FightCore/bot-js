import { inject, injectable } from 'inversify';
import { KnockbackEmbedCreator } from '../embeds/knockback-embed-creator';
import { KnockbackCommand } from './knockback-command';
import { ASDIDownEmbedCreator } from '../embeds/asdi-down-embed-creator';
import { Loader } from '../data/loader';
import { Search } from '../data/search';

@injectable()
export class ASDIDownCommand extends KnockbackCommand {
  constructor(search: Search, @inject(Loader) loader: Loader) {
    super(search, loader);
  }

  embedCreator: KnockbackEmbedCreator = new ASDIDownEmbedCreator();
  get commandNames(): string[] {
    return ['asdi'];
  }
}
