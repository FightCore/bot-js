import { MessageEmbed, EmbedFieldData } from 'discord.js';
import { Character } from '../models/character';
import { Hitbox } from '../models/hitbox';
import { Move } from '../models/move';

export class MoveEmbedCreator {
  private readonly move: Move;
  private readonly character: Character;

  constructor(move: Move, character: Character) {
    this.move = move;
    this.character = character;
  }

  public create(): MessageEmbed[] {
    const moveEmbedFields: EmbedFieldData[] = [
      {
        name: 'Move',
        value: this.getMove(this.move),
        inline: true,
      },
      {
        name: 'Hitboxes',
        value: this.getHitbox(this.move.hitboxes[0]),
        inline: true,
      },
    ];

    const moveEmbed = new MessageEmbed()
      .setTitle(this.move.name)
      .setAuthor(
        'FightCore.gg',
        'https://i.fightcore.gg/clients/fightcore.png',
        'https://fightcore.gg'
      )
      .setColor('#e74c3c')
      .setImage(
        `https://i.fightcore.gg/melee/moves/${this.character.normalizedName}/${this.move.normalizedName}.gif`
      )
      .addFields(moveEmbedFields);

    return [moveEmbed];
  }

  private getMove(move: Move): string {
    const properties = [
      {
        title: 'Start',
        value: move.start,
      },
      {
        title: 'End',
        value: move.end,
      },
      {
        title: 'IASA',
        value: move.iasa,
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

  private getHitbox(hitbox: Hitbox): string {
    const properties = [
      {
        title: 'Name',
        value: hitbox.name,
      },
      {
        title: 'Angle',
        value: hitbox.angle,
      },
      {
        title: 'Damage',
        value: hitbox.damage,
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
