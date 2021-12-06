export interface Hitbox {
  id: number;
  name: string;
  damage: number;
  angle: number;
  knockbackGrowth: number;
  setKnockback: number;
  baseKnockback: number;
  effect: string;
  hitlagAttacker: number;
  hitlagDefender: number;
  shieldstun: number;
}
