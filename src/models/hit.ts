import { Hitbox } from './hitbox';

export interface Hit {
  id: number;
  start: number;
  end: number;
  name?: string;
  hitboxes: Hitbox[];
  moveId?: number;
}
