import { Hitbox } from './hitbox';

export interface Hit {
  start: number;
  end: number;
  name: string;
  hitboxes: Hitbox[];
}
