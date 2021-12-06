import { Hitbox } from './hitbox';

export interface Move {
  id: number;
  name: string;
  normalizedName: string;
  hitboxes: Hitbox[];
  landLag?: number;
  lCanceledLandLag?: number;
  totalFrames: number;
  iasa?: number;
  autoCancelBefore?: number;
  autoCancelAfter?: number;
  start?: number;
  end?: number;
  type: number;
  notes?: string;
  percent?: string;
  source: string;
}
