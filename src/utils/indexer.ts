import { Client } from '@elastic/elasticsearch';
import { Character } from '../models/character';
import { Move } from '../models/move';

export class Indexer {
  client?: Client;

  async indexMove(character: Character, move: Move): Promise<void> {
    this.initialize();

    await this.client?.index({
      index: 'logs-fc',
      document: {
        character: character.name,
        move: move.name,
      },
    });
  }

  private initialize(): void {
    if (!process.env.ELASTIC_NODE || !process.env.ELASTIC_API_KEY || this.client) {
      return;
    }

    this.client = new Client({
      node: process.env.ELASTIC_NODE,
      auth: {
        apiKey: process.env.ELASTIC_API_KEY as string,
      },
    });
  }
}
