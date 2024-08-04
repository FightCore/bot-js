import { Hit } from '../models/hit';
import { Hitbox } from '../models/hitbox';

export function areHitboxesOfHitEqual(hit: Hit): boolean {
  return areAllHitboxesEqual(hit.hitboxes);
}

export function areAllHitboxesEqual(hitboxes: Hitbox[]): boolean {
  if (hitboxes.length == 1) {
    return true;
  }

  const firstHitbox = hitboxes[0];

  return hitboxes.slice(1).every((hitbox) => areHitboxesEqual(hitbox, firstHitbox));
}

export function areHitboxesEqual(hitboxOne: Hitbox, hitboxTwo: Hitbox): boolean {
  const attributes: (keyof Hitbox)[] = ['angle', 'damage', 'baseKnockback', 'knockbackGrowth', 'setKnockback', 'effect'];

  for (const attribute of attributes) {
    if (hitboxOne[attribute] != hitboxTwo[attribute]) {
      return false;
    }
  }

  return true;
}

export function processDuplicateHitboxes(hits: Hit[]): Hit[] {
  const newData = [];
  for (const hit of hits) {
    if (areAllHitboxesEqual(hit.hitboxes)) {
      const newHitbox = hit.hitboxes[0];
      newHitbox.name = 'All Hitboxes';
      const newHit = hit;
      newHit.hitboxes = [newHitbox];
      newData.push(newHit);
    } else {
      newData.push(hit);
    }
  }
  return newData;
}

export interface ExpandedHit extends Hit {
  timings: string[];
  aggregatedStart: number;
  aggregatedEnd: number;
}

export function processDuplicateHits(hits: Hit[]): ExpandedHit[] {
  const expandedHits = [];
  for (const hit of hits) {
    expandedHits.push({
      ...hit,
      timings: hit.start > 0 && hit.end > 0 ? [`${hit.start}-${hit.end}`] : [],
      aggregatedStart: hit.start,
      aggregatedEnd: hit.end,
    });
  }

  for (let i = expandedHits.length - 1; i > 0; i--) {
    const firstHit = expandedHits[i] as ExpandedHit;
    const secondHit = expandedHits[i - 1] as ExpandedHit;
    if (
      firstHit.hitboxes.every((hitbox) => {
        const correspondingHitbox = secondHit.hitboxes.find((secondHitbox) => secondHitbox.name === hitbox.name);
        return correspondingHitbox && areHitboxesEqual(hitbox, correspondingHitbox);
      })
    ) {
      const newHit = {
        ...firstHit,
        timings: [...secondHit.timings, ...firstHit.timings],
        aggregatedStart: Math.min(firstHit.aggregatedStart, secondHit.aggregatedStart),
        aggregatedEnd: Math.max(firstHit.aggregatedEnd, secondHit.aggregatedEnd),
      };
      expandedHits[i - 1] = newHit;
      expandedHits.splice(i, 1);
    }
  }

  return expandedHits;
}

export function areHitsEqual(hitboxesOne: Hitbox[], hitboxesTwo: Hitbox[]): boolean {
  if (hitboxesOne.length !== hitboxesTwo.length) {
    return false;
  }

  for (const hitboxOne of hitboxesOne) {
    const hitboxTwo = hitboxesTwo.find((hitboxTwo) => hitboxTwo.name === hitboxOne.name);
    if (!hitboxTwo) {
      return false;
    }

    if (!areHitboxesEqual(hitboxOne, hitboxTwo)) {
      return false;
    }
  }

  return true;
}
