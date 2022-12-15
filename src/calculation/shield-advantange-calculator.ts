// Large inspiration has come from this RadarSSBM video:
// https://www.youtube.com/watch?v=obxZu6lADi4
// The calculations within this file aren't perfect due to the complexity of
// shield advantage and everything surrounding it, our goal is just to provide a
// approximation.

import { Hitbox } from '../models/hitbox';
import { Move } from '../models/move';
import { MoveType } from '../models/move-type';

export class ShieldAdvantageCalculator {
  static calculate(move: Move, hitbox: Hitbox): number | null {
    const punishableFrames = this.calculatePunishableFrames(move, hitbox);

    // Reverse the punishable frames, this is how people see shield advantage.
    if (punishableFrames !== null) {
      return punishableFrames * -1;
    }

    return null;
  }

  static calculatePunishableFrames(move: Move, hitbox: Hitbox): number | null {
    // If a move does not have a start, there is nothing we can do.
    switch (move.type) {
      case MoveType.air:
        return this.calculatePunishableFramesAir(move, hitbox);
      // These are considered grounded moves
      case MoveType.grounded:
      case MoveType.tilt:
        return this.calculatePunishableFramesGround(move, hitbox);
      case MoveType.special:
        // Special moves like asideb aupb adownb are considered aerials.
        if (move.normalizedName.startsWith('a')) {
          return this.calculatePunishableFramesAir(move, hitbox);
        }

        return this.calculatePunishableFramesGround(move, hitbox);
      default:
        return null;
    }
  }

  private static calculatePunishableFramesGround(move: Move, hitbox: Hitbox): number | null {
    if (!move.start) {
      return null;
    }

    // Grounded moves work with the following formula:
    // (IASA or TotalFrames) - first frame - shieldstun - 1
    // The -1 here is doen cause else we calculate the frame the character is
    // actionable.
    if (move.iasa) {
      return move.iasa - 1 - move.start! - hitbox.shieldstun;
    } else {
      return move.totalFrames - 1 - move.start! - hitbox.shieldstun;
    }
  }

  private static calculatePunishableFramesAir(move: Move, hitbox: Hitbox): number | null {
    if (!move.start) {
      return null;
    }

    // Check if the move has L Cancel Land Lag.
    // The special case here would be Game & Watch that has land lag but not
    // l cancel land lag.
    // For aerials we take the most optimal shield advantage calculation.
    // This is (l-canceled) land lag - shield stun
    if (move.lCanceledLandLag) {
      return move.lCanceledLandLag - hitbox.shieldstun;
    }
    if (move.landLag) {
      return move.landLag - hitbox.shieldstun;
    }

    return null;
  }
}
