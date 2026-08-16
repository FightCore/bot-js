import { Hitbox } from './hitbox.js';

export interface Hit {
  id: number;
  start: number;
  end: number;
  name?: string;
  hitboxes: Hitbox[];
  moveId?: number;
}
