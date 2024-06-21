import { Hitbox } from './hitbox';
import { MoveType } from './move-type';

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
  type: MoveType;
  notes?: string;
  percent?: string;
  source: string;
  landingFallSpecialLag: number;
  gifUrl: string;
}
