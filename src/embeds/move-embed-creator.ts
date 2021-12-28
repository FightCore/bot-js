import {
  MessageEmbed,
  EmbedFieldData,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} from 'discord.js';
import { Character } from '../models/character';
import { Hitbox } from '../models/hitbox';
import { Move } from '../models/move';
import { MoveType } from '../models/move-type';

export class MoveEmbedCreator {
  private readonly move: Move;
  private readonly character: Character;

  constructor(move: Move, character: Character) {
    this.move = move;
    this.character = character;
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
        value:
          this.getHitboxes(this.move.hitboxes) +
          `**Source:** [IKneeData](https://www.ikneedata.com)`,
        inline: false,
      });
    }

    const moveEmbed = new MessageEmbed()
      .setTitle(`${this.character.name} - ${this.move.name}`)
      .setURL(this.move.source)
      // TODO: Do not hardcode this somehow.
      .setColor('#e74c3c')
      .setImage(
        `https://i.fightcore.gg/melee/moves/${this.character.normalizedName}/${this.move.normalizedName}.gif`
      )
      // TODO: Replace with actual currect version of the bot.
      .setFooter(
        'FightCore Bot Version 2.0.0',
        'https://i.fightcore.gg/clients/fightcore.png'
      )
      .setTimestamp()
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
      this.character.moves.findIndex(
        (groundedMove) =>
          groundedMove.normalizedName === 'a' + this.move.normalizedName
      ) !== -1
    ) {
      result.push(
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(
              `${this.character.normalizedName} a${this.move.normalizedName}`
            )
            .setLabel('Aerial version')
            .setStyle('PRIMARY')
        )
      );
    }

    // Check if there are any moves that were seen as possible for this query.
    if (possibleMoves) {
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

    let result = '';
    for (const property of properties) {
      const textValue = this.createLine(property.title, property.value);
      if (textValue) {
        result += textValue + '\n';
      }
    }

    return result;
  }

  private createLine(
    title: string,
    value?: string | number
  ): string | undefined {
    if (!value) {
      return undefined;
    }

    return `**${title}**: ${value}`;
  }
}
