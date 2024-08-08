import { Hit } from './hit';
import { MoveType } from './move-type';

export interface Move {
  id: number;
  name: string;
  normalizedName: string;
  hits: Hit[];
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
