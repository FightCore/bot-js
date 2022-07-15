import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { Character } from '../models/character';
import { MoveType } from '../models/move-type';
import { BaseEmbedCreator } from './base-embed-creator';

export class MoveListEmbedCreator extends BaseEmbedCreator {
  private botName: string;
  private character: Character;
  constructor(character: Character) {
    super();
    this.botName = process.env.BOT_NAME ?? 'FightCore';
    this.character = character;
  }

  public create(): MessageEmbed[] {
    const fields: EmbedFieldData[] = [];
    const categories = [
      { name: 'Tilts', type: MoveType.tilt },
      { name: 'Grounded', type: MoveType.grounded },
      { name: 'Air', type: MoveType.air },
      { name: 'Special', type: MoveType.special },
      { name: 'Throw', type: MoveType.throw },
      { name: 'Grab', type: MoveType.grab },
      { name: 'Dodge', type: MoveType.dodge },
      { name: 'Tech', type: MoveType.tech },
      { name: 'Edge Attacks', type: MoveType.edgeAttack },
      { name: 'Unknown', type: MoveType.unknown },
      { name: 'Techs', type: MoveType.tech },
      { name: 'Item', type: MoveType.item },
    ];

    for (const category of categories) {
      const field = this.createField(category.type, category.name);
      if (field) {
        fields.push(field);
      }
    }
    return [this.baseEmbed().setTitle(`${this.character.name}'s Moves`).setFields(fields)];
  }

  private createField(type: MoveType, name: string): EmbedFieldData | undefined {
    const tilts = this.character.moves.filter((move) => move.type === type);
    if (tilts.length === 0) {
      return undefined;
    }

    return {
      name: name,
      value: tilts.map((move) => move.name).join('\n'),
      inline: true,
    };
  }
}
