import { Standings } from './standings';

export interface Event {
  id: number;
  name: string;
  type: number;
  standings: Standings;
}
