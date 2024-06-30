import { inject, injectable } from 'inversify';
import { KnockbackEmbedCreator } from '../embeds/knockback-embed-creator';
import { KnockbackCommand } from './knockback-command';
import { ASDIDownEmbedCreator } from '../embeds/asdi-down-embed-creator';
import { Logger } from 'winston';
import { Symbols } from '../config/symbols';
import { Loader } from '../data/loader';
import { Search } from '../data/search';

@injectable()
export class ASDIDownCommand extends KnockbackCommand {
  constructor(search: Search, @inject(Symbols.Logger) logger: Logger, @inject(Loader) loader: Loader) {
    super(search, logger, loader);
  }

  embedCreator: KnockbackEmbedCreator = new ASDIDownEmbedCreator();
  get commandNames(): string[] {
    return ['asdi'];
  }
}
