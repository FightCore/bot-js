import {
  ColorResolvable,
  ButtonBuilder,
  ButtonStyle,
  APIEmbedField,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} from 'discord.js';
import { Character } from '../../shared/models/character.js';
import { Hitbox } from '../../shared/models/hitbox.js';
import { Move } from '../../shared/models/move.js';
import { MoveType } from '../../shared/models/move-type.js';
import { BaseEmbedCreator } from '../../shared/embeds/base-embed-creator.js';
import { BodyFormatter } from '../../shared/embeds/formatting/body-formatter.js';
import { LineProperty } from '../../shared/embeds/formatting/line-property.js';
import { versionNumber } from '../../shared/version-number.js';
import { getMoveLink } from '../../shared/utils/fightcore-link.js';
import { processDuplicateHitboxes, processDuplicateHits } from '../../shared/utils/hitbox-utils.js';
import { HitlagFieldCreator } from './field-creator/hitlag-field-creator.js';
import { ShieldAdvantageFieldCreator } from './field-creator/shield-advantage-field-creator.js';
import { fixUniqueMoves } from './data/unique-move-fixes.js';

export class MoveEmbedCreator extends BaseEmbedCreator {
  private move: Move;
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
    this.move = fixUniqueMoves(this.move, this.character);
    const moveData = this.getMove(this.move);

    if (this.move.hits && this.move.hits.length > 0) {
      moveEmbedFields.push(...this.createHitboxEmbedFields());
    }
    if (this.move.gifUrl) {
      moveEmbedFields.push({
        name: 'Hitbox Colors',
        value: 'id0=Red, id1=Green, id2=Purple, id3=Orange',
      });
    }

    const moveEmbed = this.baseEmbed()
      .setTitle(`${this.character.name} - ${this.move.name}`)
      .setURL(getMoveLink(this.character, this.move))
      .setColor(this.embedColor)
      .addFields(moveEmbedFields);

    if (moveData) {
      moveEmbed.setDescription(moveData);
    }

    if (this.move.gifUrl) {
      moveEmbed.setImage(this.move.gifUrl + `?version=${versionNumber}`);
    } else {
      moveEmbed.addFields({
        name: 'No GIF available',
        value: 'There is no GIF available for this move.',
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
      !this.move.normalizedName.startsWith('a') &&
      // Find the aerial move that corresponds with the provided grounded move.
      this.character.moves.some((groundedMove) => groundedMove.normalizedName === 'a' + this.move.normalizedName)
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

  private createHitboxEmbedFields(): APIEmbedField[] {
    const fields: APIEmbedField[] = [];
    const hits = processDuplicateHits(processDuplicateHitboxes(this.move.hits));
    for (const hit of hits) {
      let name = hit.name ? hit.name : `Frames ${hit.aggregatedStart} - ${hit.aggregatedEnd}`;
      if (name === 'unknown') {
        name = 'All hits';
      }
      let hitsInfo = '';
      if (hit.timings.length > 1) {
        hitsInfo = '**Hits**: ' + hit.timings.join(', ') + '\n';
      }

      const hitboxInfo = this.getHitboxes(hit.hitboxes);
      const hitlagInfo = HitlagFieldCreator.createHitlagFields(hit.hitboxes);
      const shieldAdvantageInfo = ShieldAdvantageFieldCreator.createShieldAdvantageField(hit.hitboxes, this.move);

      let text = hitsInfo + hitboxInfo;
      if (hitlagInfo) {
        text += '\n' + hitlagInfo;
      }
      if (shieldAdvantageInfo) {
        text += '\n' + shieldAdvantageInfo;
      }

      fields.push({
        name: name,
        value: text,
        inline: true,
      });
    }

    return fields;
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
    hitboxes = hitboxes.sort((a, b) => a.name.localeCompare(b.name));
    const properties: LineProperty[] = [
      {
        title: 'Name',
        value: hitboxes.map((hitbox) => hitbox.name).join('/'),
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
        // Filter out the "Normal" effects cause they don't say anything.
        value: hitboxes.map((hitbox) => (hitbox.effect === 'Normal' || hitbox.effect == '' ? null : hitbox.effect)).join('/'),
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
