import { Hitbox } from '../models/hitbox';
import { Move } from '../models/move';
import { MoveType } from '../models/move-type';

export class YoshiArmorBreakCalculator {
  static shouldCalculate(move: Move): boolean {
    // Wouldn't make sense to calculate yoshi armor break percentage for throws.
    return (
      move.type === MoveType.grounded ||
      move.type === MoveType.special ||
      move.type === MoveType.air ||
      move.type === MoveType.tilt
    );
  }

  static calculate(hitbox: Hitbox): string | null {
    // Knockback growth is needed for this formula, considering knockback is calculated by dividing by it.
    // Set knockback is not taken into consideration for this formula, need to research one that does work.
    if (hitbox.knockbackGrowth === 0 || hitbox.setKnockback !== 0) {
      return null;
    }

    // Yoshi has double jump armor, for a basic rule:
    // If 120 - the hitbox's knockback is a negative number, Yoshi will not flinch.
    // Meaning 120+ will make Yoshi flinch.
    // The knockback formula for Melee is as follows:
    // https://www.ssbwiki.com/Knockback#Melee_onward
    // ((((p/10 + (p*d)/20) * 200 / (w+100) * 1.4) + 18 ) * (s/100) ) + b ) * 1) = k
    // Note: that the s/100 is displayed as s within the wiki but the comments declare it to be divided by 100.
    // We want to know what the percentage is before the damage is applied.
    // It would be hard for someone to remove the damage and basically calculate it themselves.
    // (((((p+d)/10 + ((p+d)*d)/20) * 200 / (w+100) * 1.4) + 18 ) * (s/100) ) + b ) * 1) = k
    // Finally, we can set some standard values that are dependant on the game state and Yoshi.
    // w (Weight) is 108 for Yoshi
    // k (Knockback) is 120 as it is our desired knockback
    // r is a series of settings that are used outside of a tournament setting,
    // within a tournament setting, this should always be 1.
    // ((((((p+d)/10 + ((p+d)*d)/20) * ((200 / (w+100) * 1.4)) + 18) * (s/100)) + b) * 1 = 120
    // Taking Zelda's Fair as an example:
    // d = 10, s = 80, b = 0
    // ((((((p+10)/10 + ((p+10)*10)/20) * ((200 / (108+100) * 1.4)) + 18) * 0.8) + 0) * 1 = 120
    // Running this through some equation solver websites (I'm lazy and incredibly bad at math)
    // https://www.mathpapa.com/equation-solver/
    // 0.646154p + 20.861538 = 120
    // p = 153.428571
    // This is the same result as the formula found within the Google Docs spreadsheet made by DD151
    // https://docs.google.com/spreadsheets/d/1gEOfysyzR52BnrcSAdWj-ucUG4wLO-33HT1D52_tx6o/
    // Sourced from: https://smashboards.com/threads/some-yoshi-information.351635/
    // =============================================================================================
    // ((((((p+d)/10 + ((p+d)*d)/20) * ((200 / (w+100) * 1.4)) + 18) * (s/100)) + b) * 1 = 120
    // This concludes that the following formula is able to get p:
    // (208/14) * (((100 / s) * (120 - b) - 18) / (d + 2)) - d = p
    // Thank you for listening to my Ted talk, here is the one line of code that actually matters
    return (
      (208 / 14) * (((100 / hitbox.knockbackGrowth) * (120 - hitbox.baseKnockback) - 18) / (hitbox.damage + 2)) -
      hitbox.damage
    ).toFixed(2);
  }
}
