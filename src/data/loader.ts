import axios from 'axios';
import { Character } from '../models/character';

export class Loader {
  private characters: Character[] = [];
  get data(): Character[] {
    return this.characters;
  }

  load(): Promise<void | Character[]> {
    return axios.get('https://api.fightcore.gg/framedata/moves').then((res) => {
      this.characters = res.data as Character[];
    });
  }
}
