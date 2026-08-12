import { inject, injectable } from 'inversify';
import { KnockbackEmbedCreator } from '../embeds/knockback-embed-creator.js';
import { KnockbackCommand } from './knockback-command.js';
import { ASDIDownEmbedCreator } from '../embeds/asdi-down-embed-creator.js';
import { Loader } from '../data/loader.js';
import { Search } from '../data/search.js';

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
