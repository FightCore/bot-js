import axios from 'axios';
import { Character } from '../models/character';

export class Loader {
  private characters: Character[] = [];
  get data(): Character[] {
    return this.characters;
  }

  async load(): Promise<void | Character[]> {
    const result = await axios.get('https://api.fightcore.gg/framedata/moves');
    this.characters = result.data as Character[];
  }
}
