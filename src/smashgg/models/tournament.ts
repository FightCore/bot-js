import { Event } from './event';
import { Image } from './image';

export interface Tournament {
  id: number;
  name: string;
  slug: string;
  events: Event[];
  venueAddress: string;
  images: Image[];
  startAt: Date;
  numAttendees: number;
}
