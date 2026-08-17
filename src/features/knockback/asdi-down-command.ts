import { inject, injectable } from 'inversify';
import { KnockbackEmbedCreator } from './knockback-embed-creator.js';
import { KnockbackCommand } from './knockback-command.js';
import { ASDIDownEmbedCreator } from './asdi-down-embed-creator.js';
import { Loader } from '../../shared/data/loader.js';
import { FullSearch } from '../../shared/search/full-search.js';

@injectable()
export class ASDIDownCommand extends KnockbackCommand {
  constructor(search: FullSearch, @inject(Loader) loader: Loader) {
    super(search, loader);
  }

  embedCreator: KnockbackEmbedCreator = new ASDIDownEmbedCreator();
  get commandNames(): string[] {
    return ['asdi'];
  }
}
