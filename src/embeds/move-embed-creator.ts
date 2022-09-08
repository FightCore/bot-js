import { MessageEmbed, EmbedFieldData, MessageActionRow, MessageButton, MessageSelectMenu, ColorResolvable } from 'discord.js';
import { Character } from '../models/character';
import { Hitbox } from '../models/hitbox';
import { Move } from '../models/move';
import { MoveType } from '../models/move-type';
import { BaseEmbedCreator } from './base-embed-creator';

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

  public createEmbed(): MessageEmbed[] {
    const moveEmbedFields: EmbedFieldData[] = [
      {
        name: 'Frame data',
        value: this.getMove(this.move) + `[Source](${this.move.source})`,
        inline: true,
      },
    ];

    if (this.move.hitboxes && this.move.hitboxes.length > 0) {
      moveEmbedFields.push({
        name: 'Hitbox summary',
        value: this.getHitboxes(this.move.hitboxes) + `**Source:** [IKneeData](https://www.ikneedata.com)`,
        inline: true,
      });
    }

    const moveEmbed = this.baseEmbed()
      .setTitle(`${this.character.name} - ${this.move.name}`)
      .setURL(this.move.source)
      .setColor(this.embedColor)
      .setImage(`https://i.fightcore.gg/melee/moves/${this.character.normalizedName}/${this.move.normalizedName}.gif`)
      .addFields(moveEmbedFields);

    // Return the embed inside of an array.
    // Multiple embeds could be created and returned but this is not needed for this use case.
    return [moveEmbed];
  }

  public createButtons(possibleMoves?: Move[]): MessageActionRow[] {
    const result: MessageActionRow[] = [];

    // Check if its a special
    // Does not start with a (aerial moves always start with 'a' like 'aupb', 'asideb', etc)
    if (
      this.move.type === MoveType.special &&
      this.move.normalizedName[0] !== 'a' &&
      // Find the aerial move that corresponds with the provided grounded move.
      this.character.moves.findIndex((groundedMove) => groundedMove.normalizedName === 'a' + this.move.normalizedName) !== -1
    ) {
      result.push(
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`${this.character.normalizedName} a${this.move.normalizedName}`)
            .setLabel('Aerial version')
            .setStyle('PRIMARY')
        )
      );
    }

    // Check if there are any moves that were seen as possible for this query.
    if (possibleMoves && possibleMoves.length > 0) {
      // Push a new row.
      result.push(
        // Add the select menu to the row.
        new MessageActionRow().addComponents(
          new MessageSelectMenu()
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
        value: move.iasa,
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

    let result = '';
    for (const property of properties) {
      const textValue = this.createLine(property.title, property.value);
      if (textValue) {
        result += textValue + '\n';
      }
    }

    return result;
  }

  private getHitboxes(hitboxes: Hitbox[]): string {
    const properties = [
      {
        title: 'Name',
        value: hitboxes.map((hitbox) => hitbox.name).join('/'),
      },
      {
        title: 'Colors',
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
      {
        title: 'Hitlag for attacker',
        value: hitboxes.map((hitbox) => this.calculateHitlag(hitbox.damage, hitbox.effect, false, false)).join('/'),
      },
      {
        title: 'Hitlag for victim',
        value: hitboxes.map((hitbox) => this.calculateHitlag(hitbox.damage, hitbox.effect, true, false)).join('/'),
      },
      {
        title: 'Hitlag for attacker (crouch canceled)',
        value: hitboxes.map((hitbox) => this.calculateHitlag(hitbox.damage, hitbox.effect, false, true)).join('/'),
      },
      {
        title: 'Hitlag for victim (crouch canceled)',
        value: hitboxes.map((hitbox) => this.calculateHitlag(hitbox.damage, hitbox.effect, true, true)).join('/'),
      },
    ];

    let result = '';
    for (const property of properties) {
      const textValue = this.createLine(property.title, property.value);
      if (textValue) {
        result += textValue + '\n';
      }
    }

    return result;
  }

  private calculateHitlag(damage: number, effect: string, isVictim: boolean, crouchCancel: boolean): number {
    if (damage === 0) {
      return 0;
    }

    // Calculate base hitlag based on damage.
    let hitlag = Math.round(damage / 3 + 3);

    if (effect === 'Electric' && isVictim) {
      hitlag = Math.round(hitlag * 1.5);
    }

    if (crouchCancel) {
      hitlag = Math.round(hitlag * 0.666667);
    }

    return hitlag >= 20 ? 20 : hitlag;
  }

  private createLine(title: string, value?: string | number): string | undefined {
    if (!value) {
      return undefined;
    }

    return `**${title}**: ${value}`;
  }
}
