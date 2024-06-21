import {
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  APIEmbedField,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import { YoshiArmorBreakCalculator } from '../calculation/yoshi-armor-break-calculator';
import { Character } from '../models/character';
import { Hitbox } from '../models/hitbox';
import { Move } from '../models/move';
import { MoveType } from '../models/move-type';
import { BaseEmbedCreator } from './base-embed-creator';
import { HitlagFieldCreator } from './field-creator/hitlag-field-creator';
import { ShieldAdvantageFieldCreator } from './field-creator/shield-advantage-field-creator';
import { BodyFormatter } from './formatting/body-formatter';
import { InfoLine } from './formatting/info-line';
import { LineProperty } from './formatting/line-property';

export class MoveEmbedCreator extends BaseEmbedCreator {
  private readonly move: Move;
  private readonly character: Character;
  private readonly embedColor: ColorResolvable;

  constructor(move: Move, character: Character) {
    super();
    this.move = move;
    this.character = character;
    this.embedColor = (process.env.EMBED_COLOR as ColorResolvable) ?? '#a9e5fd';
  }

  public createEmbed(): EmbedBuilder[] {
    const moveEmbedFields: APIEmbedField[] = [];
    const moveData = this.getMove(this.move);

    if (moveData) {
      moveEmbedFields.push({
        name: 'Frame data',
        value: moveData,
        inline: true,
      });
    }

    if (this.move.hitboxes && this.move.hitboxes.length > 0) {
      moveEmbedFields.push({
        name: 'Hitbox summary',
        value: this.getHitboxes(this.move.hitboxes),
        inline: true,
      });

      const hitlagInfo = HitlagFieldCreator.createHitlagFields(this.move.hitboxes);
      const shieldAdvantageInfo = ShieldAdvantageFieldCreator.createShieldAdvantageField(this.move.hitboxes, this.move);
      if (hitlagInfo || shieldAdvantageInfo) {
        let text = InfoLine.createLine({
          title: 'Name',
          value: this.move.hitboxes.map((hitbox) => hitbox.name).join('/'),
        }) as string;

        if (hitlagInfo) {
          text += '\n' + hitlagInfo;
        }
        if (shieldAdvantageInfo) {
          text += '\n' + shieldAdvantageInfo;
        }

        if (YoshiArmorBreakCalculator.shouldCalculate(this.move)) {
          const armorBreaks = this.move.hitboxes.map((hitbox) => YoshiArmorBreakCalculator.calculate(hitbox));
          if (!armorBreaks.every((armorBreak) => armorBreak === null)) {
            text +=
              '\n' +
              InfoLine.createLine({
                title: 'Yoshi DJ Armor Break',
                value: armorBreaks.map((armorBreak) => armorBreak ?? ' N/A ').join('/'),
              });
          }
        }

        moveEmbedFields.push({
          name: 'Other info',
          value: text,
          inline: true,
        });

        if (shieldAdvantageInfo) {
          const explanation = `Please note that the shield advantage calculation is done assuming the frame 1 hit case and WILL be inaccurate.
          For more information check out this [RadarSSBM Video on Shield Advantage](https://www.youtube.com/watch?v=obxZu6lADi4)`;

          moveEmbedFields.push({
            name: 'Shield advantage',
            value: explanation,
            inline: true,
          });
        }
      }
    }

    const moveEmbed = this.baseEmbed()
      .setTitle(`${this.character.name} - ${this.move.name}`)
      .setURL(
        `https://fightcore.gg/characters/${this.character.normalizedName}/moves/${this.move.normalizedName}?referer=fightcore_bot`
      )
      .setColor(this.embedColor)
      .addFields(moveEmbedFields);

    if (this.move.gifUrl) {
      moveEmbed.setImage(this.move.gifUrl);
    } else {
      moveEmbed.addFields({
        name: 'No GIF available',
        value: 'There is no GIF available for this move. Visit https://www.fightcore.gg to help us out.',
      });
    }

    // Return the embed inside of an array.
    // Multiple embeds could be created and returned but this is not needed for this use case.
    return [moveEmbed];
  }

  public createButtons(possibleMoves?: Move[]): ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] {
    const result: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] = [];

    // Check if its a special
    // Does not start with a (aerial moves always start with 'a' like 'aupb', 'asideb', etc)
    if (
      this.move.type === MoveType.special &&
      this.move.normalizedName.startsWith('a') &&
      // Find the aerial move that corresponds with the provided grounded move.
      this.character.moves.findIndex((groundedMove) => groundedMove.normalizedName === 'a' + this.move.normalizedName) !== -1
    ) {
      result.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`${this.character.normalizedName} a${this.move.normalizedName}`)
            .setLabel('Aerial version')
            .setStyle(ButtonStyle.Primary)
        )
      );
    }

    // Check if there are any moves that were seen as possible for this query.
    if (possibleMoves && possibleMoves.length > 0) {
      // Push a new row.
      result.push(
        // Add the select menu to the row.
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            // Set the select id to later query for.
            .setCustomId('select')
            .setPlaceholder('Select the correct move.')
            // Add options for each possible move.
            .addOptions(
              possibleMoves.map((move) => {
                return {
                  label: move.name,
                  description: move.name,
                  value: `${this.character.normalizedName} ${move.normalizedName}`,
                  customId: `${this.character.normalizedName} ${move.normalizedName}`,
                };
              })
            )
        )
      );
    }

    return result;
  }

  private getMove(move: Move): string {
    const hitFrameData = [];
    if (move.start && move.end) {
      hitFrameData.push({
        title: 'Hit',
        value: `${move.start}-${move.end}`,
      });
    } else if (move.start) {
      hitFrameData.push({
        title: 'Hit start',
        value: move.start,
      });
    } else if (move.end) {
      hitFrameData.push({
        title: 'Hit end',
        value: move.end,
      });
    }

    const properties = [
      {
        title: 'Total frames',
        value: move.totalFrames,
      },
      ...hitFrameData,
      {
        title: 'IASA',
        value: move.iasa === 0 ? undefined : move.iasa,
      },
      {
        title: 'Auto cancel before',
        value: move.autoCancelBefore,
      },
      {
        title: 'Auto cancel after',
        value: move.autoCancelAfter,
      },
      {
        title: 'Land lag',
        value: move.landLag,
      },
      {
        title: 'L-canceled land lag',
        value: move.lCanceledLandLag,
      },
      {
        title: 'Landing Fall Special Lag',
        value: move.landingFallSpecialLag,
      },
      {
        title: 'Auto cancel before',
        value: move.autoCancelBefore,
      },
      {
        title: 'Auto cancel after',
        value: move.autoCancelAfter,
      },
      {
        title: 'Notes',
        value: move.notes,
      },
    ];

    return BodyFormatter.create(properties) as string;
  }

  private getHitboxes(hitboxes: Hitbox[]): string {
    const properties: LineProperty[] = [
      {
        title: 'Name',
        value: hitboxes.map((hitbox) => hitbox.name).join('/'),
      },
      {
        title: 'GIF Colors',
        value: 'id0=Red, id1=Green, id2=Purple, id3=Orange',
      },
      {
        title: 'Damage',
        value: hitboxes.map((hitbox) => hitbox.damage).join('/'),
      },
      {
        title: 'Angle',
        value: hitboxes.map((hitbox) => hitbox.angle).join('/'),
      },
      {
        title: 'Effect',
        value: hitboxes.map((hitbox) => hitbox.effect).join('/'),
      },
      {
        title: 'Base knockback',
        value: hitboxes.map((hitbox) => hitbox.baseKnockback).join('/'),
      },
      {
        title: 'Knockback growth',
        value: hitboxes.map((hitbox) => hitbox.knockbackGrowth).join('/'),
      },
      {
        title: 'Set knockback',
        value: hitboxes.map((hitbox) => hitbox.setKnockback).join('/'),
      },
      {
        title: 'Shieldstun',
        value: hitboxes.map((hitbox) => hitbox.shieldstun).join('/'),
      },
    ];

    return BodyFormatter.create(properties) as string;
  }
}
